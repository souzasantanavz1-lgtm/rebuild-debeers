
-- ============================================
-- 1) Referrals: hide referred_id UUIDs from clients
-- ============================================
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;

-- Expose only safe aggregate data via RPC
CREATE OR REPLACE FUNCTION public.get_my_referral_summary()
RETURNS TABLE (total_referrals integer, total_bonus numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::int AS total_referrals,
    COALESCE(SUM(bonus_amount), 0)::numeric AS total_bonus
  FROM public.referrals
  WHERE referrer_id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_referral_summary() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_my_referral_summary() TO authenticated;

-- ============================================
-- 2) Withdrawals: atomic balance check via BEFORE INSERT trigger
-- ============================================

-- Simplify INSERT policy: drop the racy inline balance computation.
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can insert own withdrawals"
  ON public.withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND amount > 0
    AND fee = amount * 0.12
    AND net_amount = amount * 0.88
  );

-- Replace existing AFTER INSERT deduct trigger with a BEFORE INSERT version that
-- takes a row-level lock on the profile, validates against balance minus already
-- pending withdrawals, and atomically deducts the requested amount.
DROP TRIGGER IF EXISTS trg_deduct_balance_on_withdrawal ON public.withdrawals;

CREATE OR REPLACE FUNCTION public.deduct_balance_on_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
  pending_total   numeric;
BEGIN
  -- Lock the profile row to serialize concurrent withdrawals
  SELECT balance INTO current_balance
  FROM public.profiles
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Perfil não encontrado';
  END IF;

  -- Sum other already-pending withdrawals for this user (excluding the new row)
  SELECT COALESCE(SUM(amount), 0) INTO pending_total
  FROM public.withdrawals
  WHERE user_id = NEW.user_id
    AND status = 'pending';

  IF current_balance - pending_total < NEW.amount THEN
    RAISE EXCEPTION 'Saldo insuficiente para saque';
  END IF;

  -- Atomically deduct
  UPDATE public.profiles
  SET balance = balance - NEW.amount,
      updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.deduct_balance_on_withdrawal() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_deduct_balance_on_withdrawal
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_balance_on_withdrawal();
