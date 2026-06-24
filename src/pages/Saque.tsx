import { useEffect, useState } from "react";
import { Banknote, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Withdrawal = {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: string;
  created_at: string;
};

const Saque = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState<string>("");
  const [cpf, setCpf] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Withdrawal[]>([]);

  const load = async () => {
    if (!user) return;
    const [{ data: profile }, { data: ws }] = await Promise.all([
      supabase.from("profiles").select("balance").eq("user_id", user.id).single(),
      supabase.from("withdrawals").select("id, amount, fee, net_amount, status, created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    if (profile) setBalance(Number(profile.balance));
    if (ws) setList(ws);
  };

  useEffect(() => { load(); }, [user]);

  const value = Number(amount) || 0;
  const fee = +(value * 0.12).toFixed(2);
  const net = +(value * 0.88).toFixed(2);

  const handleSubmit = async () => {
    if (!user) return;
    if (!value || value <= 0) return toast({ title: "Valor inválido", variant: "destructive" });
    if (value > balance) return toast({ title: "Saldo insuficiente", variant: "destructive" });
    if (cpf.replace(/\D/g, "").length !== 11) return toast({ title: "CPF inválido", variant: "destructive" });
    const pix = pixKey.trim();
    if (pix.length < 4 || pix.length > 140) return toast({ title: "Chave PIX inválida", description: "Use de 4 a 140 caracteres.", variant: "destructive" });

    setLoading(true);
    const { error } = await supabase.from("withdrawals").insert({
      user_id: user.id, amount: value, fee, net_amount: net,
      cpf: cpf.replace(/\D/g, ""), pix_key: pix, status: "pending",
    });
    setLoading(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Saque solicitado ✅", description: `Você receberá R$ ${net.toFixed(2).replace(".", ",")} em até 24h.` });
    setAmount(""); setCpf(""); setPixKey("");
    load();
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-primary">Solicitar Saque</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Saldo</p>
                <p className="text-sm font-bold">R$ {balance.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 dark:text-amber-200">
                Taxa de processamento de <strong>12%</strong>. Você recebe <strong>88%</strong> do valor solicitado.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm">Valor do saque</Label>
                <Input type="number" inputMode="decimal" value={amount}
                  onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">CPF</Label>
                <Input value={cpf} onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00" maxLength={14} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Chave PIX</Label>
                <Input value={pixKey} onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória" maxLength={140} className="mt-1.5" />
              </div>

              {value > 0 && (
                <div className="rounded-lg bg-secondary p-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Valor</span><span>R$ {value.toFixed(2).replace(".", ",")}</span></div>
                  <div className="flex justify-between text-destructive"><span>Taxa (12%)</span><span>- R$ {fee.toFixed(2).replace(".", ",")}</span></div>
                  <div className="flex justify-between font-bold border-t border-border pt-1 mt-1"><span>Você recebe</span><span className="text-emerald-600">R$ {net.toFixed(2).replace(".", ",")}</span></div>
                </div>
              )}

              <Button onClick={handleSubmit} disabled={loading} className="w-full">
                {loading ? "Processando..." : "Solicitar Saque"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-primary mb-3">Histórico</h3>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum saque ainda.</p>
            ) : (
              <div className="space-y-2">
                {list.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">R$ {Number(w.net_amount).toFixed(2).replace(".", ",")} líquido</p>
                      <p className="text-[10px] text-muted-foreground">
                        Bruto R$ {Number(w.amount).toFixed(2).replace(".", ",")} • {new Date(w.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant={w.status === "paid" ? "default" : "secondary"}>
                      {w.status === "paid" ? "Pago" : w.status === "pending" ? "Pendente" : "Rejeitado"}
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

export default Saque;
