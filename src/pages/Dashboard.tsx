import { useState, useEffect } from "react";
import { CalendarCheck, CreditCard, Banknote, Users, HelpCircle, TrendingUp, User, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import heroDiamonds from "@/assets/hero-diamonds.jpg";
import heroMiner from "@/assets/hero-miner.jpg";

const actions = [
  { icon: CalendarCheck, label: "Check-in" },
  { icon: CreditCard, label: "Depósito" },
  { icon: Banknote, label: "Saque" },
  { icon: LayoutGrid, label: "por" },
  { icon: Users, label: "Indicação" },
  { icon: HelpCircle, label: "Suporte" },
];

const heroImages = [heroMiner, heroDiamonds];

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
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-muted pb-20">
      {/* Dark Blue Header */}
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
          <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-80">Saldo p/ Investir</p>
          <p className="text-xl font-bold">R$ 0,00</p>
        </div>
      </header>

      {/* Image Carousel */}
      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {heroImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Slide ${i + 1}`}
                className="w-full h-52 object-cover flex-shrink-0"
              />
            ))}
          </div>
        </div>
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === currentSlide ? "bg-primary" : "bg-primary-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Actions Card */}
      <div className="px-4 mt-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold text-primary mb-4">Ações</h3>
            <div className="grid grid-cols-3 gap-3">
              {actions.map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary transition-colors"
                >
                  <action.icon className="h-7 w-7 text-primary" />
                  <span className="text-xs text-foreground font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings Card */}
      <div className="px-4 mt-4 pb-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ganhos Recentes
            </h3>
            <div className="space-y-3">
              {recentEarnings.map((earning, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="bg-secondary rounded-full p-2">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{earning.name}</p>
                    <p className="text-xs text-muted-foreground">{earning.plan}</p>
                    <p className="text-[10px] text-muted-foreground">{earning.time}</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {earning.amount}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
