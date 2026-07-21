CREATE OR REPLACE FUNCTION public.on_payment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.daily_stats (date, payments_count, payments_amount)
  VALUES (CURRENT_DATE, 1, NEW.amount)
  ON CONFLICT (date) DO UPDATE SET
    payments_count = daily_stats.payments_count + 1,
    payments_amount = daily_stats.payments_amount + NEW.amount;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_insert_daily_stats ON public.payments;
CREATE TRIGGER payment_insert_daily_stats
AFTER INSERT ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.on_payment_insert();

REVOKE EXECUTE ON FUNCTION public.on_payment_insert() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.on_payment_insert() TO service_role;