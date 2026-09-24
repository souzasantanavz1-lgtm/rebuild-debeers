UPDATE public.investment_plans
SET name = CASE slug
  WHEN 'diamante-bruto' THEN 'Pacote de Diamantes'
  WHEN 'diamante-lapidado' THEN 'Baú de Diamantes'
  WHEN 'diamante-solitario' THEN 'Carreta de Diamantes'
  WHEN 'diamante-royal' THEN 'Cofre de Diamantes'
  WHEN 'diamante-imperial' THEN 'Mina de Diamantes'
  WHEN 'diamante-eternity' THEN 'Império de Diamantes'
  ELSE name
END,
description = CASE slug
  WHEN 'diamante-bruto' THEN 'O primeiro lote para começar sua jornada com diamantes.'
  WHEN 'diamante-lapidado' THEN 'Uma seleção maior de diamantes lapidados e brilhantes.'
  WHEN 'diamante-solitario' THEN 'Uma carreta inteira transportando uma grande carga de diamantes.'
  WHEN 'diamante-royal' THEN 'Um cofre blindado reservado exclusivamente para diamantes.'
  WHEN 'diamante-imperial' THEN 'Uma operação completa de extração em uma mina de diamantes.'
  WHEN 'diamante-eternity' THEN 'O maior nível da coleção, com um verdadeiro império de diamantes.'
  ELSE description
END
WHERE slug IN (
  'diamante-bruto',
  'diamante-lapidado',
  'diamante-solitario',
  'diamante-royal',
  'diamante-imperial',
  'diamante-eternity'
);