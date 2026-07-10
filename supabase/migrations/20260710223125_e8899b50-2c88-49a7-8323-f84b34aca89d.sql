
ALTER TABLE public.investment_plans ADD COLUMN IF NOT EXISTS purchase_limit integer NOT NULL DEFAULT 5;

DELETE FROM public.investment_plans;

INSERT INTO public.investment_plans (slug, name, description, price, daily_return, duration_days, purchase_limit, sort_order, is_active) VALUES
('carregadeira-subterranea', 'Carregadeira Subterrânea', 'Plano inicial de mineração', 30, 15, 3, 1, 1, true),
('perfuracao-pocos', 'Perfuração de Poços', 'Retorno rápido em 3 dias', 85, 35, 3, 3, 2, true),
('caminhao-mineracao', 'Caminhão de Mineração', 'Transporte de riqueza', 150, 38, 5, 5, 3, true),
('perfuratriz-jumbo', 'Perfuratriz Jumbo', 'Perfuração de alta potência', 300, 55, 7, 5, 4, true),
('mineracao-continua', 'Mineração Contínua', 'Operação ininterrupta', 650, 80, 10, 5, 5, true),
('moinho-bolas-premium', 'Moinho de Bolas Premium', 'Máximo rendimento', 1500, 200, 15, 5, 6, true);
