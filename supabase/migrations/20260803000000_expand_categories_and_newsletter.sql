-- Expand the real category taxonomy to cover digital/remote services
-- alongside the original home-services categories. These are real rows,
-- not decorative UI — the homepage grid and search page both read
-- directly from this table, so a category with zero providers yet will
-- honestly show "0 pros" rather than implying fake supply.
INSERT INTO public.categories (slug, name, icon, sort_order) VALUES
  ('plumbing', 'Plumbing', 'Droplet', 9),
  ('makeup', 'Makeup', 'Brush', 10),
  ('tutors', 'Tutors', 'GraduationCap', 11),
  ('catering', 'Catering', 'UtensilsCrossed', 12),
  ('event-planning', 'Event Planning', 'PartyPopper', 13),
  ('web-design', 'Web Design', 'Globe', 14),
  ('graphic-design', 'Graphic Design', 'PenTool', 15),
  ('video-editing', 'Video Editing', 'Clapperboard', 16),
  ('writing', 'Writing', 'PenLine', 17),
  ('virtual-assistant', 'Virtual Assistant', 'Laptop', 18),
  ('social-media-management', 'Social Media Management', 'Share2', 19),
  ('programming', 'Programming', 'Code2', 20),
  ('data-analysis', 'Data Analysis', 'BarChart3', 21)
ON CONFLICT (slug) DO NOTHING;

-- Real newsletter subscriber capture (homepage "Newsletter" signup)
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe; nobody (except service_role, i.e. an admin export)
-- can read the list back out through the public API — this is an email
-- capture box, not a public directory of subscriber addresses.
DROP POLICY IF EXISTS "newsletter_subscribe" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);
