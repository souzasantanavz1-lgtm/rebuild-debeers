import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Lock, Gift, Sparkles, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const WEEK_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const BONUS = 0.5;
const fmtBRL = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function buildWeek(): { iso: string; dayNum: number; label: string }[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun..6=Sat
  const diffToMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { iso: toIso(d), dayNum: d.getDate(), label: WEEK_LABELS[i] };
  });
}

const CheckIn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const week = useMemo(buildWeek, []);
  const today = toIso(new Date());

  const [balance, setBalance] = useState<number>(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    const [{ data: prof }, { data: weekIns }, { data: allIns }] = await Promise.all([
      supabase.from("profiles").select("balance").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("check_ins")
        .select("check_in_date")
        .eq("user_id", user.id)
        .gte("check_in_date", week[0].iso)
        .lte("check_in_date", week[6].iso),
      supabase
        .from("check_ins")
        .select("check_in_date")
        .eq("user_id", user.id)
        .order("check_in_date", { ascending: false })
        .limit(60),
    ]);
    if (prof) setBalance(Number(prof.balance));
    if (weekIns) setChecked(new Set(weekIns.map((r: { check_in_date: string }) => r.check_in_date)));

    // Compute consecutive streak ending today (or yesterday if today not yet)
    if (allIns) {
      const dates = new Set(allIns.map((r: { check_in_date: string }) => r.check_in_date));
      let s = 0;
      const cursor = new Date();
      // start from today; if not present, start from yesterday
      if (!dates.has(toIso(cursor))) cursor.setDate(cursor.getDate() - 1);
      while (dates.has(toIso(cursor))) {
        s += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      setStreak(s);
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Realtime: keep balance in sync if it changes elsewhere
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("checkin-profile")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const next = (payload.new as { balance?: number }).balance;
          if (typeof next === "number") setBalance(Number(next));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const alreadyToday = checked.has(today);
  const totalWeek = checked.size * BONUS;

  const doCheckIn = async () => {
    if (!user || loading || alreadyToday) return;
    setLoading(true);

    // Optimistic UI
    const prevBalance = balance;
    const prevChecked = checked;
    setChecked((s) => new Set(s).add(today));
    setBalance((b) => b + BONUS);

    const { error } = await supabase.from("check_ins").insert({
      user_id: user.id,
      check_in_date: today,
      bonus_amount: BONUS,
    });

    if (error) {
      // Rollback
      setChecked(prevChecked);
      setBalance(prevBalance);
      toast({
        title: "Não foi possível registrar",
        description: error.code === "23505" ? "Você já fez o check-in hoje." : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Check-in confirmado ✨", description: `+ ${fmtBRL(BONUS)} no seu saldo.` });
      // Re-sync from server to keep things truthful (and update streak)
      refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted pb-24">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-1 -ml-1 rounded-full hover:bg-primary-foreground/10"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-serif tracking-wider">CHECK-IN DIÁRIO</h1>
          <p className="text-[10px] tracking-[0.3em] opacity-80">A DIAMOND IS FOREVER</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] opacity-80">Saldo</p>
          <p className="text-sm font-bold tabular-nums">{fmtBRL(balance)}</p>
        </div>
      </header>

      <div className="px-4 mt-4 space-y-4">
        {/* Hero: bonus + streak */}
        <Card className="overflow-hidden border-primary/10">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground/15 rounded-full p-3">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs opacity-80">Bônus de hoje</p>
                <p className="text-2xl font-bold tabular-nums">{fmtBRL(BONUS)}</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Sequência</p>
                  <p className="text-lg font-semibold flex items-center justify-end gap-1">
                    <Flame className="h-4 w-4 text-amber-300" />
                    {streak}d
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-80 uppercase tracking-wider">Semana</p>
                  <p className="text-lg font-semibold tabular-nums">{fmtBRL(totalWeek)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Weekly grid */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-primary">Semana atual</h2>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {checked.size}/7 dias
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {week.map((d) => {
                const isDone = checked.has(d.iso);
                const isToday = d.iso === today;
                const isFuture = d.iso > today;
                const isMissed = !isDone && !isToday && !isFuture;

                return (
                  <button
                    key={d.iso}
                    type="button"
                    disabled={!isToday || isDone || loading}
                    onClick={isToday && !isDone ? doCheckIn : undefined}
                    aria-label={`${d.label} dia ${d.dayNum}${isDone ? " (concluído)" : isToday ? " (hoje)" : ""}`}
                    className={[
                      "relative flex flex-col items-center justify-center rounded-lg border py-3 transition-all min-h-[72px]",
                      isDone &&
                        "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700",
                      isToday &&
                        !isDone &&
                        "bg-primary text-primary-foreground border-primary shadow-md animate-pulse cursor-pointer",
                      isFuture && "bg-secondary border-border opacity-60",
                      isMissed && "bg-muted border-border opacity-50",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span
                      className={`text-[10px] font-medium ${
                        isToday && !isDone ? "opacity-90" : "text-muted-foreground"
                      }`}
                    >
                      {d.label}
                    </span>
                    <span
                      className={`text-base font-bold ${
                        isDone ? "text-emerald-700 dark:text-emerald-300" : ""
                      }`}
                    >
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
              Toque no dia de hoje para receber {fmtBRL(BONUS)}.
            </p>
          </CardContent>
        </Card>

        <Button
          onClick={doCheckIn}
          disabled={alreadyToday || loading || initialLoading}
          size="lg"
          className="w-full h-14 text-base font-semibold"
        >
          {alreadyToday
            ? "✅ Check-in feito hoje — volte amanhã"
            : loading
            ? "Confirmando..."
            : `Fazer check-in (+ ${fmtBRL(BONUS)})`}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center px-6">
          O bônus é creditado automaticamente no seu saldo. Faça login todo dia para manter sua sequência.
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default CheckIn;
