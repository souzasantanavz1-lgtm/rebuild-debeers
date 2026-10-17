-- Run with a managed database connection and a test_user psql variable.
-- Every operation rolls back, including successful financial writes.
\set ON_ERROR_STOP on
BEGIN;
SELECT set_config('test.user_id', :'test_user', true);
DO $$
DECLARE
 owner_id uuid:=current_setting('test.user_id')::uuid;
 initial_balance numeric; after_balance numeric; deposit_id uuid; withdrawal_id uuid; second_withdrawal uuid;
 investment_id uuid; configured public.investment_plans%ROWTYPE; denied boolean;
BEGIN
 SELECT balance INTO initial_balance FROM public.profiles WHERE user_id=owner_id FOR UPDATE;
 IF initial_balance IS NULL THEN RAISE EXCEPTION 'Test user profile missing'; END IF;
 -- Funding uses the same verified-deposit transition as production, never a direct balance write.
 INSERT INTO public.deposits(user_id,amount) VALUES(owner_id,10000) RETURNING id INTO deposit_id;
 UPDATE public.deposits SET status='approved',payment_reference='ROLLBACK-TEST-'||deposit_id WHERE id=deposit_id;
 IF (SELECT balance FROM public.profiles WHERE user_id=owner_id)<>initial_balance+10000 THEN RAISE EXCEPTION 'Deposit was not credited'; END IF;
 UPDATE public.deposits SET status='approved' WHERE id=deposit_id;
 IF (SELECT balance FROM public.profiles WHERE user_id=owner_id)<>initial_balance+10000 THEN RAISE EXCEPTION 'Duplicate deposit credit'; END IF;
 denied:=false;
 BEGIN UPDATE public.deposits SET status='pending' WHERE id=deposit_id; EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Terminal deposit reopened'; END IF;
 denied:=false;
 BEGIN UPDATE public.profiles SET balance=balance+100000 WHERE user_id=owner_id; EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Direct balance mutation allowed'; END IF;
 -- Both pending withdrawals must succeed; the first is already deducted, not reserved twice.
 INSERT INTO public.withdrawals(user_id,amount,fee,net_amount,cpf,pix_key) VALUES(owner_id,6000,720,5280,'52998224725','test@example.invalid') RETURNING id INTO withdrawal_id;
 INSERT INTO public.withdrawals(user_id,amount,fee,net_amount,cpf,pix_key) VALUES(owner_id,28.57,3.43,25.14,'52998224725','test@example.invalid') RETURNING id INTO second_withdrawal;
 IF (SELECT balance FROM public.profiles WHERE user_id=owner_id)<>initial_balance+3971.43 THEN RAISE EXCEPTION 'Wrong withdrawal deduction'; END IF;
 UPDATE public.withdrawals SET status='rejected' WHERE id=withdrawal_id;
 SELECT balance INTO after_balance FROM public.profiles WHERE user_id=owner_id;
 UPDATE public.withdrawals SET status='rejected' WHERE id=withdrawal_id;
 IF (SELECT balance FROM public.profiles WHERE user_id=owner_id)<>after_balance THEN RAISE EXCEPTION 'Duplicate refund'; END IF;
 UPDATE public.withdrawals SET status='rejected' WHERE id=second_withdrawal;
 IF (SELECT balance FROM public.profiles WHERE user_id=owner_id)<>initial_balance+10000 THEN RAISE EXCEPTION 'Refund did not restore gross amount'; END IF;
 denied:=false;
 BEGIN INSERT INTO public.withdrawals(user_id,amount,fee,net_amount,cpf,pix_key) VALUES(owner_id,1.001,.12,.881,'52998224725','test@example.invalid'); EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Fractional-cent withdrawal accepted'; END IF;
 denied:=false;
 BEGIN INSERT INTO public.withdrawals(user_id,amount,fee,net_amount,cpf,pix_key) VALUES(owner_id,100,12,88,'11111111111','test@example.invalid'); EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Invalid CPF accepted'; END IF;
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
 SELECT * INTO configured FROM public.investment_plans WHERE slug='diamante-bruto';
 IF configured.price<>50 OR configured.daily_return<>20 OR configured.duration_days<>5 THEN RAISE EXCEPTION 'Pacote values changed'; END IF;
 investment_id:=public.buy_investment_plan(configured.id);
 IF NOT EXISTS (SELECT 1 FROM public.investments WHERE id=investment_id AND status='pending' AND amount=50 AND daily_return=20 AND duration_days=5 AND credited_days=0) THEN RAISE EXCEPTION 'Wrong immutable purchase snapshot'; END IF;
 IF (SELECT balance FROM public.profiles WHERE user_id=owner_id)<>initial_balance+9950 THEN RAISE EXCEPTION 'Purchase was not deducted'; END IF;
 denied:=false;
 BEGIN PERFORM public.buy_investment_plan(configured.id); EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Purchase limit bypass'; END IF;
 UPDATE public.investments SET status='active' WHERE id=investment_id;
 PERFORM public.sync_my_finances();
 PERFORM public.sync_my_finances();
 IF (SELECT credited_days FROM public.investments WHERE id=investment_id)<>0 THEN RAISE EXCEPTION 'Premature daily yield credited'; END IF;
 denied:=false;
 BEGIN INSERT INTO public.investment_earnings(user_id,investment_id,cycle_day,amount) VALUES(owner_id,investment_id,1,20); EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Yield credited before 24 hours'; END IF;
 denied:=false;
 BEGIN UPDATE public.investments SET daily_return=20000 WHERE id=investment_id; EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Investment conditions changed'; END IF;
 denied:=false;
 BEGIN UPDATE public.investments SET status='completed' WHERE id=investment_id; EXCEPTION WHEN OTHERS THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Investment completed without all daily credits'; END IF;
 RAISE NOTICE 'PASS: deposit credit, idempotency, terminal states, balance protection, cent rounding, pending availability, refund, CPF, purchase snapshot, purchase limit, daily timing';
END $$;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.user_id'), true);
DO $$
BEGIN
 IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id<>auth.uid()) THEN RAISE EXCEPTION 'Cross-user profile exposed'; END IF;
 IF EXISTS (SELECT 1 FROM public.investment_earnings WHERE user_id<>auth.uid()) THEN RAISE EXCEPTION 'Cross-user earnings exposed'; END IF;
 IF has_function_privilege('authenticated','private.accrue_investments(uuid)','EXECUTE') THEN RAISE EXCEPTION 'Privileged accrual exposed'; END IF;
 IF has_table_privilege('authenticated','public.investments','INSERT') THEN RAISE EXCEPTION 'Direct investment insert exposed'; END IF;
 RAISE NOTICE 'PASS: authenticated isolation and least privilege';
END $$;
ROLLBACK;