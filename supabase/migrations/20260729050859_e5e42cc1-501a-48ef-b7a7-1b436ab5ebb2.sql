-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.categories (name, slug, icon, sort_order) VALUES
  ('Beauty & Hair', 'beauty-hair', 'scissors', 1),
  ('Home Services', 'home-services', 'home', 2),
  ('Electrical', 'electrical', 'zap', 3),
  ('Plumbing', 'plumbing', 'wrench', 4),
  ('Cleaning', 'cleaning', 'sparkles', 5),
  ('Events & Catering', 'events-catering', 'utensils', 6);

-- ============ SERVICES ============
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_ngn INT NOT NULL DEFAULT 0,
  duration_minutes INT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_services_provider ON public.services(provider_id);
CREATE INDEX idx_services_category ON public.services(category_id);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public reads active services" ON public.services FOR SELECT TO anon, authenticated
  USING (is_active = true OR provider_id = auth.uid());
CREATE POLICY "providers insert own services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (provider_id = auth.uid());
CREATE POLICY "providers update own services" ON public.services FOR UPDATE TO authenticated
  USING (provider_id = auth.uid()) WITH CHECK (provider_id = auth.uid());
CREATE POLICY "providers delete own services" ON public.services FOR DELETE TO authenticated
  USING (provider_id = auth.uid());
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ BOOKINGS ============
CREATE TYPE public.booking_status AS ENUM
  ('pending','accepted','declined','in_progress','completed','cancelled','disputed');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  address TEXT,
  notes TEXT,
  photo_urls TEXT[] NOT NULL DEFAULT '{}',
  price_ngn INT NOT NULL DEFAULT 0,
  platform_fee_ngn INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_bookings_buyer ON public.bookings(buyer_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parties read booking" ON public.bookings FOR SELECT TO authenticated
  USING (buyer_id = auth.uid() OR provider_id = auth.uid());
CREATE POLICY "buyer creates booking" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "parties update booking" ON public.bookings FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid() OR provider_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR provider_id = auth.uid());
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FAVOURITES ============
CREATE TABLE public.favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider_id)
);
GRANT SELECT, INSERT, DELETE ON public.favourites TO authenticated;
GRANT ALL ON public.favourites TO service_role;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own favourites" ON public.favourites FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reviews_provider ON public.reviews(provider_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "buyer inserts review for completed booking" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    buyer_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.buyer_id = auth.uid()
        AND b.provider_id = reviews.provider_id AND b.status = 'completed'
    )
  );
CREATE POLICY "author updates own review" ON public.reviews FOR UPDATE TO authenticated
  USING (buyer_id = auth.uid()) WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "author deletes own review" ON public.reviews FOR DELETE TO authenticated
  USING (buyer_id = auth.uid());
CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ WALLET TRANSACTIONS ============
CREATE TYPE public.wallet_txn_type AS ENUM
  ('escrow_hold','escrow_release','tip','withdrawal','refund','topup');
CREATE TYPE public.wallet_txn_status AS ENUM ('pending','completed','failed');

CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  type wallet_txn_type NOT NULL,
  status wallet_txn_status NOT NULL DEFAULT 'pending',
  amount_ngn INT NOT NULL,
  reference TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_wallet_user ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_booking ON public.wallet_transactions(booking_id);
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own txns" ON public.wallet_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER trg_wallet_updated BEFORE UPDATE ON public.wallet_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "users delete own notifications" ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());