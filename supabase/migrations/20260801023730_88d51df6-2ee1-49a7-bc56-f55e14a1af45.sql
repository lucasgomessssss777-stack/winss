-- Use São Paulo local date/hour consistently
CREATE OR REPLACE FUNCTION public.increment_daily_visits() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.daily_stats (date, visits) VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, 1)
  ON CONFLICT (date) DO UPDATE SET visits = daily_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_double_click() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.daily_stats (date, double_clicks) VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, 1)
  ON CONFLICT (date) DO UPDATE SET double_clicks = daily_stats.double_clicks + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_quiz_start() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.daily_stats (date, quiz_starts) VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, 1)
  ON CONFLICT (date) DO UPDATE SET quiz_starts = daily_stats.quiz_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_quiz_completion() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.daily_stats (date, quiz_completions) VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, 1)
  ON CONFLICT (date) DO UPDATE SET quiz_completions = daily_stats.quiz_completions + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_form_start() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.daily_stats (date, form_starts) VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, 1)
  ON CONFLICT (date) DO UPDATE SET form_starts = daily_stats.form_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_payment(amount numeric) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.daily_stats (date, payments_count, payments_amount) VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, 1, amount)
  ON CONFLICT (date) DO UPDATE SET payments_count = daily_stats.payments_count + 1, payments_amount = daily_stats.payments_amount + amount;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_visits() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.hourly_stats (date, hour, visits)
  VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET visits = hourly_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_double_click() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.hourly_stats (date, hour, double_clicks)
  VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET double_clicks = hourly_stats.double_clicks + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_quiz_start() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.hourly_stats (date, hour, quiz_starts)
  VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET quiz_starts = hourly_stats.quiz_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_quiz_completion() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.hourly_stats (date, hour, quiz_completions)
  VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET quiz_completions = hourly_stats.quiz_completions + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_form_start() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.hourly_stats (date, hour, form_starts)
  VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET form_starts = hourly_stats.form_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_payment(amount numeric) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.hourly_stats (date, hour, payments_count, payments_amount)
  VALUES ((now() AT TIME ZONE 'America/Sao_Paulo')::date, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1, amount)
  ON CONFLICT (date, hour) DO UPDATE SET payments_count = hourly_stats.payments_count + 1, payments_amount = hourly_stats.payments_amount + amount;
$$;

-- Totals row must exist, otherwise the UPDATE silently does nothing
CREATE OR REPLACE FUNCTION public.increment_visits() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.site_stats (id, visits) VALUES (1, 1)
  ON CONFLICT (id) DO UPDATE SET visits = site_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_double_clicks() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  INSERT INTO public.site_stats (id, double_clicks) VALUES (1, 1)
  ON CONFLICT (id) DO UPDATE SET double_clicks = site_stats.double_clicks + 1;
$$;