import { useEffect, useState } from "react";
import { TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import planBruto from "@/assets/plan-bruto.jpg";
import planLapidado from "@/assets/plan-lapidado.jpg";
import planMina from "@/assets/plan-mina.jpg";
import planCofre from "@/assets/plan-cofre.jpg";
import planTesouro from "@/assets/plan-tesouro.jpg";

const IMG: Record<string, string> = {
  "diamante-bruto": planBruto,
  "diamante-lapidado": planLapidado,
  "mina-diamantes": planMina,
  "cofre-diamantes": planCofre,
  "tesouro-real": planTesouro,
};

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  daily_return: number;
  duration_days: number;
};

const Planos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    supabase.from("investment_plans").select("*").eq("is_active", true).order("sort_order")
      .then(({ data }) => { if (data) setPlans(data as Plan[]); });
    if (user) {
      supabase.from("profiles").select("balance").eq("user_id", user.id).single()
        .then(({ data }) => { if (data) setBalance(Number(data.balance)); });
    }
  }, [user]);

  const invest = (p: Plan) => {
    if (balance < p.price) {
      toast({
        title: "Saldo insuficiente",
        description: `Faça um depósito para investir em ${p.name}.`,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Em análise 💎",
      description: "Sua solicitação de investimento foi enviada e será ativada após confirmação.",
    });
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      <div className="px-4 mt-4">
        <h2 className="text-lg font-semibold text-primary mb-1">Planos de Investimento</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Escolha um plano e receba rendimentos diários por 30 dias.
        </p>

        <div className="space-y-4">
          {plans.map((p) => {
            const roi = ((p.daily_return * p.duration_days) / p.price * 100).toFixed(0);
            return (
              <Card key={p.id} className="overflow-hidden">
                <img
                  src={IMG[p.slug] || planLapidado}
                  alt={p.name}
                  loading="lazy"
                  width={768}
                  height={512}
                  className="w-full h-40 object-cover"
                />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-primary text-base">{p.name}</h3>
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </div>
                    <Badge variant="secondary">+{roi}%</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="bg-secondary rounded-md p-2">
                      <p className="text-[10px] text-muted-foreground">Investimento</p>
                      <p className="text-sm font-bold">R$ {p.price}</p>
                    </div>
                    <div className="bg-secondary rounded-md p-2">
                      <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" />Diário</p>
                      <p className="text-sm font-bold text-emerald-600">R$ {p.daily_return}</p>
                    </div>
                    <div className="bg-secondary rounded-md p-2">
                      <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1"><Clock className="h-3 w-3" />Prazo</p>
                      <p className="text-sm font-bold">{p.duration_days}d</p>
                    </div>
                  </div>

                  <Button onClick={() => invest(p)} className="w-full">Investir agora</Button>
                </CardContent>
              </Card>
            );
          })}
          {plans.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Carregando planos...</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Planos;
