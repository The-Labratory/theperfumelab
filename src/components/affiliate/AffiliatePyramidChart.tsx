import { motion } from "framer-motion";
import { Crown, Award, TrendingUp, DollarSign, Flame, Target, Rocket, Star, Zap, ArrowUp } from "lucide-react";

const TIERS = [
  { name: "High Achiever", code: "high_achiever", commission: 50, requirement: "250+", color: "hsl(var(--accent))", bgClass: "bg-accent/20 border-accent/40", textClass: "text-accent", glowClass: "shadow-[0_0_30px_hsl(var(--accent)/0.3)]", width: "w-[35%]", emoji: "🏆" },
  { name: "Platinum", code: "platinum", commission: 40, requirement: "100+", color: "hsl(var(--primary))", bgClass: "bg-primary/20 border-primary/40", textClass: "text-primary", glowClass: "shadow-[0_0_25px_hsl(var(--primary)/0.25)]", width: "w-[50%]", emoji: "💎" },
  { name: "Gold", code: "gold", commission: 35, requirement: "50+", color: "hsl(45 93% 47%)", bgClass: "bg-[hsl(45_93%_47%)]/20 border-[hsl(45_93%_47%)]/40", textClass: "text-[hsl(45_93%_47%)]", glowClass: "shadow-[0_0_20px_hsl(45_93%_47%/0.2)]", width: "w-[65%]", emoji: "👑" },
  { name: "Silver", code: "silver", commission: 30, requirement: "10+", color: "hsl(var(--muted-foreground))", bgClass: "bg-muted/30 border-muted-foreground/30", textClass: "text-muted-foreground", glowClass: "", width: "w-[80%]", emoji: "🌟" },
  { name: "Bronze", code: "bronze", commission: 20, requirement: "0+", color: "hsl(30 70% 45%)", bgClass: "bg-[hsl(30_70%_45%)]/20 border-[hsl(30_70%_45%)]/40", textClass: "text-[hsl(30_70%_45%)]", glowClass: "", width: "w-full", emoji: "🔥" },
];

const SAMPLE_TRANSACTIONS = [
  { label: "Eau de Parfum (50ml)", price: 89 },
  { label: "Parfum Extrait (30ml)", price: 129 },
  { label: "Discovery Set (5×10ml)", price: 59 },
  { label: "Bespoke Collection (3×50ml)", price: 249 },
];

const MOTIVATIONAL_MILESTONES = [
  { sales: 1, earning: "€17.80", message: "Your first sale! The journey begins 🔥", icon: Flame },
  { sales: 10, earning: "€267", message: "Silver unlocked — 30% commission! 🌟", icon: Star },
  { sales: 50, earning: "€1,557", message: "Gold tier — VIP events & free products! 👑", icon: Crown },
  { sales: 100, earning: "€3,560", message: "Platinum — You're in the top 1%! 💎", icon: Rocket },
  { sales: 250, earning: "€11,125", message: "Diamond Legend — 50% on everything! 🏆", icon: Crown },
];

interface Props {
  currentTier?: string;
  totalEarnings?: number;
  totalReferrals?: number;
}

