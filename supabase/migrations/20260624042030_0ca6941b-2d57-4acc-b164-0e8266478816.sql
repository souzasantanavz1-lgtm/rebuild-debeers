
-- 1) Convert read-only helpers to SECURITY INVOKER (they rely on existing SELECT RLS on profiles)
ALTER FUNCTION public.get_user_balance(uuid) SECURITY INVOKER;
ALTER FUNCTION public.get_profile_referral_code(uuid) SECURITY INVOKER;
ALTER FUNCTION public.get_profile_referred_by(uuid) SECURITY INVOKER;

-- 2) Revoke EXECUTE on SECURITY DEFINER trigger / utility functions from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_checkin_bonus() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_balance_on_withdrawal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 3) Defense-in-depth: trigger that prevents direct user changes to sensitive profile columns
CREATE OR REPLACE FUNCTION public.prevent_profile_sensitive_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow internal trigger-driven updates (e.g. credit_checkin_bonus, deduct_balance_on_withdrawal)
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF NEW.balance IS DISTINCT FROM OLD.balance THEN
    RAISE EXCEPTION 'Saldo não pode ser alterado diretamente';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id não pode ser alterado';
  END IF;
  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'Código de indicação não pode ser alterado';
  END IF;
  IF NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'Indicador não pode ser alterado';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_sensitive_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_profile_sensitive_change ON public.profiles;
CREATE TRIGGER trg_prevent_profile_sensitive_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_sensitive_change();

-- 4) Explicit deny UPDATE/DELETE policies on user-facing tables (and INSERT on investments)
-- check_ins
CREATE POLICY "No client updates on check_ins"
  ON public.check_ins FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on check_ins"
  ON public.check_ins FOR DELETE TO authenticated, anon
  USING (false);

-- deposits
CREATE POLICY "No client updates on deposits"
  ON public.deposits FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on deposits"
  ON public.deposits FOR DELETE TO authenticated, anon
  USING (false);

-- investments
CREATE POLICY "No client inserts on investments"
  ON public.investments FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "No client updates on investments"
  ON public.investments FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on investments"
  ON public.investments FOR DELETE TO authenticated, anon
  USING (false);

-- referrals
CREATE POLICY "No client inserts on referrals"
  ON public.referrals FOR INSERT TO authenticated, anon
  WITH CHECK (false);
CREATE POLICY "No client updates on referrals"
  ON public.referrals FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on referrals"
  ON public.referrals FOR DELETE TO authenticated, anon
  USING (false);

-- support_tickets
CREATE POLICY "No client updates on support_tickets"
  ON public.support_tickets FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on support_tickets"
  ON public.support_tickets FOR DELETE TO authenticated, anon
  USING (false);

-- withdrawals
CREATE POLICY "No client updates on withdrawals"
  ON public.withdrawals FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);
CREATE POLICY "No client deletes on withdrawals"
  ON public.withdrawals FOR DELETE TO authenticated, anon
  USING (false);
