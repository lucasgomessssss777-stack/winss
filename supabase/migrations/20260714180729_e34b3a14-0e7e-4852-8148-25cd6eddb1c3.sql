REVOKE EXECUTE ON FUNCTION public.increment_visits() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_double_clicks() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_visits() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_quiz_start() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_quiz_completion() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_form_start() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_double_click() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_daily_payment(numeric) FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.increment_visits() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_double_clicks() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_visits() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_quiz_start() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_quiz_completion() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_form_start() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_double_click() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_daily_payment(numeric) TO service_role;

DROP POLICY IF EXISTS "service_role can manage site_stats" ON public.site_stats;
CREATE POLICY "service_role can manage site_stats" ON public.site_stats FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role can manage payments" ON public.payments;
CREATE POLICY "service_role can manage payments" ON public.payments FOR ALL TO service_role USING (true) WITH CHECK (true);