
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS shop_name text;

-- Case-insensitive uniqueness on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(username));

-- Validation: 3-24 chars, letters/numbers/underscore, starts with letter
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (username IS NULL OR username ~ '^[a-zA-Z][a-zA-Z0-9_]{2,23}$');

-- Helper: generate a unique username from a seed
CREATE OR REPLACE FUNCTION public.generate_unique_username(seed text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n int := 0;
BEGIN
  base := regexp_replace(coalesce(seed, ''), '[^a-zA-Z0-9]', '', 'g');
  IF length(base) < 3 THEN
    base := 'oja' || base;
  END IF;
  base := substr(base, 1, 20);
  IF base !~ '^[a-zA-Z]' THEN
    base := 'o' || base;
  END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(candidate)) LOOP
    n := n + 1;
    candidate := substr(base, 1, 20) || n::text;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Update the new-user trigger to seed a unique username + full_name + optional shop_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seed text;
  new_username text;
BEGIN
  seed := coalesce(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );
  new_username := public.generate_unique_username(seed);

  INSERT INTO public.profiles (id, username, display_name, full_name, shop_name, avatar_url)
  VALUES (
    NEW.id,
    new_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'shop_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Ensure trigger exists (auth.users insert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill usernames for any existing profiles that lack one
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT id, display_name FROM public.profiles WHERE username IS NULL LOOP
    UPDATE public.profiles
       SET username = public.generate_unique_username(coalesce(r.display_name, 'user'))
     WHERE id = r.id;
  END LOOP;
END $$;
