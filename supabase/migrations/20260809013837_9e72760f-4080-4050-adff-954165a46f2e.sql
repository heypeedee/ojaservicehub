DROP POLICY IF EXISTS participants_read_own_convos ON public.conversation_participants;
CREATE POLICY participants_read_own_convos ON public.conversation_participants
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_participant(conversation_id, auth.uid()));