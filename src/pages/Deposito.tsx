import { useEffect, useState } from "react";
import { CreditCard, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Deposit = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
};

const PRESETS = [50, 100, 200, 500, 1000, 5000];

const Deposito = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [copied, setCopied] = useState(false);
  const [pixKey, setPixKey] = useState<string | null>(null);

  const loadDeposits = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("deposits")
      .select("id, amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setDeposits(data);
  };

  useEffect(() => {
    loadDeposits();
  }, [user]);

  const handleDeposit = async () => {
    const value = Number(amount);
    if (!value || value < 50) {
      toast({ title: "Valor inválido", description: "Mínimo de R$ 50,00", variant: "destructive" });
      return;
    }
    if (value > 50000) {
      toast({ title: "Valor inválido", description: "Máximo de R$ 50.000,00", variant: "destructive" });
      return;
    }
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("deposits")
      .insert({ user_id: user.id, amount: value, status: "pending", method: "pix" });
    setLoading(false);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    const fakePix = `00020126360014BR.GOV.BCB.PIX0114debeers${Date.now()}5204000053039865802BR5910DE BEERS6009SAO PAULO62070503***6304`;
    setPixKey(fakePix);
    toast({ title: "Depósito criado ✅", description: "Aguardando confirmação do PIX." });
    setAmount("");
    loadDeposits();
  };

  const copyPix = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      <div className="px-4 mt-4 space-y-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Depósito via PIX</h2>
            </div>

            <Label htmlFor="amount" className="text-sm">Valor (R$ 50 — R$ 50.000)</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min={50}
              max={50000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="mt-1.5"
            />

            <div className="grid grid-cols-3 gap-2 mt-3">
              {PRESETS.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(String(v))}
                  className="py-2 rounded-md border border-border text-sm font-medium hover:bg-secondary transition-colors"
                >
                  R$ {v}
                </button>
              ))}
            </div>

            <Button onClick={handleDeposit} disabled={loading} className="w-full mt-4">
              {loading ? "Gerando PIX..." : "Gerar PIX"}
            </Button>

            {pixKey && (
              <div className="mt-4 p-3 rounded-lg bg-secondary border border-border">
                <p className="text-xs text-muted-foreground mb-2">PIX Copia e Cola</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs flex-1 truncate">{pixKey}</code>
                  <Button size="icon" variant="outline" onClick={copyPix}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Após o pagamento, o saldo será creditado em até alguns minutos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-primary mb-3">Histórico</h3>
            {deposits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum depósito ainda.</p>
            ) : (
              <div className="space-y-2">
                {deposits.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">R$ {Number(d.amount).toFixed(2).replace(".", ",")}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(d.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant={d.status === "approved" ? "default" : "secondary"}>
                      {d.status === "approved" ? "Aprovado" : d.status === "pending" ? "Pendente" : "Rejeitado"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Deposito;
