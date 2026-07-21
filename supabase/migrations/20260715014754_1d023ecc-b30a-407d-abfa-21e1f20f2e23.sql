
-- site_settings: key/value for configurable image URLs
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role manages site_settings" ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.site_settings (key, value) VALUES
  ('header_logo_url', ''),
  ('footer_logo_url', ''),
  ('home_promo_url', '')
ON CONFLICT (key) DO NOTHING;

-- hourly_stats: metrics bucketed by date + hour for line chart
CREATE TABLE public.hourly_stats (
  date date NOT NULL,
  hour smallint NOT NULL CHECK (hour >= 0 AND hour <= 23),
  visits bigint NOT NULL DEFAULT 0,
  quiz_starts bigint NOT NULL DEFAULT 0,
  quiz_completions bigint NOT NULL DEFAULT 0,
  form_starts bigint NOT NULL DEFAULT 0,
  double_clicks bigint NOT NULL DEFAULT 0,
  payments_count bigint NOT NULL DEFAULT 0,
  payments_amount numeric NOT NULL DEFAULT 0,
  PRIMARY KEY (date, hour)
);
GRANT ALL ON public.hourly_stats TO service_role;
ALTER TABLE public.hourly_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role manages hourly_stats" ON public.hourly_stats FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Hourly increment RPCs
CREATE OR REPLACE FUNCTION public.increment_hourly_visits()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.hourly_stats (date, hour, visits)
  VALUES (CURRENT_DATE, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET visits = hourly_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_quiz_start()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.hourly_stats (date, hour, quiz_starts)
  VALUES (CURRENT_DATE, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET quiz_starts = hourly_stats.quiz_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_quiz_completion()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.hourly_stats (date, hour, quiz_completions)
  VALUES (CURRENT_DATE, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET quiz_completions = hourly_stats.quiz_completions + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_form_start()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.hourly_stats (date, hour, form_starts)
  VALUES (CURRENT_DATE, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET form_starts = hourly_stats.form_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_double_click()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.hourly_stats (date, hour, double_clicks)
  VALUES (CURRENT_DATE, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1)
  ON CONFLICT (date, hour) DO UPDATE SET double_clicks = hourly_stats.double_clicks + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_hourly_payment(amount numeric)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.hourly_stats (date, hour, payments_count, payments_amount)
  VALUES (CURRENT_DATE, EXTRACT(HOUR FROM now() AT TIME ZONE 'America/Sao_Paulo')::smallint, 1, amount)
  ON CONFLICT (date, hour) DO UPDATE SET
    payments_count = hourly_stats.payments_count + 1,
    payments_amount = hourly_stats.payments_amount + amount;
$$;
