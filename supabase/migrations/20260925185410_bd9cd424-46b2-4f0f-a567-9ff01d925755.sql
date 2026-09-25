UPDATE public.investment_plans
SET daily_return = round((daily_return * 1.10)::numeric, 2)
WHERE is_active = true
  AND slug IN (
    'diamante-bruto',
    'diamante-lapidado',
    'diamante-solitario',
    'diamante-royal',
    'diamante-imperial',
    'diamante-eternity'
  );