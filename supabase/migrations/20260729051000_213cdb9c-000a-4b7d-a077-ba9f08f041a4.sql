-- provider_profiles
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  tagline TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  area TEXT,
  phone TEXT,
  price_from INT,
  published BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  tier TEXT NOT NULL DEFAULT 'bronze',
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.provider_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.provider_profiles TO authenticated;
GRANT ALL ON public.provider_profiles TO service_role;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads published profiles" ON public.provider_profiles FOR SELECT TO anon, authenticated
  USING (published = true OR id = auth.uid());
CREATE POLICY "provider inserts own profile" ON public.provider_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "provider updates own profile" ON public.provider_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER trg_provider_profiles_updated BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- services compatibility columns
ALTER TABLE public.services
  ADD COLUMN category TEXT,
  ADD COLUMN price NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN duration TEXT,
  ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;

-- bookings compatibility columns
ALTER TABLE public.bookings
  ADD COLUMN customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN service_title TEXT,
  ADD COLUMN amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN location TEXT;

-- Keep customer_id in sync with buyer_id automatically
CREATE OR REPLACE FUNCTION public.sync_booking_customer()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.customer_id IS NULL THEN NEW.customer_id = NEW.buyer_id; END IF;
  IF NEW.buyer_id IS NULL THEN NEW.buyer_id = NEW.customer_id; END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_bookings_sync_customer BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_booking_customer();

-- Allow buyer to be nullable so customer_id-only inserts work
ALTER TABLE public.bookings ALTER COLUMN buyer_id DROP NOT NULL;

CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);

-- Extend booking policies to cover customer_id path
CREATE POLICY "customer reads booking" ON public.bookings FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
CREATE POLICY "customer creates booking" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR buyer_id = auth.uid());
CREATE POLICY "customer updates booking" ON public.bookings FOR UPDATE TO authenticated
  USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());