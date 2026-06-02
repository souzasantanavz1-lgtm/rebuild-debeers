-- Update check-in bonus to R$0.50
ALTER TABLE public.check_ins ALTER COLUMN bonus_amount SET DEFAULT 0.50;

DROP POLICY IF EXISTS "Users can insert own check_ins" ON public.check_ins;
CREATE POLICY "Users can insert own check_ins"
ON public.check_ins
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND check_in_date = CURRENT_DATE
  AND bonus_amount = 0.50
);