CREATE TABLE public.kyc_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid,
  user_id uuid NOT NULL,
  doc_type text NOT NULL,
  action text NOT NULL,
  reason text,
  actor_id uuid,
  actor_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kyc_audit_log TO authenticated;
GRANT ALL ON public.kyc_audit_log TO service_role;
ALTER TABLE public.kyc_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read kyc audit" ON public.kyc_audit_log FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'moderator'));
CREATE INDEX kyc_audit_log_user_idx ON public.kyc_audit_log(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_kyc_review() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('approved','rejected') THEN
    INSERT INTO public.kyc_audit_log(document_id,user_id,doc_type,action,reason,actor_id,actor_email)
    VALUES (NEW.id, NEW.user_id, NEW.doc_type, NEW.status, NEW.rejection_reason, auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER kyc_documents_audit AFTER UPDATE ON public.kyc_documents
FOR EACH ROW EXECUTE FUNCTION public.log_kyc_review();

CREATE OR REPLACE FUNCTION public.list_staff()
RETURNS TABLE(user_id uuid, email text, role app_role, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  RETURN QUERY SELECT r.user_id, u.email::text, r.role, r.created_at
    FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id
    WHERE r.role IN ('admin','moderator') ORDER BY r.created_at;
END $$;

CREATE OR REPLACE FUNCTION public.grant_staff_role(_email text, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _role NOT IN ('admin','moderator') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF _uid IS NULL THEN RAISE EXCEPTION 'No account with that email. Ask them to sign up first.'; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (_uid, _role) ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.revoke_staff_role(_user_id uuid, _role app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _user_id = auth.uid() AND _role = 'admin' THEN RAISE EXCEPTION 'You cannot remove your own admin access.'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
END $$;

REVOKE EXECUTE ON FUNCTION public.list_staff() FROM anon;
REVOKE EXECUTE ON FUNCTION public.grant_staff_role(text, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.revoke_staff_role(uuid, app_role) FROM anon;