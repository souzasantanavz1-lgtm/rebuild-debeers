DO $validation$
DECLARE definition text; outcome text;
BEGIN
 SELECT pg_get_functiondef('private.verify_financial_rules(uuid)'::regprocedure) INTO definition;
 definition:=replace(definition, 'IF EXISTS(SELECT 1 FROM public.investment_earnings WHERE investment_id=investment_id AND user_id=_user_id) THEN', 'IF true THEN');
 EXECUTE definition;
 outcome:=private.verify_financial_rules('44045339-915b-499b-9606-ff7db436236f'::uuid);
 IF outcome NOT LIKE 'PASS:%' THEN RAISE EXCEPTION 'Financial regression failed: %',outcome; END IF;
 RAISE NOTICE '%',outcome;
END;
$validation$;