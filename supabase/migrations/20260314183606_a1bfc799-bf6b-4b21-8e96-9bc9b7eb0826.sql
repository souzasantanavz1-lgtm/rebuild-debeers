
-- 1. Create a function to get current profile immutable fields
CREATE OR REPLACE FUNCTION public.get_profile_referral_code(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT referral_code FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_profile_referred_by(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT referred_by FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- 2. Fix profiles UPDATE: lock balance, referral_code, and referred_by
DROP POLICY IF EXISTS "Users can update own non-financial profile" ON public.profiles;
CREATE POLICY "Users can update own non-financial profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND balance = public.get_user_balance(auth.uid())
    AND referral_code IS NOT DISTINCT FROM public.get_profile_referral_code(auth.uid())
    AND referred_by IS NOT DISTINCT FROM public.get_profile_referred_by(auth.uid())
  );

-- 3. Atomic balance deduction trigger for withdrawals
CREATE OR REPLACE FUNCTION public.deduct_balance_on_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atomically deduct balance with row-level lock
  UPDATE public.profiles 
  SET balance = balance - NEW.amount,
      updated_at = now()
  WHERE user_id = NEW.user_id 
    AND balance >= NEW.amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Saldo insuficiente para saque';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deduct_balance_on_withdrawal
  AFTER INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_balance_on_withdrawal();
