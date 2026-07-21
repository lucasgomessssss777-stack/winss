REVOKE EXECUTE ON FUNCTION public.increment_visits() FROM public, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_double_clicks() FROM public, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_visits() FROM public, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_quiz_start() FROM public, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_quiz_completion() FROM public, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_form_start() FROM public, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_double_click() FROM public, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_payment(numeric) FROM public, authenticated;

GRANT EXECUTE ON FUNCTION public.increment_visits() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_double_clicks() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_visits() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_quiz_start() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_quiz_completion() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_form_start() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_double_click() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_payment(numeric) TO service_role;