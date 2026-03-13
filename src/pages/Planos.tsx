import { LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const Planos = () => {
  return (
    <div className="min-h-screen bg-muted pb-20">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      <div className="px-4 mt-6">
        <Card className="shadow-sm">
          <CardContent className="p-6 text-center">
            <LayoutGrid className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-primary mb-2">Planos de Investimento</h2>
            <p className="text-muted-foreground text-sm">
              Em breve você poderá escolher entre nossos planos de investimento em diamantes.
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Planos;
