CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.get_referral_summary(_user_id uuid)
RETURNS TABLE(total_referrals integer, total_bonus numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    count(*)::integer AS total_referrals,
    coalesce(sum(r.bonus_amount), 0)::numeric AS total_bonus
  FROM public.referrals AS r
  WHERE r.referrer_id = _user_id;
$$;

REVOKE ALL ON FUNCTION private.get_referral_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.get_referral_summary(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_referral_summary()
RETURNS TABLE(total_referrals integer, total_bonus numeric)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, private, pg_temp
AS $$
  SELECT * FROM private.get_referral_summary(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_my_referral_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_referral_summary() TO authenticated, service_role;