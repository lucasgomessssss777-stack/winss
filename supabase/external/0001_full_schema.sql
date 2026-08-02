-- =============================================================
-- Magalu — schema completo para Supabase externo
-- Rode este arquivo INTEIRO no SQL Editor do seu projeto Supabase.
-- Idempotente: pode ser executado mais de uma vez sem erro.
-- =============================================================

-- -------------------------------------------------------------
-- 1) TABELAS
-- -------------------------------------------------------------

-- Totais gerais (linha única id = 1)
CREATE TABLE IF NOT EXISTS public.site_stats (
  id            int PRIMARY KEY DEFAULT 1,
  visits        bigint NOT NULL DEFAULT 0,
  double_clicks bigint NOT NULL DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.site_stats (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Pagamentos Pix
CREATE TABLE IF NOT EXISTS public.payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount         numeric NOT NULL,
  premio_valor   numeric,
  nome           text,
  banco          text,
  external_id    text,
  transaction_id text,
  status         text NOT NULL DEFAULT 'pending',
  paid_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS payments_external_id_key
  ON public.payments(external_id);

-- Métricas por dia
CREATE TABLE IF NOT EXISTS public.daily_stats (
  date             date PRIMARY KEY,
  visits           bigint NOT NULL DEFAULT 0,
  quiz_starts      bigint NOT NULL DEFAULT 0,
  quiz_completions bigint NOT NULL DEFAULT 0,
  form_starts      bigint NOT NULL DEFAULT 0,
  double_clicks    bigint NOT NULL DEFAULT 0,
  payments_count   bigint NOT NULL DEFAULT 0,
  payments_amount  numeric NOT NULL DEFAULT 0
);

-- Métricas por dia + hora (gráfico do admin)
CREATE TABLE IF NOT EXISTS public.hourly_stats (
  date             date NOT NULL,
  hour             smallint NOT NULL CHECK (hour >= 0 AND hour <= 23),
  visits           bigint NOT NULL DEFAULT 0,
  quiz_starts      bigint NOT NULL DEFAULT 0,
  quiz_completions bigint NOT NULL DEFAULT 0,
  form_starts      bigint NOT NULL DEFAULT 0,
  double_clicks    bigint NOT NULL DEFAULT 0,
  payments_count   bigint NOT NULL DEFAULT 0,
  payments_amount  numeric NOT NULL DEFAULT 0,
  PRIMARY KEY (date, hour)
);

-- Configurações do site (logos / promo)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text PRIMARY KEY,
  value      text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.site_settings (key, value) VALUES
  ('header_logo_url', ''),
  ('footer_logo_url', ''),
  ('home_promo_url', '')
ON CONFLICT (key) DO NOTHING;

-- -------------------------------------------------------------
-- 2) GRANTS (todo acesso é feito pelo servidor via service_role)
-- -------------------------------------------------------------
GRANT ALL ON public.site_stats    TO service_role;
GRANT ALL ON public.payments      TO service_role;
GRANT ALL ON public.daily_stats   TO service_role;
GRANT ALL ON public.hourly_stats  TO service_role;
GRANT ALL ON public.site_settings TO service_role;

-- Nenhum acesso direto do cliente (anon/authenticated) a estas tabelas.
REVOKE ALL ON public.site_stats    FROM anon, authenticated;
REVOKE ALL ON public.payments      FROM anon, authenticated;
REVOKE ALL ON public.daily_stats   FROM anon, authenticated;
REVOKE ALL ON public.hourly_stats  FROM anon, authenticated;
REVOKE ALL ON public.site_settings FROM anon, authenticated;

-- -------------------------------------------------------------
-- 3) RLS + POLICIES
-- -------------------------------------------------------------
ALTER TABLE public.site_stats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hourly_stats  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role can manage site_stats" ON public.site_stats;
CREATE POLICY "service_role can manage site_stats" ON public.site_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role can manage payments" ON public.payments;
CREATE POLICY "service_role can manage payments" ON public.payments
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role can manage daily_stats" ON public.daily_stats;
CREATE POLICY "service_role can manage daily_stats" ON public.daily_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role manages hourly_stats" ON public.hourly_stats;
CREATE POLICY "service_role manages hourly_stats" ON public.hourly_stats
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role manages site_settings" ON public.site_settings;
CREATE POLICY "service_role manages site_settings" ON public.site_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- -------------------------------------------------------------
-- 4) FUNÇÕES DE CONTAGEM (totais + por dia)
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_visits()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.site_stats SET visits = visits + 1 WHERE id = 1;
  INSERT INTO public.daily_stats (date, visits) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET visits = daily_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_double_clicks()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.site_stats SET double_clicks = double_clicks + 1 WHERE id = 1;
  INSERT INTO public.daily_stats (date, double_clicks) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET double_clicks = daily_stats.double_clicks + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_visits()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.daily_stats (date, visits) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET visits = daily_stats.visits + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_quiz_start()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.daily_stats (date, quiz_starts) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET quiz_starts = daily_stats.quiz_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_quiz_completion()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.daily_stats (date, quiz_completions) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET quiz_completions = daily_stats.quiz_completions + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_form_start()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.daily_stats (date, form_starts) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET form_starts = daily_stats.form_starts + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_double_click()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.daily_stats (date, double_clicks) VALUES (CURRENT_DATE, 1)
  ON CONFLICT (date) DO UPDATE SET double_clicks = daily_stats.double_clicks + 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_daily_payment(amount numeric)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.daily_stats (date, payments_count, payments_amount)
  VALUES (CURRENT_DATE, 1, amount)
  ON CONFLICT (date) DO UPDATE SET
    payments_count  = daily_stats.payments_count + 1,
    payments_amount = daily_stats.payments_amount + amount;
$$;

-- -------------------------------------------------------------
-- 5) FUNÇÕES DE CONTAGEM POR HORA (fuso America/Sao_Paulo)
-- -------------------------------------------------------------
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
    payments_count  = hourly_stats.payments_count + 1,
    payments_amount = hourly_stats.payments_amount + amount;
$$;

-- -------------------------------------------------------------
-- 6) TRIGGER: pagamento inserido -> soma em daily_stats
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.on_payment_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.daily_stats (date, payments_count, payments_amount)
  VALUES (CURRENT_DATE, 1, NEW.amount)
  ON CONFLICT (date) DO UPDATE SET
    payments_count  = daily_stats.payments_count + 1,
    payments_amount = daily_stats.payments_amount + NEW.amount;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_insert_daily_stats ON public.payments;
CREATE TRIGGER payment_insert_daily_stats
AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.on_payment_insert();

-- -------------------------------------------------------------
-- 7) EXECUTE apenas para service_role (nunca anon/authenticated)
-- -------------------------------------------------------------
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND (p.proname LIKE 'increment_%' OR p.proname = 'on_payment_insert')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn.sig);
  END LOOP;
END $$;
