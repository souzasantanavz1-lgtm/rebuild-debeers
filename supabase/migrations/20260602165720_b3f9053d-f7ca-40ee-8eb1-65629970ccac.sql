
-- =========== CHECK-INS ===========
CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  check_in_date date NOT NULL DEFAULT CURRENT_DATE,
  bonus_amount numeric NOT NULL DEFAULT 1.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, check_in_date)
);

GRANT SELECT, INSERT ON public.check_ins TO authenticated;
GRANT ALL ON public.check_ins TO service_role;

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check_ins"
  ON public.check_ins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check_ins"
  ON public.check_ins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND check_in_date = CURRENT_DATE AND bonus_amount = 1.00);

-- Trigger: credita bônus no saldo de forma atômica
CREATE OR REPLACE FUNCTION public.credit_checkin_bonus()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
    SET balance = balance + NEW.bonus_amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_checkin_bonus
AFTER INSERT ON public.check_ins
FOR EACH ROW EXECUTE FUNCTION public.credit_checkin_bonus();

-- =========== SUPPORT TICKETS ===========
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tickets"
  ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'open'
    AND char_length(subject) BETWEEN 3 AND 120
    AND char_length(message) BETWEEN 10 AND 2000
  );

-- =========== INVESTMENT PLANS (catálogo público) ===========
CREATE TABLE public.investment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  daily_return numeric NOT NULL,
  duration_days int NOT NULL DEFAULT 30,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.investment_plans TO anon, authenticated;
GRANT ALL ON public.investment_plans TO service_role;

ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable"
  ON public.investment_plans FOR SELECT
  USING (is_active = true);

INSERT INTO public.investment_plans (slug, name, description, price, daily_return, duration_days, sort_order) VALUES
  ('diamante-bruto',   'Diamante Bruto',    'Plano de entrada para iniciantes',  50,    5,   30, 1),
  ('diamante-lapidado','Diamante Lapidado', 'Equilíbrio entre custo e retorno',  200,   20,  30, 2),
  ('mina-diamantes',   'Mina de Diamantes', 'Para investidores dedicados',       1000,  100, 30, 3),
  ('cofre-diamantes',  'Cofre de Diamantes','Plano premium de alto rendimento',  2500,  275, 30, 4),
  ('tesouro-real',     'Tesouro Real',      'Plano elite De Beers',              5000,  600, 30, 5);
