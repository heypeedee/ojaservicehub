-- Resume script: the bookings columns from this migration already
-- applied successfully in an earlier attempt. This picks up from
-- wherever it stopped, safely.

CREATE UNIQUE INDEX IF NOT EXISTS bookings_paystack_reference_idx
  ON public.bookings (paystack_reference) WHERE paystack_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.provider_payout_details (
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

DROP POLICY IF EXISTS "payout_details_owner_only_select" ON public.provider_payout_details;
CREATE POLICY "payout_details_owner_only_select" ON public.provider_payout_details
  FOR SELECT TO authenticated
  USING (provider_id = auth.uid());

DROP POLICY IF EXISTS "payout_details_owner_only_insert" ON public.provider_payout_details;
CREATE POLICY "payout_details_owner_only_insert" ON public.provider_payout_details
  FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid());

DROP POLICY IF EXISTS "payout_details_owner_only_update" ON public.provider_payout_details;
CREATE POLICY "payout_details_owner_only_update" ON public.provider_payout_details
  FOR UPDATE TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

DROP TRIGGER IF EXISTS payout_details_set_updated_at ON public.provider_payout_details;
CREATE TRIGGER payout_details_set_updated_at
  BEFORE UPDATE ON public.provider_payout_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
