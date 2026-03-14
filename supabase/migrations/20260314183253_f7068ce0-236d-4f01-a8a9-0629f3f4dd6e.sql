
-- 1. Fix profiles INSERT: force balance = 0 on creation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND balance = 0);

-- 2. Create a security definer function to check user balance for withdrawals
CREATE OR REPLACE FUNCTION public.get_user_balance(_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT balance FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- 3. Fix withdrawals INSERT: validate amount against balance
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can insert own withdrawals"
  ON public.withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
    AND fee = amount * 0.12
    AND net_amount = amount * 0.88
    AND amount > 0
    AND amount <= public.get_user_balance(auth.uid())
  );

-- 4. Fix investments INSERT: restrict daily_return to max 5% and require positive amount
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;
CREATE POLICY "Users can insert own investments"
  ON public.investments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
    AND amount > 0
    AND daily_return >= 0
    AND daily_return <= 5
  );
