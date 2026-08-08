-- 1. notification preferences
CREATE TABLE public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  channels jsonb NOT NULL DEFAULT '{}'::jsonb,
  quiet_enabled boolean NOT NULL DEFAULT true,
  quiet_from text NOT NULL DEFAULT '22:00',
  quiet_to text NOT NULL DEFAULT '07:00',
  digest text NOT NULL DEFAULT 'instant',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own prefs select" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own prefs insert" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own prefs update" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own prefs delete" ON public.notification_preferences
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER trg_notification_prefs_updated
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. read tracking for chat
ALTER TABLE public.conversation_participants
  ADD COLUMN IF NOT EXISTS last_read_at timestamptz NOT NULL DEFAULT 'epoch'::timestamptz;

CREATE POLICY "participants update own row" ON public.conversation_participants
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. notification writers (trigger-only; no client INSERT policy)
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_name text;
BEGIN
  SELECT COALESCE('@' || username, display_name, 'Someone') INTO sender_name
  FROM public.profiles WHERE id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, category, title, body, link)
  SELECT cp.user_id,
         'messages',
         COALESCE(sender_name, 'Someone') || ' sent you a message',
         COALESCE(NULLIF(left(COALESCE(NEW.body, ''), 140), ''), 'Sent an image'),
         '/messages?conversationId=' || NEW.conversation_id::text
  FROM public.conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id <> NEW.sender_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_message();

CREATE OR REPLACE FUNCTION public.notify_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  buyer uuid := COALESCE(NEW.customer_id, NEW.buyer_id);
  label text := COALESCE(NEW.service_title, 'your booking');
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, category, title, body, link)
    VALUES (NEW.provider_id, 'bookings', 'New booking request',
            'You have a new request for ' || label || '.', '/pro/dashboard');
    IF buyer IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, category, title, body, link)
      VALUES (buyer, 'bookings', 'Booking sent',
              'Your request for ' || label || ' was sent to the provider.', '/dashboard');
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF buyer IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, category, title, body, link)
      VALUES (buyer, 'bookings', 'Booking ' || NEW.status::text,
              label || ' is now ' || NEW.status::text || '.', '/dashboard');
    END IF;
    INSERT INTO public.notifications (user_id, category, title, body, link)
    VALUES (NEW.provider_id, 'bookings', 'Booking ' || NEW.status::text,
            label || ' is now ' || NEW.status::text || '.', '/pro/dashboard');
  END IF;

  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status AND lower(COALESCE(NEW.payment_status,'')) = 'paid' THEN
    INSERT INTO public.notifications (user_id, category, title, body, link)
    VALUES (NEW.provider_id, 'payments', 'Payment received',
            'Payment for ' || label || ' is held in escrow.', '/wallet');
    IF buyer IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, category, title, body, link)
      VALUES (buyer, 'payments', 'Payment confirmed',
              'Your payment for ' || label || ' is secured in escrow.', '/wallet');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_notify_insert
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking();

CREATE TRIGGER bookings_notify_update
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_booking();

CREATE OR REPLACE FUNCTION public.notify_on_wallet_txn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cat text := 'payments';
  title text;
  amount text := '₦' || to_char(NEW.amount_ngn, 'FM999,999,999');
BEGIN
  IF NEW.type = 'withdrawal' THEN
    cat := 'withdrawals';
    title := 'Withdrawal ' || NEW.status::text;
  ELSIF NEW.type = 'escrow_hold' THEN
    title := 'Escrow held';
  ELSIF NEW.type = 'escrow_release' THEN
    title := 'Escrow released';
  ELSIF NEW.type = 'tip' THEN
    title := 'You received a tip';
  ELSIF NEW.type = 'refund' THEN
    title := 'Refund processed';
  ELSE
    title := 'Wallet updated';
  END IF;

  INSERT INTO public.notifications (user_id, category, title, body, link)
  VALUES (NEW.user_id, cat, title, amount || ' — ' || NEW.status::text || '.', '/wallet');

  RETURN NEW;
END;
$$;

CREATE TRIGGER wallet_txn_notify
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_wallet_txn();

CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, category, title, body, link)
  VALUES (NEW.provider_id, 'reviews', 'New review',
          'You received a ' || NEW.rating::text || '-star review.', '/pro/dashboard');
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_notify
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_review();

-- 4. realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;