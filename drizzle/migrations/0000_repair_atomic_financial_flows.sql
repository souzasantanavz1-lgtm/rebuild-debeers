ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.investment_plans(id), ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS credited_days integer NOT NULL DEFAULT 0;
ALTER TABLE public.investments ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS payment_reference text;
CREATE UNIQUE INDEX IF NOT EXISTS deposits_payment_reference_unique ON public.deposits(payment_reference) WHERE payment_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS investments_user_plan_idx ON public.investments(user_id,plan_id);
CREATE INDEX IF NOT EXISTS withdrawals_user_status_idx ON public.withdrawals(user_id,status);
CREATE TABLE public.investment_earnings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE RESTRICT,
 cycle_day integer NOT NULL CHECK (cycle_day > 0),
 amount numeric(12,2) NOT NULL CHECK (amount > 0),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz,
 UNIQUE(investment_id,cycle_day)
);
GRANT SELECT ON public.investment_earnings TO authenticated;
GRANT ALL ON public.investment_earnings TO service_role;
ALTER TABLE public.investment_earnings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own credited earnings" ON public.investment_earnings FOR SELECT TO authenticated USING (user_id=auth.uid() AND deleted_at IS NULL);
CREATE INDEX investment_earnings_user_idx ON public.investment_earnings(user_id);

CREATE OR REPLACE FUNCTION public.prevent_profile_sensitive_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.id IS DISTINCT FROM OLD.id OR NEW.referral_code IS DISTINCT FROM OLD.referral_code OR NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
  RAISE EXCEPTION 'Identidade e indicação não podem ser alteradas';
 END IF;
 IF NEW.balance IS DISTINCT FROM OLD.balance AND pg_trigger_depth() <= 1 THEN RAISE EXCEPTION 'Saldo não pode ser alterado diretamente'; END IF;
 IF NEW.balance < 0 OR NEW.balance::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Saldo inválido'; END IF;
 RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.validate_withdrawal_input() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE cpf_text text; digit integer; total integer; i integer;
BEGIN
 IF NEW.status <> 'pending' OR NEW.amount::text IN ('NaN','Infinity','-Infinity') OR NEW.amount <= 0 OR NEW.amount <> round(NEW.amount,2) THEN RAISE EXCEPTION 'Valor ou estado de saque inválido'; END IF;
 IF NEW.fee <> round(NEW.amount*0.12,2) OR NEW.net_amount <> NEW.amount-round(NEW.amount*0.12,2) THEN RAISE EXCEPTION 'Taxa de saque inválida'; END IF;
 cpf_text := NEW.cpf;
 IF cpf_text IS NULL OR cpf_text !~ '^[0-9]{11}$' OR cpf_text ~ '^([0-9])\1{10}$' THEN RAISE EXCEPTION 'CPF inválido'; END IF;
 FOR digit IN 10..11 LOOP
  total := 0;
  FOR i IN 1..digit-1 LOOP total := total + substring(cpf_text,i,1)::integer*(digit+1-i); END LOOP;
  total := (total*10)%11;
  IF total=10 THEN total:=0; END IF;
  IF total <> substring(cpf_text,digit,1)::integer THEN RAISE EXCEPTION 'CPF inválido'; END IF;
 END LOOP;
 IF NEW.pix_key IS NULL OR char_length(btrim(NEW.pix_key)) < 4 OR char_length(NEW.pix_key)>140 THEN RAISE EXCEPTION 'Chave PIX inválida'; END IF;
 NEW.pix_key := btrim(NEW.pix_key);
 RETURN NEW;
END; $$;
CREATE OR REPLACE FUNCTION public.deduct_balance_on_withdrawal() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE available numeric;
BEGIN
 SELECT balance INTO available FROM public.profiles WHERE user_id=NEW.user_id FOR UPDATE;
 IF available IS NULL OR NEW.amount::text IN ('NaN','Infinity','-Infinity') OR NEW.amount<=0 OR available<NEW.amount THEN RAISE EXCEPTION 'Saldo insuficiente para saque'; END IF;
 UPDATE public.profiles SET balance=balance-NEW.amount,updated_at=now() WHERE user_id=NEW.user_id;
 RETURN NEW;
END; $$;
DROP POLICY IF EXISTS "Users can insert own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can insert own withdrawals" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND status='pending' AND amount>0 AND amount=round(amount,2) AND fee=round(amount*0.12,2) AND net_amount=amount-round(amount*0.12,2));
CREATE OR REPLACE FUNCTION public.handle_withdrawal_transition() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.amount IS DISTINCT FROM OLD.amount OR NEW.fee IS DISTINCT FROM OLD.fee OR NEW.net_amount IS DISTINCT FROM OLD.net_amount OR NEW.cpf IS DISTINCT FROM OLD.cpf OR NEW.pix_key IS DISTINCT FROM OLD.pix_key THEN RAISE EXCEPTION 'Dados do saque são imutáveis'; END IF;
 IF NEW.status IS DISTINCT FROM OLD.status THEN
  IF OLD.status <> 'pending' OR NEW.status NOT IN ('paid','rejected') THEN RAISE EXCEPTION 'Transição de saque inválida'; END IF;
  IF NEW.status='rejected' THEN UPDATE public.profiles SET balance=balance+OLD.amount,updated_at=now() WHERE user_id=OLD.user_id; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER trg_withdrawal_transition BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.handle_withdrawal_transition();

