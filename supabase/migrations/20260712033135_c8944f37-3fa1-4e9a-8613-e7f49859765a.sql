REVOKE EXECUTE ON FUNCTION public.increment_visits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_double_clicks() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_visits() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_double_clicks() TO service_role;