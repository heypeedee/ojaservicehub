-- This migration targets the REAL live schema (confirmed via direct
-- inspection), which differs from earlier migrations in this folder that
-- were mistakenly run against an unrelated personal Supabase project.
-- It's additive/defensive throughout (IF NOT EXISTS, etc.) so it's safe
-- to run even if some pieces already partially exist.

-- === provider_profiles: columns the search page expects but are missing ===
ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS available_today BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS open_now BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- === profiles: account suspension (admin role itself already exists via user_roles) ===
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended BOOLEAN NOT NULL DEFAULT false;

-- === services: keep the two "is active" columns in sync going forward ===
-- The real visibility policy checks is_active; earlier code only wrote to
-- the compat "active" column, so services could silently be invisible to
-- customers. A trigger keeps both in sync regardless of which one the
-- app writes to, so this can't silently regress again.
CREATE OR REPLACE FUNCTION public.sync_service_active_flags()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.is_active := COALESCE(NEW.is_active, NEW.active, false);
    NEW.active := NEW.is_active;
  ELSE
    -- Whichever of the two the caller actually changed this statement wins,
    -- and gets copied onto the other. Prevents a write to one column from
    -- silently "un-deactivating" a service via the other's stale value.
    IF NEW.active IS DISTINCT FROM OLD.active AND NEW.is_active IS NOT DISTINCT FROM OLD.is_active THEN
      NEW.is_active := NEW.active;
    ELSIF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      NEW.active := NEW.is_active;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS services_sync_active_flags ON public.services;
CREATE TRIGGER services_sync_active_flags
  BEFORE INSERT OR UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.sync_service_active_flags();

-- Backfill: make existing rows consistent (prefer is_active if it's true,
-- otherwise fall back to whichever compat flag is true)
UPDATE public.services SET active = true, is_active = true
  WHERE active = true OR is_active = true;

-- === Escrow payment tracking on bookings ===
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'Unpaid'
    CHECK (payment_status IN ('Unpaid', 'Paid', 'Released', 'Refunded')),
  ADD COLUMN IF NOT EXISTS paystack_reference TEXT,
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transfer_reference TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS bookings_paystack_reference_idx
  ON public.bookings (paystack_reference) WHERE paystack_reference IS NOT NULL;

-- === Payout (bank) details — deliberately a separate table from ===
-- === provider_profiles, since that table is publicly readable    ===
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
  FOR SELECT TO authenticated USING (provider_id = auth.uid());

DROP POLICY IF EXISTS "payout_details_owner_only_insert" ON public.provider_payout_details;
CREATE POLICY "payout_details_owner_only_insert" ON public.provider_payout_details
  FOR INSERT TO authenticated WITH CHECK (provider_id = auth.uid());

DROP POLICY IF EXISTS "payout_details_owner_only_update" ON public.provider_payout_details;
CREATE POLICY "payout_details_owner_only_update" ON public.provider_payout_details
  FOR UPDATE TO authenticated USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payout_details_set_updated_at ON public.provider_payout_details;
CREATE TRIGGER payout_details_set_updated_at
  BEFORE UPDATE ON public.provider_payout_details
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- === Admin access, using the REAL existing has_role()/user_roles system ===
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

DROP POLICY IF EXISTS "bookings_admin_read_all" ON public.bookings;
CREATE POLICY "bookings_admin_read_all" ON public.bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "bookings_admin_update_all" ON public.bookings;
CREATE POLICY "bookings_admin_update_all" ON public.bookings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "provider_profiles_admin_read_all" ON public.provider_profiles;
CREATE POLICY "provider_profiles_admin_read_all" ON public.provider_profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "provider_profiles_admin_update_all" ON public.provider_profiles;
CREATE POLICY "provider_profiles_admin_update_all" ON public.provider_profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "services_admin_update_all" ON public.services;
CREATE POLICY "services_admin_update_all" ON public.services
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

DROP POLICY IF EXISTS "categories_admin_insert" ON public.categories;
CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "categories_admin_update" ON public.categories;
CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "categories_admin_delete" ON public.categories;
CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
