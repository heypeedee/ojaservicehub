
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_conversation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_participant(uuid, uuid) FROM PUBLIC, anon;
-- authenticated needs EXECUTE for RLS policies that reference it
GRANT EXECUTE ON FUNCTION public.is_participant(uuid, uuid) TO authenticated;
