import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingMetrics {
  total: number;
  completed: number;
  inProgress: number;
  avgCompletionMinutes: number;
  quizPassRate: number;
  starterPacksClaimed: number;
  stalledUsers: { id: string; display_name: string; email: string; current_step: number; started_at: string }[];
}

const AdminOnboardingMetrics = () => {
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: progress } = await supabase
        .from("affiliate_onboarding_progress")
        .select("*, affiliate_partners!affiliate_onboarding_progress_affiliate_id_fkey(display_name, email)") as any;

      if (!progress) {
        setLoading(false);
        return;
      }

      const total = progress.length;
      const completed = progress.filter((p: any) => p.completed).length;
      const inProgress = total - completed;

      // Avg completion time
      const completedItems = progress.filter((p: any) => p.completed && p.completed_at);
      const avgMs = completedItems.length
        ? completedItems.reduce((sum: number, p: any) => {
            return sum + (new Date(p.completed_at).getTime() - new Date(p.started_at).getTime());
          }, 0) / completedItems.length
        : 0;
      const avgCompletionMinutes = Math.round(avgMs / 60000);

      // Quiz pass rate
      const quizAttempted = progress.filter((p: any) => Object.keys(p.quiz_scores || {}).length > 0);
      const quizPassed = progress.filter((p: any) => p.quiz_passed);
      const quizPassRate = quizAttempted.length ? Math.round((quizPassed.length / quizAttempted.length) * 100) : 0;

      // Starter packs
      const starterPacksClaimed = progress.filter((p: any) => p.starter_pack_claimed).length;

      // Stalled: started > 48h ago, not completed
      const now = Date.now();
      const stalledUsers = progress
        .filter((p: any) => !p.completed && now - new Date(p.started_at).getTime() > 48 * 60 * 60 * 1000)
        .map((p: any) => ({
          id: p.id,
          display_name: p.affiliate_partners?.display_name || "Unknown",
          email: p.affiliate_partners?.email || "",
          current_step: p.current_step,
          started_at: p.started_at,
        }));

      setMetrics({ total, completed, inProgress, avgCompletionMinutes, quizPassRate, starterPacksClaimed, stalledUsers });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="animate-pulse font-body text-sm text-muted-foreground">Loading onboarding metrics…</div>;
  }

  if (!metrics || metrics.total === 0) {
    return (
      <div className="glass-surface rounded-2xl p-6 border border-border/50 text-center">
        <p className="font-body text-sm text-muted-foreground">No onboarding data yet.</p>
      </div>
    );
  }

  const completionPct = Math.round((metrics.completed / metrics.total) * 100);

  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm tracking-widest text-muted-foreground">ONBOARDING METRICS</h3>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: "Total Started", value: metrics.total },
          { icon: CheckCircle, label: "Completed", value: `${metrics.completed} (${completionPct}%)` },
          { icon: Clock, label: "Avg Time", value: `${metrics.avgCompletionMinutes} min` },
          { icon: BarChart3, label: "Quiz Pass Rate", value: `${metrics.quizPassRate}%` },
        ].map((s) => (
          <div key={s.label} className="glass-surface rounded-xl p-3 border border-border/50 text-center">
            <s.icon className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="font-display text-lg font-black text-foreground">{s.value}</p>
            <p className="font-body text-[9px] text-muted-foreground tracking-widest uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      <div className="glass-surface rounded-xl p-4 border border-border/50">
        <div className="flex justify-between mb-2">
          <span className="font-display text-xs text-muted-foreground">Completion Rate</span>
          <span className="font-display text-xs font-bold text-foreground">{completionPct}%</span>
        </div>
        <Progress value={completionPct} className="h-2" />
        <div className="flex justify-between mt-2 text-[10px] font-body text-muted-foreground">
          <span>{metrics.starterPacksClaimed} starter packs claimed</span>
          <span>{metrics.inProgress} in progress</span>
        </div>
      </div>

      {/* Stalled users */}
      {metrics.stalledUsers.length > 0 && (
        <div className="glass-surface rounded-xl p-4 border border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="font-display text-xs tracking-widest text-destructive">
              STALLED AFFILIATES ({metrics.stalledUsers.length})
            </span>
          </div>
          <div className="space-y-2">
            {metrics.stalledUsers.slice(0, 10).map((u) => (
              <div key={u.id} className="flex items-center justify-between bg-card/30 rounded-lg p-2">
                <div>
                  <p className="font-display text-sm font-bold text-foreground">{u.display_name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{u.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xs text-muted-foreground">Step {u.current_step}/10</p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    Started {new Date(u.started_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOnboardingMetrics;
