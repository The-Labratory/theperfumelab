import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Trophy, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

export default function BusinessGoals() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("partner_goals")
        .select("*")
        .eq("user_id", affiliate.user_id)
        .order("period_start", { ascending: false });
      setGoals(data || []);
      setLoading(false);
    };
    load();
  }, [affiliate]);

  const goalTypeLabels: Record<string, string> = {
    sales: "💰 Sales Target",
    referrals: "👥 Referral Target",
    revenue: "📈 Revenue Target",
    customers: "🤝 Customer Target",
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-display text-xl font-black tracking-wider text-foreground">Goals & Targets</h2>
        <p className="text-xs text-muted-foreground font-body mt-1">Monthly targets set by management. Track your progress here.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Loading goals...</p>
      ) : goals.length === 0 ? (
        <div className="glass-surface rounded-2xl p-12 border border-border/30 text-center">
          <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">No Goals Set Yet</h3>
          <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
            Your manager will set monthly targets for you. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {goals.map((goal, i) => {
            const pct = goal.target_value > 0 ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0;
            const achieved = pct >= 100;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`glass-surface rounded-xl p-6 border ${achieved ? "border-green-500/30 shadow-[0_0_20px_hsl(142_70%_40%/0.1)]" : "border-border/30"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-bold text-foreground">
                    {goalTypeLabels[goal.goal_type] || goal.goal_type}
                  </h3>
                  {achieved && <Trophy className="w-5 h-5 text-amber-500" />}
                </div>
                
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-display text-3xl font-black text-primary">{goal.current_value}</span>
                  <span className="text-sm text-muted-foreground font-body mb-1">/ {goal.target_value}</span>
                </div>

                <Progress value={pct} className="h-2 mb-3" />

                <div className="flex justify-between text-[10px] font-display tracking-widest text-muted-foreground">
                  <span>{pct.toFixed(0)}% COMPLETE</span>
                  <span>{goal.period.toUpperCase()} · {new Date(goal.period_start).toLocaleDateString()} - {new Date(goal.period_end).toLocaleDateString()}</span>
                </div>

                {goal.notes && (
                  <p className="text-[10px] text-muted-foreground/60 italic mt-3 border-t border-border/20 pt-2">{goal.notes}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
