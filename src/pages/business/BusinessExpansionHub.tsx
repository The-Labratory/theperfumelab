import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Sparkles, Users, TrendingUp, Lock, ChevronRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  EXPANSION_TIERS,
  getExpansionTier,
  salesUntilNextTier,
  nextTierName,
  canAccessQREngine,
  canAccessB2BSuite,
  canAccessTeamPortal,
} from "@/lib/affiliateTiers";

const FEATURES = [
  {
    key: "qr",
    title: "Scent-Station QR Engine",
    description:
      "Generate location-based QR codes for gyms, salons, offices and more. Each door gets its own scan & sales dashboard.",
    icon: QrCode,
    href: "/my-business/qr-engine",
    requiredTier: "growth",
    tierLabel: "Growth",
    unlockSales: 5,
  },
  {
    key: "pitch",
    title: "AI B2B Pitch Architect",
    description:
      "AI-generated PDF proposals for barbershops, hotels, and offices — ready for the 40% corporate discount conversation.",
    icon: Sparkles,
    href: "/my-business/pitch-builder",
    requiredTier: "pro",
    tierLabel: "Pro",
    unlockSales: 15,
  },
  {
    key: "team",
    title: "Sub-Affiliate Team Portal",
    description:
      "Sponsor sub-affiliates and earn a 10% management override on every sale they make while running your own team.",
    icon: Users,
    href: "/my-business/team",
    requiredTier: "pro",
    tierLabel: "Pro",
    unlockSales: 15,
  },
] as const;

export default function BusinessExpansionHub() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();

  const weeklySales: number = affiliate?.weekly_sales_count ?? 0;
  const tierKey = getExpansionTier(weeklySales);
  const tier = EXPANSION_TIERS[tierKey];
  const consecutiveWeeks: number = affiliate?.consecutive_qualifying_weeks ?? 0;
  const b2bUnlocked: boolean = affiliate?.b2b_suite_unlocked ?? false;

  const salesNeeded = salesUntilNextTier(weeklySales);
  const nextTier = nextTierName(weeklySales);

  // Progress towards the next milestone
  const progressPct =
    tierKey === "seed"
      ? Math.min((weeklySales / 5) * 100, 100)
      : tierKey === "growth"
      ? Math.min(((weeklySales - 5) / 10) * 100, 100)
      : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
          Expansion Suite
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Scale from B2C to B2B — unlocked by performance, not upfront cost.
        </p>
      </div>

      {/* Tier Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-6 ${tier.bgColor} ${tier.borderColor}`}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{tier.emoji}</span>
              <h3 className={`font-display text-xl font-black ${tier.color}`}>
                {tier.name} Tier
              </h3>
              {b2bUnlocked && (
                <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-400">
                  B2B Suite Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-md">{tier.description}</p>
          </div>
          <div className="text-right">
            <p className={`font-display text-3xl font-black ${tier.color}`}>{weeklySales}</p>
            <p className="text-xs text-muted-foreground font-display tracking-widest">SALES / WEEK</p>
          </div>
        </div>

        {/* Progress bar to next tier */}
        {tierKey !== "pro" && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress to {nextTier}</span>
              <span>{salesNeeded} more {salesNeeded === 1 ? "sale" : "sales"} needed</span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>
        )}

        {/* Consecutive weeks tracking for B2B free unlock */}
        {tierKey === "growth" && !b2bUnlocked && (
          <div className="mt-4 rounded-lg bg-background/30 border border-border/30 p-3 flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Maintain 5+ sales/week for{" "}
              <span className="text-foreground font-semibold">
                {consecutiveWeeks}/2 consecutive weeks
              </span>{" "}
              to unlock the full B2B suite <strong>for free</strong>.
            </p>
          </div>
        )}
        {b2bUnlocked && (
          <div className="mt-4 rounded-lg bg-background/30 border border-green-400/30 p-3 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <p className="text-xs text-green-400">
              B2B Suite is <strong>FREE</strong> — you maintained 5+ sales/week for 2 consecutive weeks.
            </p>
          </div>
        )}
      </motion.div>

      {/* Feature Cards */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {FEATURES.map((feature, i) => {
          const isUnlocked =
            feature.key === "qr"
              ? canAccessQREngine(tierKey)
              : feature.key === "pitch"
              ? canAccessB2BSuite(tierKey)
              : canAccessTeamPortal(tierKey);

          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`rounded-2xl border p-5 flex flex-col gap-4 transition-all ${
                isUnlocked
                  ? "glass-surface border-border/40 hover:border-primary/40"
                  : "bg-muted/20 border-border/20 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isUnlocked ? "bg-primary/20" : "bg-muted/40"
                  }`}
                >
                  {isUnlocked ? (
                    <Icon className="w-5 h-5 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    isUnlocked
                      ? "border-green-400/40 text-green-400"
                      : "border-border/40 text-muted-foreground"
                  }`}
                >
                  {isUnlocked ? "Unlocked" : `Requires ${feature.tierLabel}`}
                </Badge>
              </div>

              <div className="flex-1">
                <h4 className="font-display text-sm font-bold text-foreground mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {isUnlocked ? (
                <Link
                  to={feature.href}
                  className="flex items-center justify-between rounded-lg bg-primary/10 hover:bg-primary/20 px-3 py-2 text-xs font-display font-semibold text-primary tracking-wider transition-colors"
                >
                  OPEN
                  <ChevronRight className="w-3 h-3" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Reach {feature.unlockSales} sales/week to unlock
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