export default function AffiliatePyramidChart({ currentTier = "bronze", totalEarnings = 0, totalReferrals = 0 }: Props) {
  const currentTierData = TIERS.find(t => t.code === currentTier) || TIERS[4];
  const currentTierIndex = TIERS.findIndex(t => t.code === currentTier);
  const nextTier = currentTierIndex > 0 ? TIERS[currentTierIndex - 1] : null;

  return (
    <div className="space-y-10">
      {/* Motivational Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 border border-accent/20 mb-6"
        >
          <Zap className="w-5 h-5 text-accent" />
          <span className="text-sm font-display tracking-[0.2em] text-accent font-bold">
            YOU'RE AT {currentTierData.commission}% COMMISSION
          </span>
          <Zap className="w-5 h-5 text-accent" />
        </motion.div>
        {nextTier && (
          <p className="text-sm text-muted-foreground font-body">
            Reach <span className="text-primary font-bold">{nextTier.requirement} referrals</span> to unlock{" "}
            <span className={`font-bold ${nextTier.textClass}`}>{nextTier.name} ({nextTier.commission}%)</span> and earn even more!
          </p>
        )}
      </motion.div>

      {/* Giant Pyramid Visual */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <Crown className="w-6 h-6 text-accent" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Commission Pyramid</h3>
        </div>
        <div className="flex flex-col items-center gap-3">
          {TIERS.map((tier, i) => {
            const isActive = tier.code === currentTier;
            const isPast = currentTierIndex <= i;
            return (
              <motion.div
                key={tier.code}
                initial={{ opacity: 0, scaleX: 0.3 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 180 }}
                className={`${tier.width} relative`}
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`rounded-xl border-2 px-6 py-5 flex items-center justify-between transition-all ${
                    isActive
                      ? `${tier.bgClass} ring-2 ring-offset-2 ring-offset-background ring-primary/50 ${tier.glowClass}`
                      : isPast
                      ? `${tier.bgClass} opacity-80`
                      : "bg-muted/10 border-border/30 opacity-35"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{tier.emoji}</span>
                    <div>
                      <span className={`text-base font-display font-black tracking-wide ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {tier.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-display tracking-wider text-muted-foreground">
                          {tier.requirement} referrals
                        </span>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[9px] font-display tracking-[0.2em] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30"
                          >
                            YOU ARE HERE
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-display text-3xl font-black ${isActive ? tier.textClass : "text-muted-foreground/60"}`}>
                      {tier.commission}%
                    </span>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[10px] font-display text-primary/80 mt-0.5"
                      >
                        per sale
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                {/* Arrow connector */}
                {i < TIERS.length - 1 && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                    <ArrowUp className="w-4 h-4 text-muted-foreground/30 rotate-180" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Motivational Milestones */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-primary" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Your Earning Potential</h3>
        </div>
        <p className="text-sm text-muted-foreground font-body mb-6">
          See what you could earn based on average order value of <span className="text-primary font-semibold">€89</span>:
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MOTIVATIONAL_MILESTONES.map((m, i) => {
            const Icon = m.icon;
            const reached = totalReferrals >= m.sales;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border p-5 text-center transition-all ${
                  reached
                    ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/10"
                    : "bg-muted/10 border-border/20"
                }`}
              >
                <Icon className={`w-7 h-7 mx-auto mb-2 ${reached ? "text-primary" : "text-muted-foreground/40"}`} />
                <p className="font-display text-2xl font-black text-foreground">{m.sales}</p>
                <p className="text-[10px] font-display tracking-wider text-muted-foreground uppercase mb-2">sales</p>
                <p className={`font-display text-lg font-black ${reached ? "text-primary" : "text-accent"}`}>{m.earning}</p>
                <p className="text-[10px] font-body text-muted-foreground mt-1 leading-relaxed">{m.message}</p>
                {reached && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 text-[9px] font-display tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5"
                  >
                    ✓ ACHIEVED
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Per-Transaction Earnings Table */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-primary" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Earnings Per Transaction</h3>
        </div>
        <p className="text-sm text-muted-foreground font-body mb-2">
          Your current tier <span className={`font-bold ${currentTierData.textClass}`}>({currentTierData.name} — {currentTierData.commission}%)</span> earnings are highlighted.
        </p>
        <p className="text-xs text-muted-foreground/60 font-body mb-6">
          💡 Upgrade tiers by referring more people and watch your earnings multiply!
        </p>
        <div className="glass-surface rounded-xl overflow-hidden border border-border/30">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-muted/10">
                  <th className="text-left px-5 py-4 text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">Product</th>
                  <th className="text-center px-4 py-4 text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">Price</th>
                  {TIERS.slice().reverse().map(tier => (
                    <th key={tier.code} className={`text-center px-4 py-4 text-[10px] font-display tracking-[0.2em] uppercase ${tier.code === currentTier ? `${tier.textClass} font-bold` : "text-muted-foreground"}`}>
                      <span className="block">{tier.emoji} {tier.name}</span>
                      <span className={`text-sm font-black ${tier.code === currentTier ? tier.textClass : "text-muted-foreground/50"}`}>{tier.commission}%</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_TRANSACTIONS.map((tx, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-5 py-4 font-body text-foreground font-medium">{tx.label}</td>
                    <td className="px-4 py-4 text-center font-display font-bold text-foreground text-base">€{tx.price}</td>
                    {TIERS.slice().reverse().map(tier => {
                      const earning = (tx.price * tier.commission / 100).toFixed(2);
                      const isCurrentTier = tier.code === currentTier;
                      return (
                        <td key={tier.code} className={`px-4 py-4 text-center ${isCurrentTier ? "bg-primary/5" : ""}`}>
                          <span className={`font-display text-base font-black ${isCurrentTier ? "text-primary" : "text-muted-foreground/60"}`}>
                            €{earning}
                          </span>
                          {isCurrentTier && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="block text-[9px] font-display tracking-wider text-primary mt-0.5"
                            >
                              YOUR EARNING
                            </motion.span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
                {/* Total row */}
                <tr className="bg-muted/15 border-t-2 border-border/30">
                  <td className="px-5 py-4 font-display font-bold text-foreground tracking-wide">If they buy all 4</td>
                  <td className="px-4 py-4 text-center font-display font-black text-foreground text-lg">€{SAMPLE_TRANSACTIONS.reduce((s, t) => s + t.price, 0)}</td>
                  {TIERS.slice().reverse().map(tier => {
                    const total = SAMPLE_TRANSACTIONS.reduce((s, t) => s + (t.price * tier.commission / 100), 0);
                    const isCurrentTier = tier.code === currentTier;
                    return (
                      <td key={tier.code} className={`px-4 py-4 text-center ${isCurrentTier ? "bg-primary/10" : ""}`}>
                        <span className={`font-display text-lg font-black ${isCurrentTier ? "text-primary" : "text-muted-foreground/50"}`}>
                          €{total.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Earnings Summary with bigger cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-surface rounded-xl p-6 text-center border border-primary/20">
          <TrendingUp className="w-7 h-7 text-primary mx-auto mb-3" />
          <p className="font-display text-3xl font-black text-foreground">€{totalEarnings.toFixed(2)}</p>
          <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase mt-1">Total Earned</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-surface rounded-xl p-6 text-center border border-accent/20">
          <DollarSign className="w-7 h-7 text-accent mx-auto mb-3" />
          <p className="font-display text-3xl font-black text-foreground">
            €{totalReferrals > 0 ? (totalEarnings / totalReferrals).toFixed(2) : "0.00"}
          </p>
          <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase mt-1">Avg / Referral</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-surface rounded-xl p-6 text-center border border-[hsl(45_93%_47%)]/20">
          <Crown className="w-7 h-7 text-[hsl(45_93%_47%)] mx-auto mb-3" />
          <p className="font-display text-3xl font-black text-foreground">
            €{(249 * currentTierData.commission / 100).toFixed(2)}
          </p>
          <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase mt-1">Max Per Sale</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="glass-surface rounded-xl p-6 text-center border border-primary/20">
          <Rocket className="w-7 h-7 text-primary mx-auto mb-3" />
          <p className="font-display text-3xl font-black text-primary">
            €{(249 * 50 / 100 * 10).toFixed(0)}
          </p>
          <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase mt-1">10 Sales at Diamond</p>
        </motion.div>
      </div>

      {/* Motivational CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 via-background to-primary/5 p-8 text-center"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Rocket className="w-10 h-10 text-accent mx-auto mb-4" />
        </motion.div>
        <h3 className="font-display text-xl font-black tracking-wider text-foreground mb-2">
          Ready to Level Up?
        </h3>
        <p className="text-sm text-muted-foreground font-body max-w-md mx-auto mb-4">
          Every referral brings you closer to the next tier. The top earners in our network make{" "}
          <span className="text-accent font-bold">€5,000+/month</span> — and it all starts with one share.
        </p>
        <div className="flex items-center justify-center gap-6 text-xs font-display tracking-wider text-muted-foreground">
          <span>🔥 No caps on earnings</span>
          <span>💰 Monthly payouts</span>
          <span>📈 Lifetime commissions</span>
        </div>
      </motion.div>
    </div>
  );
}
