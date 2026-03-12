
-- =============================================
-- FIX 1: Convert all RESTRICTIVE policies to PERMISSIVE
-- =============================================

-- PROFILES: Drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- FIX 2: Restrict UPDATE to non-financial columns only (block balance manipulation)
CREATE POLICY "Users can update own non-financial profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND balance = (SELECT balance FROM public.profiles WHERE user_id = auth.uid()));

-- DEPOSITS: Drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can view own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Users can insert own deposits" ON public.deposits;

CREATE POLICY "Users can view own deposits" ON public.deposits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits" ON public.deposits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- WITHDRAWALS: Drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;

CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- INVESTMENTS: Drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;

CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON public.investments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- REFERRALS: Drop restrictive, create permissive
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT TO authenticated USING (auth.uid() = referrer_id);
