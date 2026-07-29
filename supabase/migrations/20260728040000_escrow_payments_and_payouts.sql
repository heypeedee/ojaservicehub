-- Escrow payment tracking on bookings (bookings already has no public
-- read policy — only the two participants can ever see a booking row —
-- so it's safe to add payment fields directly here)
ALTER TABLE public.bookings
  ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'Unpaid'
    CHECK (payment_status IN ('Unpaid', 'Paid', 'Released', 'Refunded')),
  ADD COLUMN paystack_reference TEXT,
  ADD COLUMN platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN payout_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN transfer_reference TEXT,
  ADD COLUMN paid_at TIMESTAMPTZ,
  ADD COLUMN released_at TIMESTAMPTZ;

CREATE UNIQUE INDEX bookings_paystack_reference_idx ON public.bookings (paystack_reference) WHERE paystack_reference IS NOT NULL;

-- Payout (bank) details live in their OWN table, deliberately separate from
-- provider_profiles, because provider_profiles is publicly readable (anyone
-- can browse a published shop). Bank account details must never be exposed
-- through that public read policy, so this table gets no anon/public policy
-- at all — only the owning provider can read or write their own row.
-- (Edge Functions use the service_role key, which bypasses RLS entirely.)
CREATE TABLE public.provider_payout_details (
  provider_id UUID PRIMARY KEY REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  bank_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  paystack_recipient_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.provider_payout_details TO authenticated;
GRANT ALL ON public.provider_payout_details TO service_role;
ALTER TABLE public.provider_payout_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payout_details_owner_only_select" ON public.provider_payout_details
  FOR SELECT TO authenticated
  USING (provider_id = auth.uid());

CREATE POLICY "payout_details_owner_only_insert" ON public.provider_payout_details
  FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "payout_details_owner_only_update" ON public.provider_payout_details
  FOR UPDATE TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

CREATE TRIGGER payout_details_set_updated_at
  BEFORE UPDATE ON public.provider_payout_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
