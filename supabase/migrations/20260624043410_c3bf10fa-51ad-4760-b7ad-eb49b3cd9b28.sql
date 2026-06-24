
-- 1) Recalibrate plan economics so every plan is profitable
UPDATE public.investment_plans SET daily_return = 13,  duration_days = 5  WHERE slug = 'diamante-bruto';
UPDATE public.investment_plans SET daily_return = 28,  duration_days = 10 WHERE slug = 'diamante-lapidado';
UPDATE public.investment_plans SET daily_return = 100, duration_days = 15 WHERE slug = 'mina-diamantes';
UPDATE public.investment_plans SET daily_return = 200, duration_days = 20 WHERE slug = 'cofre-diamantes';
UPDATE public.investment_plans SET daily_return = 280, duration_days = 30 WHERE slug = 'tesouro-real';

-- 2) Server-side hardening: validation trigger on withdrawals (CPF and PIX key)
CREATE OR REPLACE FUNCTION public.validate_withdrawal_input()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.cpf IS NULL OR NEW.cpf !~ '^\d{11}$' THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  IF NEW.pix_key IS NULL OR char_length(btrim(NEW.pix_key)) < 4 OR char_length(NEW.pix_key) > 140 THEN
    RAISE EXCEPTION 'Chave PIX inválida';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.validate_withdrawal_input() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_validate_withdrawal_input ON public.withdrawals;
CREATE TRIGGER trg_validate_withdrawal_input
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_withdrawal_input();

-- 3) Deposits: enforce amount range in the RLS policy as well
DROP POLICY IF EXISTS "Users can insert own deposits" ON public.deposits;
CREATE POLICY "Users can insert own deposits"
  ON public.deposits FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND amount >= 50
    AND amount <= 50000
    AND method IN ('pix')
  );
