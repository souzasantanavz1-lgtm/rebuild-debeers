
-- Fix deposits: force status = 'pending' on insert
DROP POLICY IF EXISTS "Users can insert own deposits" ON public.deposits;
CREATE POLICY "Users can insert own deposits"
  ON public.deposits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Fix withdrawals: force status = 'pending' and fee/net_amount to safe defaults on insert
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
  );

-- Fix investments: force status = 'pending' on insert and restrict daily_return
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;
CREATE POLICY "Users can insert own investments"
  ON public.investments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
  );
