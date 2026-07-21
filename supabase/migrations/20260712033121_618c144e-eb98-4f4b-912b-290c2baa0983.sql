CREATE TABLE public.site_stats (
  id int PRIMARY KEY DEFAULT 1,
  visits bigint NOT NULL DEFAULT 0,
  double_clicks bigint NOT NULL DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.site_stats (id) VALUES (1);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  premio_valor numeric,
  nome text,
  banco text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.site_stats TO service_role;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.increment_visits() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.site_stats SET visits = visits + 1 WHERE id = 1;
$$;

CREATE OR REPLACE FUNCTION public.increment_double_clicks() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.site_stats SET double_clicks = double_clicks + 1 WHERE id = 1;
$$;