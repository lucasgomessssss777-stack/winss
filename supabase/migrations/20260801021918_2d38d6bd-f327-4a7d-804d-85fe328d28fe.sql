-- 1) Only trusted server code (service_role) may run the stats counters.
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND p.proname LIKE 'increment_%'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn.sig);
  END LOOP;
END $$;

-- on_payment_insert is a trigger function; it must not be callable via the API.
REVOKE ALL ON FUNCTION public.on_payment_insert() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.on_payment_insert() FROM anon;
REVOKE ALL ON FUNCTION public.on_payment_insert() FROM authenticated;

-- 2) Explicit table privileges for the trusted server client.
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.daily_stats TO service_role;
GRANT ALL ON public.hourly_stats TO service_role;
GRANT ALL ON public.site_settings TO service_role;
GRANT ALL ON public.site_stats TO service_role;

-- 3) These tables are only read/written by trusted server code; no client access.
REVOKE ALL ON public.payments FROM anon, authenticated;
REVOKE ALL ON public.daily_stats FROM anon, authenticated;
REVOKE ALL ON public.hourly_stats FROM anon, authenticated;
REVOKE ALL ON public.site_settings FROM anon, authenticated;
REVOKE ALL ON public.site_stats FROM anon, authenticated;