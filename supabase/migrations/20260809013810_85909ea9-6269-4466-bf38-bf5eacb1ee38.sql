DROP POLICY IF EXISTS conversations_read_participants ON public.conversations;
CREATE POLICY conversations_read_participants ON public.conversations
FOR SELECT TO authenticated
USING (created_by = auth.uid() OR public.is_participant(id, auth.uid()));

DROP FUNCTION IF EXISTS public.debug_whoami();