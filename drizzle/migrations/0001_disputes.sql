CREATE TABLE public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  opened_by uuid NOT NULL,
  opener_role text NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  previous_booking_status text,
  resolution_note text,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.disputes TO authenticated;
GRANT ALL ON public.disputes TO service_role;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties and staff read disputes" ON public.disputes FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator')
  OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id
     AND (b.provider_id = auth.uid() OR b.customer_id = auth.uid() OR b.buyer_id = auth.uid()))
);
CREATE UNIQUE INDEX disputes_one_open_per_booking ON public.disputes(booking_id) WHERE status = 'open';
CREATE TRIGGER trg_disputes_updated BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.open_dispute(_booking_id uuid, _reason text, _details text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE b public.bookings%ROWTYPE; _role text; _id uuid; _other uuid;
BEGIN
  SELECT * INTO b FROM public.bookings WHERE id = _booking_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found.'; END IF;
  IF auth.uid() = b.provider_id THEN _role := 'provider'; _other := COALESCE(b.customer_id, b.buyer_id);
  ELSIF auth.uid() = COALESCE(b.customer_id, b.buyer_id) THEN _role := 'customer'; _other := b.provider_id;
  ELSE RAISE EXCEPTION 'You are not part of this booking.'; END IF;
  IF b.payment_status <> 'Paid' THEN RAISE EXCEPTION 'Only paid bookings still held in escrow can be disputed.'; END IF;
  IF EXISTS (SELECT 1 FROM public.disputes WHERE booking_id = _booking_id AND status = 'open') THEN
    RAISE EXCEPTION 'A dispute is already open for this booking.'; END IF;
  IF coalesce(trim(_reason),'') = '' THEN RAISE EXCEPTION 'Please choose a reason.'; END IF;
  INSERT INTO public.disputes(booking_id, opened_by, opener_role, reason, details, previous_booking_status)
  VALUES (_booking_id, auth.uid(), _role, trim(_reason), nullif(trim(coalesce(_details,'')),''), b.status::text)
  RETURNING id INTO _id;
  UPDATE public.bookings SET status = 'disputed' WHERE id = _booking_id;
  IF _other IS NOT NULL THEN
    INSERT INTO public.notifications(user_id, category, title, body, link)
    VALUES (_other, 'bookings', 'A dispute was opened',
      'A dispute was raised on ' || COALESCE(b.service_title,'a booking') || '. Payment stays in escrow until Ọjà reviews it.',
      CASE WHEN _role = 'customer' THEN '/pro/dashboard' ELSE '/dashboard' END);
  END IF;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.resolve_dispute(_dispute_id uuid, _outcome text, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE d public.disputes%ROWTYPE; b public.bookings%ROWTYPE; _buyer uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Only admins can resolve disputes.'; END IF;
  SELECT * INTO d FROM public.disputes WHERE id = _dispute_id FOR UPDATE;
  IF NOT FOUND OR d.status <> 'open' THEN RAISE EXCEPTION 'This dispute is not open.'; END IF;
  SELECT * INTO b FROM public.bookings WHERE id = d.booking_id FOR UPDATE;
  _buyer := COALESCE(b.customer_id, b.buyer_id);
  IF _outcome = 'refund' THEN
    IF b.payment_status <> 'Paid' THEN RAISE EXCEPTION 'Escrow is no longer held for this booking.'; END IF;
    INSERT INTO public.wallet_transactions(user_id, booking_id, type, status, amount_ngn, reference, metadata)
    VALUES (_buyer, b.id, 'refund', 'completed', round(b.amount)::int, 'dispute-' || d.id, jsonb_build_object('dispute_id', d.id));
    UPDATE public.bookings SET status = 'cancelled', payment_status = 'Refunded' WHERE id = b.id;
    UPDATE public.disputes SET status = 'refunded', resolution_note = _note, resolved_by = auth.uid(), resolved_at = now() WHERE id = d.id;
  ELSIF _outcome = 'release' THEN
    IF b.payment_status <> 'Paid' THEN RAISE EXCEPTION 'Escrow is no longer held for this booking.'; END IF;
    INSERT INTO public.wallet_transactions(user_id, booking_id, type, status, amount_ngn, reference, metadata)
    VALUES (b.provider_id, b.id, 'escrow_release', 'completed', round(b.payout_amount)::int, 'dispute-' || d.id, jsonb_build_object('dispute_id', d.id));
    UPDATE public.bookings SET status = 'completed', payment_status = 'Released', released_at = now() WHERE id = b.id;
    UPDATE public.disputes SET status = 'released', resolution_note = _note, resolved_by = auth.uid(), resolved_at = now() WHERE id = d.id;
  ELSIF _outcome = 'dismiss' THEN
    UPDATE public.bookings SET status = COALESCE(d.previous_booking_status,'in_progress')::booking_status WHERE id = b.id;
    UPDATE public.disputes SET status = 'dismissed', resolution_note = _note, resolved_by = auth.uid(), resolved_at = now() WHERE id = d.id;
  ELSE RAISE EXCEPTION 'Unknown outcome.'; END IF;
  INSERT INTO public.notifications(user_id, category, title, body, link)
  SELECT u, 'bookings', 'Dispute resolved',
    CASE _outcome WHEN 'refund' THEN 'The buyer was refunded to their Ọjà wallet.'
                  WHEN 'release' THEN 'Payment was released to the provider.'
                  ELSE 'The dispute was closed and the booking continues.' END
      || COALESCE(' Note: ' || _note, ''), '/wallet'
  FROM unnest(ARRAY[_buyer, b.provider_id]) u WHERE u IS NOT NULL;
END $$;

REVOKE EXECUTE ON FUNCTION public.open_dispute(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.resolve_dispute(uuid, text, text) FROM anon;