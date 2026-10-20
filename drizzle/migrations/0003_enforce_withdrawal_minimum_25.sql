CREATE OR REPLACE FUNCTION public.enforce_withdrawal_minimum()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.amount IS NULL OR NEW.amount < 25 THEN
    RAISE EXCEPTION 'O saque mínimo é R$ 25.' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.enforce_withdrawal_minimum() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER a_enforce_withdrawal_minimum
BEFORE INSERT ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.enforce_withdrawal_minimum();
ALTER TABLE public.withdrawals ADD CONSTRAINT withdrawals_minimum_25 CHECK (amount >= 25) NOT VALID;
CREATE POLICY withdrawals_minimum_25_guard ON public.withdrawals
AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (amount >= 25);