CREATE OR REPLACE FUNCTION public.handle_deposit_finances() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.status <> 'pending' OR NEW.amount::text IN ('NaN','Infinity','-Infinity') OR NEW.amount<20 OR NEW.amount>50000 OR NEW.amount<>round(NEW.amount,2) OR NEW.method IS DISTINCT FROM 'pix' OR NEW.payment_reference IS NOT NULL THEN RAISE EXCEPTION 'Depósito inválido'; END IF;
 ELSE
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.amount IS DISTINCT FROM OLD.amount OR NEW.method IS DISTINCT FROM OLD.method THEN RAISE EXCEPTION 'Dados do depósito são imutáveis'; END IF;
  IF OLD.payment_reference IS NOT NULL AND NEW.payment_reference IS DISTINCT FROM OLD.payment_reference THEN RAISE EXCEPTION 'Referência de pagamento é imutável'; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
   IF OLD.status<>'pending' OR NEW.status NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Transição de depósito inválida'; END IF;
   IF NEW.status='approved' THEN
    IF NEW.payment_reference IS NULL OR char_length(btrim(NEW.payment_reference))<8 OR char_length(NEW.payment_reference)>200 THEN RAISE EXCEPTION 'Informe a referência do pagamento PIX verificado'; END IF;
    UPDATE public.profiles SET balance=balance+NEW.amount,updated_at=now() WHERE user_id=NEW.user_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Perfil não encontrado'; END IF;
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER trg_deposit_finances BEFORE INSERT OR UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.handle_deposit_finances();
DROP POLICY IF EXISTS "Users can insert own deposits" ON public.deposits;
CREATE POLICY "Users can insert own deposits" ON public.deposits FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND status='pending' AND amount>=20 AND amount<=50000 AND amount=round(amount,2) AND method='pix' AND payment_reference IS NULL);

