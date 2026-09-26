import { useEffect, useState } from "react";
import { Copy, Share2, Users, Gift, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type ReferralSummary = { total_referrals: number; total_bonus: number };
const money = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

const Indicacao = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    Promise.all([
      supabase.from("profiles").select("referral_code").eq("user_id", user.id).single(),
      supabase.rpc("get_my_referral_summary"),
    ]).then(([profile, referrals]) => {
      if (!active) return;
      if (profile.error || referrals.error || !profile.data?.referral_code) {
        setError(true);
      } else {
        setCode(profile.data.referral_code);
        setSummary(referrals.data?.[0] ?? { total_referrals: 0, total_bonus: 0 });
        setError(false);
      }
      setLoading(false);
    }).catch(() => {
      if (active) { setError(true); setLoading(false); }
    });
    return () => { active = false; };
  }, [user]);

  const link = code ? `${window.location.origin}/register?ref=${encodeURIComponent(code)}` : null;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Copiado para a área de transferência" });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  };

  const share = async () => {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Convite De Beers", url: link });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        toast({ title: "Não foi possível compartilhar", variant: "destructive" });
      }
    } else {
      await copy(link);
    }
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary px-4 py-5 text-primary-foreground">
        <h1 className="text-xl font-serif">DE BEERS</h1>
        <p className="text-xs opacity-80">Indicação</p>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6 space-y-8">
        <section aria-labelledby="invite-heading">
          <h2 id="invite-heading" className="text-xl font-semibold text-foreground">Convide alguém</h2>
          <p className="mt-1 text-sm text-muted-foreground">Envie seu código ou link para a pessoa usar ao criar a conta.</p>
          {loading && <p role="status" className="py-6 text-sm text-muted-foreground">Carregando seu convite...</p>}
          {error && <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" />Não foi possível carregar seus dados. Reabra a página para tentar novamente.</p>}
          {code && !error && (
            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Seu código</p>
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <strong className="flex-1 font-mono text-2xl tracking-widest text-primary">{code}</strong>
                  <Button size="icon" variant="outline" onClick={() => copy(code)} aria-label="Copiar código" title="Copiar código"><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              {link && <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Link de convite</p>
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <p className="min-w-0 flex-1 truncate text-sm text-foreground" title={link}>{link}</p>
                  <Button size="icon" variant="outline" onClick={() => copy(link)} aria-label="Copiar link" title="Copiar link"><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" onClick={share} aria-label="Compartilhar convite" title="Compartilhar convite"><Share2 className="h-4 w-4" /></Button>
                </div>
              </div>}
            </div>
          )}
        </section>

        <section aria-labelledby="numbers-heading" className="border-t border-border pt-6">
          <h2 id="numbers-heading" className="mb-4 text-lg font-semibold text-foreground">Suas indicações</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-l-2 border-primary pl-4">
              <Users className="mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-bold tabular-nums">{summary?.total_referrals ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Pessoas cadastradas</p>
            </div>
            <div className="border-l-2 border-primary pl-4">
              <Gift className="mb-2 h-5 w-5 text-primary" />
              <p className="text-2xl font-bold tabular-nums">{summary ? money(Number(summary.total_bonus)) : "—"}</p>
              <p className="text-xs text-muted-foreground">Bônus registrados</p>
            </div>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">Os valores exibidos são os bônus registrados na sua conta. Indicar alguém não gera crédito automático.</p>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Indicacao;