import { useEffect, useState } from "react";
import { TrendingUp, Clock, Target, DollarSign, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import planBruto from "@/assets/plano-pacote-diamantes.png.asset.json";
import planLapidado from "@/assets/plano-bau-diamantes.webp.asset.json";
import planCaminhao from "@/assets/plano-carreta-diamantes.webp.asset.json";
import planCofre from "@/assets/plano-cofre-diamantes.webp.asset.json";
import planMina from "@/assets/plano-mina-diamantes.webp.asset.json";
import planEternity from "@/assets/plano-imperio-diamantes.webp.asset.json";

const IMG: Record<string, string> = {
  "diamante-bruto": planBruto.url,
  "diamante-lapidado": planLapidado.url,
  "diamante-solitario": planCaminhao.url,
  "diamante-royal": planCofre.url,
  "diamante-imperial": planMina.url,
  "diamante-eternity": planEternity.url,
};

const ICON: Record<string, string> = {
  "diamante-bruto": "📦",
  "diamante-lapidado": "🧰",
  "diamante-solitario": "🚛",
  "diamante-royal": "🔐",
  "diamante-imperial": "⛰️",
  "diamante-eternity": "🏭",
};

type Plan = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  daily_return: number;
  duration_days: number;
  purchase_limit: number;
};

const Planos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [balance, setBalance] = useState(0);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    supabase
      .from("investment_plans")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data, error }) => {
        if (error) setLoadError(true);
        else if (data) setPlans(data as Plan[]);
      });
    if (user) {
      supabase
        .from("profiles")
        .select("balance")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setBalance(Number(data.balance));
        });
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

  // Comparação proporcional: lucro total / valor investido, entre ciclos de até 7 dias.
  const shortPlans = plans.filter((p) => p.duration_days <= 7 && Number(p.price) > 0);
  const bestShortPlan = shortPlans.reduce<Plan | null>((best, plan) => {
    const rate = (Number(plan.daily_return) * plan.duration_days - Number(plan.price)) / Number(plan.price);
    const bestRate = best
      ? (Number(best.daily_return) * best.duration_days - Number(best.price)) / Number(best.price)
      : -Infinity;
    return rate > bestRate ? plan : best;
  }, null);

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      <div className="px-4 mt-4">
        <h2 className="text-lg font-semibold text-primary mb-1">Coleção De Beers</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Compare investimento, retorno projetado e prazo de cada plano.
        </p>

        <div className="space-y-4">
          {plans.map((p) => {
            const price = Number(p.price);
            const daily = Number(p.daily_return);
            const days = Number(p.duration_days);
            const totalReturn = daily * days;
            const profit = totalReturn - price;
            const profitPct = price > 0 ? (profit / price) * 100 : 0;
            return (
              <Card key={p.id} className={`overflow-hidden ${p.id === bestShortPlan?.id ? "border-primary ring-1 ring-primary/30" : ""}`}>
                <img
                  src={IMG[p.slug] || planBruto.url}
                  alt={p.name}
                  loading={p.slug === "diamante-bruto" ? "eager" : "lazy"}
                  width={1024}
                  height={768}
                  className="w-full h-44 object-cover"
                />
                <CardContent className="p-4">
                  {p.id === bestShortPlan?.id && (
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground">Melhor retorno percentual em até 7 dias</Badge>
                      <span className="text-xs text-muted-foreground">Comparação entre os planos desta página</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{ICON[p.slug]}</span>
                    <h3 className="font-semibold text-primary text-base">{p.name}</h3>
                  </div>

                  <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 p-3 mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Investimento</span>
                    <span className="text-lg font-bold text-rose-700 dark:text-rose-300 tabular-nums">
                      R$ {price.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Retorno/dia
                      </p>
                      <p className="text-base font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        R$ {daily.toFixed(2)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-3">
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Ciclo
                      </p>
                      <p className="text-base font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        {days} dias
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 p-2.5 mb-2 flex items-center justify-center gap-2">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-primary">
                      Limite: <span className="font-semibold">{p.purchase_limit}</span>{" "}
                      {p.purchase_limit === 1 ? "compra" : "compras"} por usuário
                    </span>
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 mb-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Target className="h-4 w-4 text-amber-600" /> Retorno projetado
                    </span>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-300 tabular-nums">
                        R$ {totalReturn.toFixed(2)}
                      </p>
                        <Badge variant="secondary" className="text-[10px]">
                          {profitPct >= 0 ? "+" : ""}{profitPct.toFixed(1)}% sobre o investido
                      </Badge>
                    </div>
                  </div>

                  <Button onClick={() => invest(p)} className="w-full h-11 text-base font-semibold">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Investir Agora
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {loadError && <p className="text-sm text-destructive text-center py-8">Não foi possível carregar os planos. Tente novamente.</p>}
          {!loadError && plans.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Carregando planos...</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Planos;
