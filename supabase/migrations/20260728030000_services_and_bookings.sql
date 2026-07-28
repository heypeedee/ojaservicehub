-- Services offered by a provider
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  duration TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public can browse active services belonging to a published provider
CREATE POLICY "services_read_public" ON public.services
  FOR SELECT TO anon, authenticated
  USING (
    active = true
    AND EXISTS (SELECT 1 FROM public.provider_profiles pp WHERE pp.id = provider_id AND pp.published = true)
    OR provider_id = auth.uid()
  );

CREATE POLICY "services_insert_own" ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "services_update_own" ON public.services
  FOR UPDATE TO authenticated
  USING (provider_id = auth.uid())
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "services_delete_own" ON public.services
  FOR DELETE TO authenticated
  USING (provider_id = auth.uid());

CREATE INDEX services_provider_idx ON public.services (provider_id);

CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Bookings: a customer booking a provider (optionally for a specific service)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Confirmed', 'In progress', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.bookings TO authenticated;
GRANT UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Either side of the booking can see it
CREATE POLICY "bookings_read_participants" ON public.bookings
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR provider_id = auth.uid());

-- Only the customer can create a booking, and only as themselves
CREATE POLICY "bookings_insert_customer" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Either side can update (customer cancels; provider confirms/completes)
CREATE POLICY "bookings_update_participants" ON public.bookings
  FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR provider_id = auth.uid())
  WITH CHECK (customer_id = auth.uid() OR provider_id = auth.uid());

CREATE INDEX bookings_provider_idx ON public.bookings (provider_id);
CREATE INDEX bookings_customer_idx ON public.bookings (customer_id);

CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
