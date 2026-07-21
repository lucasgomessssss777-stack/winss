CREATE TABLE public.daily_stats (
  date date PRIMARY KEY,
  visits bigint NOT NULL DEFAULT 0,
  quiz_starts bigint NOT NULL DEFAULT 0,
  quiz_completions bigint NOT NULL DEFAULT 0,
  form_starts bigint NOT NULL DEFAULT 0,
  double_clicks bigint NOT NULL DEFAULT 0,
  payments_count bigint NOT NULL DEFAULT 0,
  payments_amount numeric NOT NULL DEFAULT 0
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_stats TO authenticated;
GRANT ALL ON public.daily_stats TO service_role;

ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role can manage daily_stats"
ON public.daily_stats
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.increment_daily_visits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.daily_stats (date, visits) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET visits = daily_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_quiz_start()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.daily_stats (date, quiz_starts) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET quiz_starts = daily_stats.quiz_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_quiz_completion()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.daily_stats (date, quiz_completions) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET quiz_completions = daily_stats.quiz_completions + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_form_start()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.daily_stats (date, form_starts) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET form_starts = daily_stats.form_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_double_click()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.daily_stats (date, double_clicks) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET double_clicks = daily_stats.double_clicks + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_payment(amount numeric)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.daily_stats (date, payments_count, payments_amount) VALUES (CURRENT_DATE, 1, amount)
  ON CONFLICT (date) DO UPDATE SET
    payments_count = daily_stats.payments_count + 1,
    payments_amount = daily_stats.payments_amount + amount;
$$;

-- Atualiza funções existentes para manter totais gerais e valores diários sincronizados
CREATE OR REPLACE FUNCTION public.increment_visits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.site_stats SET visits = visits + 1 WHERE id = 1;
  INSERT INTO public.daily_stats (date, visits) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET visits = daily_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_double_clicks()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.site_stats SET double_clicks = double_clicks + 1 WHERE id = 1;
  INSERT INTO public.daily_stats (date, double_clicks) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET double_clicks = daily_stats.double_clicks + 1;
$$;
