import { motion } from "framer-motion";
import { Shield, Beaker, Gem, Crown } from "lucide-react";

interface HarmonyMeterProps {
  score: number;
}

function getHarmonyTier(score: number) {
  if (score >= 85) return { label: "Signature Level", icon: Crown, color: "text-accent", glow: "glow-accent", bg: "bg-accent/10", border: "border-accent/40" };
  if (score >= 70) return { label: "Refined", icon: Gem, color: "text-primary", glow: "glow-primary", bg: "bg-primary/10", border: "border-primary/40" };
  if (score >= 40) return { label: "Experimental", icon: Beaker, color: "text-secondary", glow: "glow-secondary", bg: "bg-secondary/10", border: "border-secondary/40" };
  return { label: "Unstable", icon: Shield, color: "text-destructive", glow: "", bg: "bg-destructive/10", border: "border-destructive/40" };
}

const HarmonyMeter = ({ score }: HarmonyMeterProps) => {
  const tier = getHarmonyTier(score);
  const Icon = tier.icon;

  return (
    <div className={`rounded-xl p-3 sm:p-4 ${tier.bg} border ${tier.border} transition-all duration-500`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <motion.div
            key={tier.label}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${tier.color}`} />
          </motion.div>
          <motion.span
            key={tier.label + "-text"}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`font-display text-xs sm:text-sm tracking-wider ${tier.color}`}
          >
            {tier.label}
          </motion.span>
        </div>
        <span className={`font-display text-lg sm:text-xl font-bold ${tier.color}`}>{score}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 sm:h-2 rounded-full bg-muted/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            score >= 85
              ? "bg-gradient-to-r from-accent to-accent/70"
              : score >= 70
              ? "bg-gradient-to-r from-primary to-primary/70"
              : score >= 40
              ? "bg-gradient-to-r from-secondary to-secondary/70"
              : "bg-gradient-to-r from-destructive to-destructive/70"
          }`}
          style={score >= 85 ? { boxShadow: "0 0 12px hsl(var(--accent) / 0.5)" } : undefined}
        />
      </div>

      {/* Tier milestones */}
      <div className="flex justify-between mt-2">
        {["Unstable", "Experimental", "Refined", "Signature"].map((t, i) => (
          <span
            key={t}
            className={`text-[8px] sm:text-[9px] font-display tracking-wide ${
              (i === 0 && score < 40) || (i === 1 && score >= 40 && score < 70) ||
              (i === 2 && score >= 70 && score < 85) || (i === 3 && score >= 85)
                ? tier.color
                : "text-muted-foreground/40"
            }`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

export default HarmonyMeter;
