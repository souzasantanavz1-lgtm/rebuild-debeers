import { Zap, Banknote, Star, AlertTriangle, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Perfil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-muted pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-16">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      {/* Lucro Diário Automático Card */}
      <div className="px-4 -mt-10">
        <Card className="shadow-lg">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              Lucro Diário Automático
              <span className="text-blue-500">💎</span>
            </h3>

            <div className="flex gap-3 mt-4">
              <div className="flex-1 bg-muted rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                  <Zap className="h-4 w-4" />
                  Depósito
                </div>
                <p className="text-xl font-bold text-foreground">R$ 20,00</p>
              </div>
              <div className="flex-1 bg-muted rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mb-1">
                  <Banknote className="h-4 w-4" />
                  Saque
                </div>
                <p className="text-xl font-bold text-foreground">R$ 20 (12%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programa de Indicação */}
      <div className="px-4 mt-4">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-amber-500" />
              Programa de Indicação
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">1ª Compra</p>
                <div className="space-y-1">
                  <p className="text-sm"><span className="text-amber-500 font-bold">N1</span> 🌟🌟 <span className="font-semibold">15%</span></p>
                  <p className="text-sm"><span className="text-blue-500 font-bold">N2</span> 🔷🔷 <span className="font-semibold">2%</span></p>
                  <p className="text-sm"><span className="text-red-500 font-bold">N3</span> 🔴🔴 <span className="font-semibold">1%</span></p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Demais</p>
                <div className="space-y-1">
                  <p className="text-sm"><span className="text-amber-500 font-bold">N1</span> 🌟🌟 <span className="font-semibold">8%</span></p>
                  <p className="text-sm"><span className="text-blue-500 font-bold">N2</span> 🔷🔷 <span className="font-semibold">1%</span></p>
                  <p className="text-sm"><span className="text-red-500 font-bold">N3</span> 🔴🔴 <span className="font-semibold">1%</span></p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs">Só saça com plano ativo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Groups */}
      <div className="px-4 mt-4 space-y-3">
        <Button
          className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2"
          style={{ backgroundColor: "hsl(220, 80%, 50%)" }}
          onClick={() => toast({ title: "Grupo WhatsApp #2", description: "Link em breve." })}
        >
          <MessageCircle className="h-5 w-5" />
          Grupo WhatsApp #2
        </Button>
        <Button
          className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2"
          style={{ backgroundColor: "hsl(220, 80%, 40%)" }}
          onClick={() => toast({ title: "Grupo WhatsApp #1", description: "Link em breve." })}
        >
          <MessageCircle className="h-5 w-5" />
          Grupo WhatsApp #1
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 text-base font-semibold rounded-xl"
          onClick={() => toast({ title: "Comece agora", description: "Em desenvolvimento." })}
        >
          Comece agora
        </Button>
      </div>

      <div className="h-6" />
      <BottomNav />
    </div>
  );
};

export default Perfil;
