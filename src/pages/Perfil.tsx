import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Eye, EyeOff, Wallet, TrendingUp, Plus, ArrowDownToLine, FileText, UserPlus,
  ChevronRight, Gem, CalendarCheck, CreditCard, ShieldCheck, Building2, Headphones, LogOut, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Movement { id: string; kind: "Depósito" | "Saque"; amount: number; status: string; created_at: string; }
interface Investment { amount: number; daily_return: number; status: string; started_at: string; }
interface MenuItem { label: string; icon: LucideIcon; onClick: () => void; }

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const STATUS: Record<string, string> = { pending: "Pendente", approved: "Aprovado", completed: "Concluído", rejected: "Recusado" };

const Perfil = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, inv, dep, wd] = await Promise.all([
        supabase.from("profiles").select("name,phone,balance").eq("user_id", user.id).maybeSingle(),
        supabase.from("investments").select("amount,daily_return,status,started_at").eq("user_id", user.id),
        supabase.from("deposits").select("id,amount,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("withdrawals").select("id,amount,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      setName(p.data?.name || p.data?.phone || user.email?.split("@")[0] || "");
      setBalance(Number(p.data?.balance ?? 0));
      setInvestments((inv.data ?? []).map((i) => ({ ...i, amount: Number(i.amount), daily_return: Number(i.daily_return) })));
      const all: Movement[] = [
        ...(dep.data ?? []).map((d) => ({ ...d, kind: "Depósito" as const, amount: Number(d.amount) })),
        ...(wd.data ?? []).map((w) => ({ ...w, kind: "Saque" as const, amount: Number(w.amount) })),
      ].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);
      setMovements(all);
      setLoading(false);
    })();
  }, [user]);

  // Derived values (no effects)
  const summary = useMemo(() => {
    const active = investments.filter((i) => i.status === "active");
    const invested = active.reduce((s, i) => s + i.amount, 0);
    const daily = active.reduce((s, i) => s + i.daily_return, 0);
    const produced = active.reduce((s, i) => {
      const days = Math.max(0, Math.floor((Date.now() - new Date(i.started_at).getTime()) / 86_400_000));
      return s + days * i.daily_return;
    }, 0);
    return { activeCount: active.length, invested, daily, produced };
  }, [investments]);

  const money = (v: number) => (show ? brl(v) : "R$ ••••");

  const actions: MenuItem[] = [
    { label: "Depositar", icon: Plus, onClick: () => navigate("/deposito") },
    { label: "Sacar", icon: ArrowDownToLine, onClick: () => navigate("/saque") },
    { label: "Histórico", icon: FileText, onClick: () => document.getElementById("movimentacoes")?.scrollIntoView({ behavior: "smooth" }) },
    { label: "Indicar", icon: UserPlus, onClick: () => navigate("/indicacao") },
  ];

  const menu: MenuItem[] = [
    { label: "Planos", icon: Gem, onClick: () => navigate("/planos") },
    { label: "Check-in", icon: CalendarCheck, onClick: () => navigate("/checkin") },
    { label: "PIX", icon: CreditCard, onClick: () => navigate("/deposito") },
    { label: "Privacidade", icon: ShieldCheck, onClick: () => navigate("/privacidade") },
    { label: "Sobre nós", icon: Building2, onClick: () => navigate("/sobre-nos") },
    { label: "Atendimento", icon: Headphones, onClick: () => navigate("/suporte") },
  ];

  const handleLogout = async () => { await signOut(); navigate("/"); };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-16">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
      </header>

      <main className="px-4 -mt-10 space-y-5">
        <Card className="shadow-lg">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center"><User className="h-6 w-6 text-primary" /></div>
            <div className="min-w-0">
              <p className="font-bold text-foreground truncate">Olá, {name} 👋</p>
              <p className="text-sm text-muted-foreground">Bem-vindo(a)!</p>
            </div>
          </CardContent>
        </Card>

        <section aria-labelledby="carteiras" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="carteiras" className="font-bold text-foreground">Minhas carteiras</h2>
            <button onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar valores" : "Mostrar valores"} className="text-muted-foreground">
              {show ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
          </div>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center"><Wallet className="h-5 w-5 text-primary" /></div>
            <div className="flex-1"><p className="text-xs text-muted-foreground">Carteira de investimento</p><p className="text-lg font-bold text-foreground">{loading ? "…" : money(summary.invested)}</p></div>
            <Button size="sm" onClick={() => navigate("/deposito")}><Plus className="h-4 w-4 mr-1" />Depositar</Button>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-primary" /></div>
            <div className="flex-1"><p className="text-xs text-muted-foreground">Carteira de retorno</p><p className="text-lg font-bold text-foreground">{loading ? "…" : money(balance)}</p></div>
            <Button size="sm" variant="outline" onClick={() => navigate("/saque")}><ArrowDownToLine className="h-4 w-4 mr-1" />Sacar</Button>
          </CardContent></Card>
        </section>

        <nav aria-label="Ações rápidas" className="grid grid-cols-4 gap-2">
          {actions.map((a) => (
            <button key={a.label} onClick={a.onClick} className="flex flex-col items-center gap-1 py-2 text-foreground">
              <a.icon className="h-6 w-6 text-primary" /><span className="text-xs">{a.label}</span>
            </button>
          ))}
        </nav>

        <section aria-labelledby="resumo" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="resumo" className="font-bold text-foreground">Resumo dos rendimentos</h2>
            <button onClick={() => navigate("/planos")} className="text-sm text-muted-foreground flex items-center">Ver detalhes<ChevronRight className="h-4 w-4" /></button>
          </div>
          <Card><CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center"><TrendingUp className="h-6 w-6 text-primary-foreground" /></div>
              <div><p className="text-sm text-muted-foreground">Rendendo agora (por dia)</p><p className="text-xl font-bold text-foreground">{money(summary.daily)}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
              <div><p className="text-muted-foreground">Planos ativos</p><p className="font-bold text-foreground">{summary.activeCount}</p></div>
              <div><p className="text-muted-foreground">Saldo renda</p><p className="font-bold text-foreground">{money(balance)}</p></div>
              <div><p className="text-muted-foreground">Produção acumulada</p><p className="font-bold text-foreground">{money(summary.produced)}</p></div>
            </div>
          </CardContent></Card>
        </section>

        <section id="movimentacoes" aria-labelledby="mov" className="space-y-3">
          <h2 id="mov" className="font-bold text-foreground">Últimas movimentações</h2>
          <Card><CardContent className="p-4">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
              : movements.length === 0 ? <p className="text-center text-muted-foreground">Nenhuma movimentação ainda</p>
              : <ul className="divide-y divide-border">
                  {movements.map((m) => (
                    <li key={m.id} className="py-2 flex justify-between text-sm">
                      <div><p className="font-medium text-foreground">{m.kind}</p><p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString("pt-BR")} · {STATUS[m.status] ?? m.status}</p></div>
                      <p className="font-bold text-foreground">{m.kind === "Saque" ? "-" : "+"}{money(m.amount)}</p>
                    </li>
                  ))}
                </ul>}
          </CardContent></Card>
        </section>

        <section aria-labelledby="menu" className="space-y-3">
          <h2 id="menu" className="font-bold text-foreground">Menu</h2>
          <Card><CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-4 gap-y-4">
              {menu.map((m) => (
                <button key={m.label} onClick={m.onClick} className="flex flex-col items-center gap-1 text-center">
                  <span className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center"><m.icon className="h-5 w-5 text-primary" /></span>
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Sair da conta</Button>
          </CardContent></Card>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Perfil;
