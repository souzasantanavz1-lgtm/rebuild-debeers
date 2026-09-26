CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invitation_code text := upper(trim(coalesce(NEW.raw_user_meta_data->>'referral_code', '')));
  inviter_id uuid;
BEGIN
  IF invitation_code <> '' THEN
    IF invitation_code !~ '^[A-Z0-9]{8}$' THEN
      RAISE EXCEPTION 'Código de indicação inválido';
    END IF;
    SELECT p.user_id INTO inviter_id
    FROM public.profiles AS p
    WHERE p.referral_code = invitation_code AND p.user_id <> NEW.id
    LIMIT 1;
    IF inviter_id IS NULL THEN
      RAISE EXCEPTION 'Código de indicação não encontrado';
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, name, phone, referral_code, referred_by)
  VALUES (
    NEW.id,
    coalesce(NEW.raw_user_meta_data->>'name', ''),
    coalesce(NEW.raw_user_meta_data->>'phone', ''),
    public.generate_referral_code(),
    nullif(invitation_code, '')
  );

  IF inviter_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_id, referred_id, level, bonus_amount)
    VALUES (inviter_id, NEW.id, 1, 0);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;