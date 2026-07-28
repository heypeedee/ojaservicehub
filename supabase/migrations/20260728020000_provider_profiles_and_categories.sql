-- Categories (Hair & Beauty, Electrical, etc.)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_read_all" ON public.categories FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.categories (slug, name, icon, sort_order) VALUES
  ('hair-beauty', 'Hair & Beauty', 'Scissors', 1),
  ('home-repair', 'Home Repair', 'Wrench', 2),
  ('cleaning', 'Cleaning', 'Sparkles', 3),
  ('electrical', 'Electrical', 'Zap', 4),
  ('photography', 'Photography', 'Camera', 5),
  ('private-chef', 'Private Chef', 'ChefHat', 6),
  ('tailoring', 'Tailoring', 'Paintbrush', 7),
  ('auto-care', 'Auto Care', 'Car', 8);

-- Provider profiles: one row per user who has set up a "pro" storefront
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  tagline TEXT,
  area TEXT NOT NULL,
  price_from NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Elite')),
  verified BOOLEAN NOT NULL DEFAULT false,
  available_today BOOLEAN NOT NULL DEFAULT false,
  open_now BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  cover_image_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.provider_profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.provider_profiles TO authenticated;
GRANT ALL ON public.provider_profiles TO service_role;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- Public can browse only published providers; owners can always see their own (published or draft)
CREATE POLICY "provider_profiles_read_published" ON public.provider_profiles
  FOR SELECT TO anon, authenticated
  USING (published = true OR id = auth.uid());

CREATE POLICY "provider_profiles_insert_own" ON public.provider_profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "provider_profiles_update_own" ON public.provider_profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE INDEX provider_profiles_category_idx ON public.provider_profiles (category_id);
CREATE INDEX provider_profiles_area_idx ON public.provider_profiles (area);
CREATE INDEX provider_profiles_published_idx ON public.provider_profiles (published);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_profiles_set_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
