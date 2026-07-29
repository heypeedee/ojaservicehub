-- Admin role + account suspension
ALTER TABLE public.profiles
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN suspended BOOLEAN NOT NULL DEFAULT false;

-- SECURITY DEFINER helper so other tables' RLS policies can cheaply check
-- "is this caller an admin?" without recursing into profiles' own RLS.
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = uid), false);
$$;

-- Admins can suspend/unsuspend any account (profiles_update_own already
-- covers a user editing their own display info)
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can see every booking (customers/providers already see their own
-- via bookings_read_participants) and update status for moderation
CREATE POLICY "bookings_admin_read_all" ON public.bookings
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "bookings_admin_update_all" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admins can see and moderate any provider's shop, including unpublished
-- drafts (the public policy only shows published rows)
CREATE POLICY "provider_profiles_admin_read_all" ON public.provider_profiles
  FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "provider_profiles_admin_update_all" ON public.provider_profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

-- Category management is admin-only (there was previously no write policy
-- at all on this table — public read only)
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;

CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));
