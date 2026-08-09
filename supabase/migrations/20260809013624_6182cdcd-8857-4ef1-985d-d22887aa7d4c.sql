CREATE OR REPLACE FUNCTION public.debug_whoami()
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object('uid', auth.uid(), 'role', current_user, 'claims', current_setting('request.jwt.claims', true));
$$;
GRANT EXECUTE ON FUNCTION public.debug_whoami() TO authenticated, anon;