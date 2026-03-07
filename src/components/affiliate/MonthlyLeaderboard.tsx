import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp, Flame } from "lucide-react";

interface LeaderEntry {
  name: string;
  title: string | null;
  avatar_url: string | null;
  earnings: number;
  total_transactions: number;
  level: number;
}

const MEDAL_STYLES = [
  { icon: Trophy, color: "text-[hsl(45_93%_47%)]", bg: "bg-[hsl(45_93%_47%)]/10", border: "border-[hsl(45_93%_47%)]/30", label: "1st" },
  { icon: Medal, color: "text-[hsl(220_20%_65%)]", bg: "bg-[hsl(220_20%_65%)]/10", border: "border-[hsl(220_20%_65%)]/30", label: "2nd" },
  { icon: Medal, color: "text-[hsl(30_60%_50%)]", bg: "bg-[hsl(30_60%_50%)]/10", border: "border-[hsl(30_60%_50%)]/30", label: "3rd" },
];

export default function MonthlyLeaderboard({ nodes }: { nodes: LeaderEntry[] }) {
  const activeNodes = nodes
    .filter(n => n.total_transactions > 0)
    .sort((a, b) => b.total_transactions - a.total_transactions || b.earnings - a.earnings)
    .slice(0, 10);

  if (activeNodes.length === 0) return null;

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="mt-10 pt-8 border-t border-border/20">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Flame className="w-5 h-5 text-accent" />
        <h4 className="font-display text-lg font-bold tracking-wide text-foreground">
          Top Performers
        </h4>
      </div>
      <p className="text-xs text-muted-foreground text-center mb-6 font-body">
        Leaderboard — <span className="text-accent font-semibold">{monthName}</span>
      </p>

      <div className="max-w-lg mx-auto space-y-2">
        {activeNodes.map((node, i) => {
          const medal = MEDAL_STYLES[i];
          const isTop3 = i < 3;
          const MedalIcon = medal?.icon || TrendingUp;

          return (
            <motion.div
              key={node.name + i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isTop3
                  ? `${medal.bg} ${medal.border}`
                  : "bg-muted/5 border-border/20"
              }`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isTop3 ? `${medal.bg} border ${medal.border}` : "bg-muted/10 border border-border/20"
              }`}>
                {isTop3 ? (
                  <MedalIcon className={`w-4 h-4 ${medal.color}`} />
                ) : (
                  <span className="text-xs font-display font-bold text-muted-foreground">{i + 1}</span>
                )}
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-muted/20 border border-border/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {node.avatar_url ? (
                    <img src={node.avatar_url} alt={node.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-display font-bold text-muted-foreground">
                      {node.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-display font-bold text-foreground truncate">{node.name}</p>
                  {node.title && (
                    <p className="text-[10px] text-muted-foreground truncate">{node.title}</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className={`text-xs font-display font-black ${isTop3 ? medal.color : "text-foreground"}`}>
                    {node.total_transactions}
                  </p>
                  <p className="text-[8px] font-display tracking-wider text-muted-foreground/60">SALES</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-display font-black ${isTop3 ? "text-accent" : "text-foreground"}`}>
                    €{node.earnings.toFixed(0)}
                  </p>
                  <p className="text-[8px] font-display tracking-wider text-muted-foreground/60">EARNED</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
