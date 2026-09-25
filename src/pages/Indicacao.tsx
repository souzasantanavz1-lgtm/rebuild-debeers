import { useState, useEffect } from "react";
import { Users, Copy, Share2, Award, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Indicacao = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<{ referral_code: string | null } | null>(null);
  const [summary, setSummary] = useState({ total_referrals: 0, total_bonus: 0 });

  useEffect(() => {
    if (user) {
      // Get profile for referral code
      supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setProfile(data);
        });

      // Get referral summary
      supabase
        .rpc("get_my_referral_summary")
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setSummary(data[0]);
          }
        });
    }
  }, [user]);

  const referralCode = profile?.referral_code || "...";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4">
        <h1 className="text-xl font-serif tracking-wider">DE BEERS</h1>
        <p className="text-[10px] tracking-[0.3em] opacity-80">PROGRAMA DE AFILIADOS</p>
      </header>

      <div className="px-4 mt-6 space-y-4">
        {/* Referral Card */}
        <Card className="border-primary/20 overflow-hidden">
          <div className="bg-primary/5 p-4 border-b border-primary/10">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              Convide e Ganhe
            </h2>
            <p className="text-xs text-muted-foreground">
              Compartilhe seu link e ganhe comissões sobre os investimentos de seus indicados.
            </p>
          </div>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                Seu Código
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-lg border border-input px-3 py-2 font-mono text-sm flex items-center">
                  {referralCode}
                </div>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, "Código")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                Link de Convite
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-lg border border-input px-3 py-2 text-sm flex items-center truncate">
                  {referralLink}
                </div>
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink, "Link")}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Indicados</p>
              <p className="text-2xl font-bold text-primary">{summary.total_referrals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Bônus Acumulado</p>
              <p className="text-2xl font-bold text-emerald-600">R$ {Number(summary.total_bonus).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Rules */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Níveis de Comissão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase text-muted-foreground">Primeira Compra</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                    <span className="text-sm font-medium">Nível 1</span>
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">15%</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <span className="text-sm font-medium">Nível 2</span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">2%</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-50 dark:bg-rose-900/20 p-2 rounded">
                    <span className="text-sm font-medium">Nível 3</span>
                    <span className="text-sm font-bold text-rose-700 dark:text-rose-400">1%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase text-muted-foreground">Recompras</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded">
                    <span className="text-sm font-medium">Nível 1</span>
                    <span className="text-sm font-bold text-amber-600/80">8%</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50/50 dark:bg-blue-900/10 p-2 rounded">
                    <span className="text-sm font-medium">Nível 2</span>
                    <span className="text-sm font-bold text-blue-600/80">1%</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-50/50 dark:bg-rose-900/10 p-2 rounded">
                    <span className="text-sm font-medium">Nível 3</span>
                    <span className="text-sm font-bold text-rose-600/80">1%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 items-start bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Os bônus de indicação são creditados instantaneamente no seu saldo assim que seu convidado realiza um investimento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Indicacao;
