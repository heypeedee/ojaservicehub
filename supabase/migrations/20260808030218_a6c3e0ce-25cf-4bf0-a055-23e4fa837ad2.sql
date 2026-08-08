REVOKE EXECUTE ON FUNCTION public.notify_on_message() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_booking() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_wallet_txn() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_review() FROM anon, authenticated;