CREATE OR REPLACE FUNCTION public.increment_visits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  INSERT INTO public.site_stats (id, visits, double_clicks) VALUES (1, 1, 0)
  ON CONFLICT (id) DO UPDATE SET visits = site_stats.visits + 1;

  INSERT INTO public.daily_stats (date, visits) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET visits = daily_stats.visits + 1;
$function$;

CREATE OR REPLACE FUNCTION public.increment_double_clicks()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  INSERT INTO public.site_stats (id, visits, double_clicks) VALUES (1, 0, 1)
  ON CONFLICT (id) DO UPDATE SET double_clicks = site_stats.double_clicks + 1;

  INSERT INTO public.daily_stats (date, double_clicks) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET double_clicks = daily_stats.double_clicks + 1;
$function$;

REVOKE EXECUTE ON FUNCTION public.increment_visits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_double_clicks() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_visits() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_double_clicks() TO service_role;

INSERT INTO public.site_stats (id, visits, double_clicks)
SELECT 1, COALESCE(SUM(visits), 0), COALESCE(SUM(double_clicks), 0) FROM public.daily_stats
ON CONFLICT (id) DO UPDATE SET
  visits = GREATEST(site_stats.visits, EXCLUDED.visits),
  double_clicks = GREATEST(site_stats.double_clicks, EXCLUDED.double_clicks);