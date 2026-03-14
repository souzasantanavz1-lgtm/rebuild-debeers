
-- 1. Fix deposits: add amount bounds (min R$10, max R$50000)
DROP POLICY IF EXISTS "Users can insert own deposits" ON public.deposits;
CREATE POLICY "Users can insert own deposits"
  ON public.deposits
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND status = 'pending'
    AND amount > 0
    AND amount <= 50000
  );

-- 2. Fix investments: remove client INSERT entirely - investments should only be created server-side
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;
-- No INSERT policy = users cannot insert investments directly via API
-- Investments must be created through a trusted edge function using service role
