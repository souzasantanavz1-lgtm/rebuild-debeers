import { Lock, Package, FileText, MessageCircle, Info, Users, Download, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const profileActions = [
  { icon: Lock, label: "alterar\nsenha", bg: "bg-emerald-500", color: "text-white" },
  { icon: Package, label: "investimentos", bg: "bg-orange-500", color: "text-white" },
  { icon: FileText, label: "extrato", bg: "bg-purple-400", color: "text-white" },
  { icon: MessageCircle, label: "grupo 01", bg: "bg-cyan-500", color: "text-white" },
  { icon: MessageCircle, label: "grupo 02", bg: "bg-cyan-500", color: "text-white" },
  { icon: Info, label: "sobre", bg: "bg-blue-600", color: "text-white" },
  { icon: Users, label: "código", bg: "bg-pink-500", color: "text-white" },
  { icon: Download, label: "download", bg: "bg-amber-500", color: "text-white" },
  { icon: LogOut, label: "sair", bg: "bg-gray-700", color: "text-white" },
];

const Perfil = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-muted pb-20">
      {/* Dark Blue Header */}
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-16">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      {/* Alterar Senha Card - overlapping header */}
      <div className="px-4 -mt-10">
        <Card className="shadow-lg">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-foreground">Alterar Senha</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Funcionalidade de alteração de senha em desenvolvimento.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deposit / Withdrawal Buttons */}
      <div className="px-4 mt-4 flex gap-3">
        <Button
          className="flex-1 h-12 text-base font-semibold rounded-xl"
          style={{ backgroundColor: "hsl(180, 70%, 50%)" }}
        >
          depósito
        </Button>
        <Button
          className="flex-1 h-12 text-base font-semibold rounded-xl"
          style={{ backgroundColor: "hsl(340, 80%, 60%)" }}
        >
          Retirada
        </Button>
      </div>

      {/* Actions Card */}
      <div className="px-4 mt-6">
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <h3 className="text-lg font-semibold text-primary mb-4">Ações</h3>
            <div className="grid grid-cols-4 gap-4">
              {profileActions.map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center gap-2"
                  onClick={() => {
                    if (action.label === "sair") {
                      navigate("/");
                      toast({ title: "Logout", description: "Você saiu da conta." });
                    } else {
                      toast({ title: action.label, description: "Em desenvolvimento." });
                    }
                  }}
                >
                  <div className={`${action.bg} ${action.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-md`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] text-foreground font-medium text-center leading-tight whitespace-pre-line">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Perfil;
