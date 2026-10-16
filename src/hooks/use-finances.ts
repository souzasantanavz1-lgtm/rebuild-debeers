import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useFinances() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["finances", user?.id],
    enabled: Boolean(user),
    staleTime: 0,
    queryFn: async () => {
      if (!user) throw new Error("Faça login.");
      const sync = await supabase.rpc("sync_my_finances");
      if (sync.error) throw sync.error;
      const [profile, investments, earnings] = await Promise.all([
        supabase.from("profiles").select("name,phone,balance,referral_code").eq("user_id", user.id).single(),
        supabase.from("investments").select("id,plan_name,amount,daily_return,status,started_at,expires_at,duration_days,credited_days").eq("user_id", user.id),
        supabase.from("investment_earnings").select("id,investment_id,amount,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      if (profile.error) throw profile.error;
      if (investments.error) throw investments.error;
      if (earnings.error) throw earnings.error;
      return { profile: profile.data, investments: investments.data, earnings: earnings.data };
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`finances-${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` }, () => {
        void queryClient.invalidateQueries({ queryKey: ["finances", user.id] });
      }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [queryClient, user]);

  return query;
}