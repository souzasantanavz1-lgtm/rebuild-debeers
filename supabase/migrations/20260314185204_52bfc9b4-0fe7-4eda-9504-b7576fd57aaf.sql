
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;

CREATE POLICY "Users can insert own withdrawals"
ON public.withdrawals
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id)
  AND (status = 'pending')
  AND (fee = (amount * 0.12))
  AND (net_amount = (amount * 0.88))
  AND (amount > 0)
  AND (amount <= (
    get_user_balance(auth.uid()) 
    - COALESCE(
      (SELECT SUM(w.amount) FROM public.withdrawals w WHERE w.user_id = auth.uid() AND w.status = 'pending'),
      0
    )
  ))
);
