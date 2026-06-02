import { useEffect, useState } from "react";
import { ArrowLeft, Check, Lock, Gift, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const BONUS = 0.5;

// Returns Monday of the current week (local time) as YYYY-MM-DD anchor + array of 7 dates
function getWeekDates(): { iso: string; dayNum: number; label: string }[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun..6=Sat
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { iso, dayNum: d.getDate(), label: WEEK_DAYS[i] };
  });
}

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const CheckIn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const week = getWeekDates();
  const today = todayIso();

  const [balance, setBalance] = useState<number>(0);
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) return;
    const [{ data: prof }, { data: ins }] = await Promise.all([
      supabase.from("profiles").select("balance").eq("user_id", user.id).single(),
      supabase
        .from("check_ins")
        .select("check_in_date")
        .eq("user_id", user.id)
        .gte("check_in_date", week[0].iso)
        .lte("check_in_date", week[6].iso),
    ]);
    if (prof) setBalance(Number(prof.balance));
    if (ins) setCheckedDates(new Set(ins.map((r: any) => r.check_in_date)));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const doCheckIn = async () => {
    if (!user || loading) return;
    if (checkedDates.has(today)) return;
    setLoading(true);
    const { error } = await supabase.from("check_ins").insert({
      user_id: user.id,
      check_in_date: today,
      bonus_amount: BONUS,
    });
    if (error) {
      toast({
        title: "Não foi possível registrar",
        description: error.code === "23505" ? "Você já fez o check-in hoje." : error.message,
        variant: "destructive",
      });
    } else {
      setCheckedDates((s) => new Set(s).add(today));
      setBalance((b) => b + BONUS);
      toast({ title: "Check-in confirmado! ✨", description: "+ R$ 0,50 no seu saldo." });
      refresh();
    }
    setLoading(false);
  };

  const totalWeek = checkedDates.size * BONUS;
  const alreadyToday = checkedDates.has(today);

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")} className="p-1 -ml-1 rounded-full hover:bg-primary-foreground/10">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-serif tracking-wider">CHECK-IN DIÁRIO</h1>
          <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] opacity-80">Saldo</p>
          <p className="text-sm font-bold">R$ {balance.toFixed(2).replace(".", ",")}</p>
        </div>
      </header>

      <div className="px-4 mt-4 space-y-4">
        {/* Resumo */}
        <Card className="overflow-hidden border-primary/10">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/15 rounded-full p-3">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs opacity-80">Bônus diário</p>
                <p className="text-2xl font-bold">R$ 0,50</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs opacity-80">Semana</p>
                <p className="text-lg font-semibold">R$ {totalWeek.toFixed(2).replace(".", ",")}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabela semanal */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-primary">Semana atual</h2>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {checkedDates.size}/7 dias
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {week.map((d) => {
                const isDone = checkedDates.has(d.iso);
                const isToday = d.iso === today;
                const isFuture = d.iso > today;
                const isMissed = !isDone && !isToday && !isFuture;

                return (
                  <button
                    key={d.iso}
                    disabled={!isToday || isDone || loading}
                    onClick={isToday && !isDone ? doCheckIn : undefined}
                    className={[
                      "relative flex flex-col items-center justify-center rounded-lg border py-3 transition-all",
                      isDone && "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700",
                      isToday && !isDone && "bg-primary text-primary-foreground border-primary shadow-md animate-pulse",
                      isFuture && "bg-secondary border-border opacity-60",
                      isMissed && "bg-muted border-border opacity-50",
                    ].filter(Boolean).join(" ")}
                  >
                    <span className={`text-[10px] font-medium ${isToday && !isDone ? "opacity-90" : "text-muted-foreground"}`}>
                      {d.label}
                    </span>
                    <span className={`text-base font-bold ${isDone ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                      {d.dayNum}
                    </span>
                    <div className="mt-1 h-4 flex items-center justify-center">
                      {isDone && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                      {isFuture && <Lock className="h-3 w-3 text-muted-foreground" />}
                      {isToday && !isDone && <Sparkles className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Toque no dia de hoje para receber R$ 0,50.
            </p>
          </CardContent>
        </Card>

        {/* Botão grande */}
        <Button
          onClick={doCheckIn}
          disabled={alreadyToday || loading}
          size="lg"
          className="w-full h-14 text-base font-semibold"
        >
          {alreadyToday ? "✅ Check-in feito hoje — volte amanhã" : loading ? "Confirmando..." : "Fazer check-in (+ R$ 0,50)"}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center px-6">
          O bônus é creditado automaticamente no seu saldo. Acumule todos os dias da semana para maximizar seus ganhos.
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default CheckIn;
