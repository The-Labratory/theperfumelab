import { motion } from "framer-motion";
import { Crown, Award, TrendingUp, DollarSign } from "lucide-react";

const TIERS = [
  { name: "High Achiever", code: "high_achiever", commission: 50, requirement: "250+", color: "hsl(var(--accent))", bgClass: "bg-accent/20 border-accent/40", textClass: "text-accent", width: "w-[40%]" },
  { name: "Platinum", code: "platinum", commission: 40, requirement: "100+", color: "hsl(var(--primary))", bgClass: "bg-primary/20 border-primary/40", textClass: "text-primary", width: "w-[55%]" },
  { name: "Gold", code: "gold", commission: 35, requirement: "50+", color: "hsl(45 93% 47%)", bgClass: "bg-[hsl(45_93%_47%)]/20 border-[hsl(45_93%_47%)]/40", textClass: "text-[hsl(45_93%_47%)]", width: "w-[70%]" },
  { name: "Silver", code: "silver", commission: 30, requirement: "10+", color: "hsl(var(--muted-foreground))", bgClass: "bg-muted/30 border-muted-foreground/30", textClass: "text-muted-foreground", width: "w-[85%]" },
  { name: "Bronze", code: "bronze", commission: 20, requirement: "0+", color: "hsl(30 70% 45%)", bgClass: "bg-[hsl(30_70%_45%)]/20 border-[hsl(30_70%_45%)]/40", textClass: "text-[hsl(30_70%_45%)]", width: "w-full" },
];

const SAMPLE_TRANSACTIONS = [
  { label: "Eau de Parfum (50ml)", price: 89 },
  { label: "Parfum Extrait (30ml)", price: 129 },
  { label: "Discovery Set (5×10ml)", price: 59 },
  { label: "Bespoke Collection (3×50ml)", price: 249 },
];

interface Props {
  currentTier?: string;
  totalEarnings?: number;
  totalReferrals?: number;
}

export default function AffiliatePyramidChart({ currentTier = "bronze", totalEarnings = 0, totalReferrals = 0 }: Props) {
  return (
    <div className="space-y-8">
      {/* Pyramid Visual */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-accent" />
          <h3 className="font-display text-base font-semibold tracking-wide text-foreground">Commission Pyramid</h3>
        </div>
        <div className="flex flex-col items-center gap-2">
          {TIERS.map((tier, i) => {
            const isActive = tier.code === currentTier;
            const isPast = TIERS.findIndex(t => t.code === currentTier) <= i;
            return (
              <motion.div
                key={tier.code}
                initial={{ opacity: 0, scaleX: 0.5 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className={`${tier.width} relative`}
              >
                <div
                  className={`rounded-lg border px-4 py-3 flex items-center justify-between transition-all ${
                    isActive
                      ? `${tier.bgClass} ring-2 ring-primary/50 shadow-lg shadow-primary/10`
                      : isPast
                      ? `${tier.bgClass} opacity-80`
                      : "bg-muted/10 border-border/30 opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {i <= 1 ? (
                      <Crown className={`w-4 h-4 ${isActive ? tier.textClass : "text-muted-foreground/50"}`} />
                    ) : (
                      <Award className={`w-4 h-4 ${isActive ? tier.textClass : "text-muted-foreground/50"}`} />
                    )}
                    <div>
                      <span className={`text-sm font-display font-bold tracking-wide ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {tier.name}
                      </span>
                      <span className="text-[9px] font-display tracking-wider text-muted-foreground ml-2">
                        {tier.requirement} referrals
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-display text-xl font-black ${isActive ? tier.textClass : "text-muted-foreground/60"}`}>
                      {tier.commission}%
                    </span>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="block text-[9px] font-display tracking-wider text-primary"
                      >
                        YOUR TIER
                      </motion.span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Per-Transaction Earnings Table */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-display text-base font-semibold tracking-wide text-foreground">Earnings Per Transaction</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-4">
          See exactly how much you earn on each product at every tier level.
        </p>
        <div className="glass-surface rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left px-4 py-3 text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">Product</th>
                  <th className="text-center px-3 py-3 text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">Price</th>
                  {TIERS.slice().reverse().map(tier => (
                    <th key={tier.code} className={`text-center px-3 py-3 text-[10px] font-display tracking-[0.2em] uppercase ${tier.code === currentTier ? "text-primary" : "text-muted-foreground"}`}>
                      {tier.name}
                      <br />
                      <span className="text-[8px] opacity-60">{tier.commission}%</span>
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
                    <td className="px-4 py-3 font-body text-foreground">{tx.label}</td>
                    <td className="px-3 py-3 text-center font-display font-semibold text-foreground">€{tx.price}</td>
                    {TIERS.slice().reverse().map(tier => {
                      const earning = (tx.price * tier.commission / 100).toFixed(2);
                      const isCurrentTier = tier.code === currentTier;
                      return (
                        <td key={tier.code} className={`px-3 py-3 text-center font-display font-bold ${isCurrentTier ? "text-primary" : "text-muted-foreground/70"}`}>
                          €{earning}
                          {isCurrentTier && (
                            <span className="block text-[8px] text-primary/60">yours</span>
                          )}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-surface rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="font-display text-2xl font-black text-foreground">€{totalEarnings.toFixed(2)}</p>
          <p className="text-[9px] font-display tracking-[0.2em] text-muted-foreground uppercase">Total Earned</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-surface rounded-xl p-4 text-center">
          <DollarSign className="w-5 h-5 text-accent mx-auto mb-2" />
          <p className="font-display text-2xl font-black text-foreground">
            €{totalReferrals > 0 ? (totalEarnings / totalReferrals).toFixed(2) : "0.00"}
          </p>
          <p className="text-[9px] font-display tracking-[0.2em] text-muted-foreground uppercase">Avg / Referral</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-surface rounded-xl p-4 text-center">
          <Crown className="w-5 h-5 text-[hsl(45_93%_47%)] mx-auto mb-2" />
          <p className="font-display text-2xl font-black text-foreground">
            €{(249 * (TIERS.find(t => t.code === currentTier)?.commission || 20) / 100).toFixed(2)}
          </p>
          <p className="text-[9px] font-display tracking-[0.2em] text-muted-foreground uppercase">Max / Sale</p>
        </motion.div>
      </div>
    </div>
  );
}