CREATE OR REPLACE FUNCTION public.handle_investment_finances() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE available numeric; configured public.investment_plans%ROWTYPE; purchases integer;
BEGIN
 IF TG_OP='INSERT' THEN
  SELECT balance INTO available FROM public.profiles WHERE user_id=NEW.user_id FOR UPDATE;
  SELECT * INTO configured FROM public.investment_plans WHERE id=NEW.plan_id AND is_active FOR SHARE;
  IF configured.id IS NULL OR available IS NULL OR configured.price<=0 OR configured.daily_return<=0 OR configured.duration_days<=0 OR configured.price::text IN ('NaN','Infinity','-Infinity') OR configured.daily_return::text IN ('NaN','Infinity','-Infinity') THEN RAISE EXCEPTION 'Plano inválido'; END IF;
  SELECT count(*) INTO purchases FROM public.investments WHERE user_id=NEW.user_id AND plan_id=NEW.plan_id AND status<>'rejected';
  IF purchases>=configured.purchase_limit THEN RAISE EXCEPTION 'Limite de compras atingido'; END IF;
  IF available<configured.price THEN RAISE EXCEPTION 'Saldo insuficiente'; END IF;
  IF NEW.status<>'pending' THEN RAISE EXCEPTION 'Investimentos devem iniciar pendentes'; END IF;
  NEW.plan_name:=configured.name; NEW.amount:=configured.price; NEW.daily_return:=configured.daily_return; NEW.duration_days:=configured.duration_days; NEW.credited_days:=0; NEW.expires_at:=NULL;
  UPDATE public.profiles SET balance=balance-NEW.amount,updated_at=now() WHERE user_id=NEW.user_id;
 ELSE
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.plan_id IS DISTINCT FROM OLD.plan_id OR NEW.plan_name IS DISTINCT FROM OLD.plan_name OR NEW.amount IS DISTINCT FROM OLD.amount OR NEW.daily_return IS DISTINCT FROM OLD.daily_return OR NEW.duration_days IS DISTINCT FROM OLD.duration_days THEN RAISE EXCEPTION 'Condições do investimento são imutáveis'; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
   IF OLD.status='pending' AND NEW.status='active' THEN NEW.started_at:=now(); NEW.expires_at:=NEW.started_at+make_interval(days=>NEW.duration_days);
   ELSIF OLD.status='pending' AND NEW.status='rejected' THEN UPDATE public.profiles SET balance=balance+OLD.amount,updated_at=now() WHERE user_id=OLD.user_id;
   ELSIF OLD.status='active' AND NEW.status='completed' AND NEW.credited_days=NEW.duration_days THEN NULL;
   ELSE RAISE EXCEPTION 'Transição de investimento inválida'; END IF;
  ELSIF NEW.started_at IS DISTINCT FROM OLD.started_at OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN RAISE EXCEPTION 'Prazo do investimento é imutável'; END IF;
  IF NEW.credited_days<OLD.credited_days OR NEW.credited_days>NEW.duration_days THEN RAISE EXCEPTION 'Crédito de rendimento inválido'; END IF;
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER trg_investment_finances BEFORE INSERT OR UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.handle_investment_finances();
CREATE OR REPLACE FUNCTION public.buy_investment_plan(_plan_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE owner_id uuid:=auth.uid(); result_id uuid;
BEGIN
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Faça login para investir'; END IF;
 INSERT INTO public.investments(user_id,plan_id,plan_name,status) VALUES(owner_id,_plan_id,'','pending') RETURNING id INTO result_id;
 RETURN result_id;
END; $$;
REVOKE ALL ON FUNCTION public.buy_investment_plan(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.buy_investment_plan(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.credit_investment_earning() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE investment public.investments%ROWTYPE;
BEGIN
 SELECT * INTO investment FROM public.investments WHERE id=NEW.investment_id;
 IF investment.id IS NULL OR investment.user_id<>NEW.user_id OR investment.status<>'active' OR NEW.cycle_day>investment.duration_days OR NEW.amount<>investment.daily_return OR now()<investment.started_at+make_interval(days=>NEW.cycle_day) THEN RAISE EXCEPTION 'Rendimento inválido'; END IF;
 UPDATE public.profiles SET balance=balance+NEW.amount,updated_at=now() WHERE user_id=NEW.user_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Perfil não encontrado'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER trg_credit_investment_earning AFTER INSERT ON public.investment_earnings FOR EACH ROW EXECUTE FUNCTION public.credit_investment_earning();
CREATE OR REPLACE FUNCTION private.accrue_investments(_user_id uuid) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private,pg_temp AS $$
DECLARE investment public.investments%ROWTYPE; due_days integer; day_number integer; count_credited integer:=0; inserted_count integer;
BEGIN
 PERFORM 1 FROM public.profiles WHERE user_id=_user_id FOR UPDATE;
 FOR investment IN SELECT * FROM public.investments WHERE user_id=_user_id AND status='active' AND duration_days>0 ORDER BY id FOR UPDATE LOOP
  due_days:=least(investment.duration_days,greatest(0,floor(extract(epoch FROM (now()-investment.started_at))/86400)::integer));
  FOR day_number IN investment.credited_days+1..due_days LOOP
   INSERT INTO public.investment_earnings(user_id,investment_id,cycle_day,amount) VALUES(_user_id,investment.id,day_number,investment.daily_return) ON CONFLICT (investment_id,cycle_day) DO NOTHING;
   GET DIAGNOSTICS inserted_count=ROW_COUNT; count_credited:=count_credited+inserted_count;
  END LOOP;
  IF due_days>investment.credited_days THEN UPDATE public.investments SET credited_days=due_days,status=CASE WHEN due_days=duration_days THEN 'completed' ELSE status END WHERE id=investment.id; END IF;
 END LOOP;
 RETURN count_credited;
END; $$;
REVOKE ALL ON FUNCTION private.accrue_investments(uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.sync_my_finances() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private,pg_temp AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Faça login'; END IF;
 RETURN private.accrue_investments(auth.uid());
END; $$;
REVOKE ALL ON FUNCTION public.sync_my_finances() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sync_my_finances() TO authenticated;
CREATE OR REPLACE FUNCTION private.process_due_investments() RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,private,pg_temp AS $$
DECLARE owner_id uuid;
BEGIN
 FOR owner_id IN SELECT DISTINCT user_id FROM public.investments WHERE status='active' AND duration_days>0 AND now()>=started_at+make_interval(days=>credited_days+1) ORDER BY user_id LOOP PERFORM private.accrue_investments(owner_id); END LOOP;
END; $$;
REVOKE ALL ON FUNCTION private.process_due_investments() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.get_business_date() RETURNS date LANGUAGE sql STABLE SET search_path=public,pg_temp AS $$ SELECT (now() AT TIME ZONE 'America/Bahia')::date $$;
GRANT EXECUTE ON FUNCTION public.get_business_date() TO authenticated;
ALTER TABLE public.check_ins ALTER COLUMN check_in_date SET DEFAULT public.get_business_date();
DROP POLICY IF EXISTS "Users can insert own check_ins" ON public.check_ins;
CREATE POLICY "Users can insert own check_ins" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND check_in_date=public.get_business_date() AND bonus_amount=0.50);

REVOKE ALL ON FUNCTION public.handle_withdrawal_transition(),public.handle_deposit_finances(),public.handle_investment_finances(),public.credit_investment_earning() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON public.profiles,public.deposits,public.withdrawals,public.investments,public.check_ins,public.referrals,public.support_tickets FROM anon;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.investments,public.referrals FROM authenticated;
REVOKE TRUNCATE,REFERENCES,TRIGGER ON public.profiles,public.deposits,public.withdrawals,public.check_ins,public.support_tickets FROM authenticated;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.investment_plans FROM anon,authenticated;
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('credit-due-investment-earnings','0 * * * *','SELECT private.process_due_investments();');