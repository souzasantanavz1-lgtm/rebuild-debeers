import { CalendarCheck, CreditCard, Banknote, Users, HelpCircle, TrendingUp, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import deBeersLogo from "@/assets/de-beers-logo.svg";
import heroMiner from "@/assets/hero-miner.jpg";
import heroDiamonds from "@/assets/hero-diamonds.jpg";

const actions = [
  { icon: CalendarCheck, label: "Check-in", color: "text-primary" },
  { icon: CreditCard, label: "Depósito", color: "text-primary" },
  { icon: Banknote, label: "Saque", color: "text-primary" },
  { icon: Users, label: "Indicação", color: "text-primary" },
  { icon: HelpCircle, label: "Suporte", color: "text-primary" },
];

const recentEarnings = [
  { name: "João S.****", plan: "Cofre de Diamantes", amount: "+R$ 88,00", time: "10 minutos atrás" },
  { name: "Diego F.*******", plan: "Diamante Lapidado", amount: "+R$ 20,00", time: "15 minutos atrás" },
  { name: "Mariana D.***", plan: "Coleção de Cervejas", amount: "+R$ 180,00", time: "1 min atrás" },
  { name: "Vinícius B.*****", plan: "Tesouro de Cervejas", amount: "+R$ 220,00", time: "7 min atrás" },
  { name: "Isabela A.*****", plan: "Diamante Bruto", amount: "+R$ 10,00", time: "10 minutos atrás" },
  { name: "Carlos M.***", plan: "Mina de Diamantes", amount: "+R$ 275,00", time: "3 min atrás" },
  { name: "Ana P.****", plan: "Lapidação Premium", amount: "+R$ 400,00", time: "5 minutos atrás" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with Logo */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <img src={deBeersLogo} alt="De Beers" className="h-10 w-auto" />
        <p className="text-lg font-serif tracking-widest text-muted-foreground">
          A DIAMOND IS FOREVER
        </p>
      </header>

      {/* Balance */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <p className="text-xs text-muted-foreground">Saldo Disponível</p>
        <p className="text-xl font-bold text-primary">R$ 0,00</p>
      </div>

      {/* Hero Images Carousel */}
      <div className="space-y-1">
        <img src={heroMiner} alt="Mineração De Beers" className="w-full h-48 object-cover" />
        <img src={heroDiamonds} alt="Diamantes De Beers" className="w-full h-48 object-cover" />
      </div>

      {/* Commerce Label */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm text-muted-foreground font-medium">
          Comércio exclusivo de diamantes
        </p>
      </div>

      {/* Actions Grid */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="grid grid-cols-2 gap-0.5 h-4 w-4">
            <span className="bg-primary rounded-sm" />
            <span className="bg-primary rounded-sm" />
            <span className="bg-primary rounded-sm" />
            <span className="bg-primary rounded-sm" />
          </span>
          Ações
        </h3>
        <div className="flex justify-between gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-secondary transition-colors flex-1"
            >
              <action.icon className={`h-6 w-6 ${action.color}`} />
              <span className="text-[10px] text-foreground font-medium text-center leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Ganhos Recentes
        </h3>
        <div className="space-y-3">
          {recentEarnings.map((earning, index) => (
            <div key={index} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <div className="bg-secondary rounded-full p-2 mt-0.5">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{earning.name}</p>
                <p className="text-xs text-muted-foreground">{earning.plan}</p>
                <p className="text-xs text-muted-foreground">{earning.time}</p>
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                {earning.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit CTA */}
      <div className="px-4 pb-6">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Depósito</p>
              <p className="text-xs text-muted-foreground">Recarregue sua conta já</p>
            </div>
            <Button size="sm" variant="default">Depositar</Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
