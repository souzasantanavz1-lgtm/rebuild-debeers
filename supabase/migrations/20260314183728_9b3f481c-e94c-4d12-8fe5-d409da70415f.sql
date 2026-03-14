
-- Fix security definer functions to only allow querying own data
CREATE OR REPLACE FUNCTION public.get_user_balance(_user_id uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT balance FROM public.profiles WHERE user_id = _user_id AND _user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_profile_referral_code(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT referral_code FROM public.profiles WHERE user_id = _user_id AND _user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_profile_referred_by(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT referred_by FROM public.profiles WHERE user_id = _user_id AND _user_id = auth.uid() LIMIT 1;
$$;
