import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Award, TrendingUp, DollarSign, Flame, Target, Rocket, Star, Zap, ArrowUp, Gift, Lock, Sparkles, Trophy, Eye, Gem, Shield, Users, ChevronRight, Heart } from "lucide-react";
import ConfettiBurst from "./ConfettiBurst";
import { playCelebrationChime } from "./celebrationSound";

/* ── TIER DATA ── */
const TIERS = [
  {
    name: "Diamond Legend",
    code: "diamond",
    commission: 50,
    requirement: "100+ sales",
    minSales: 100,
    color: "hsl(var(--accent))",
    bgClass: "bg-accent/20 border-accent/40",
    textClass: "text-accent",
    glowClass: "shadow-[0_0_30px_hsl(var(--accent)/0.3)]",
    width: "w-[30%]",
    emoji: "🏆",
    gradient: "from-accent/30 to-accent/5",
  },
  {
    name: "Platinum",
    code: "platinum",
    commission: 40,
    requirement: "60+ sales",
    minSales: 60,
    color: "hsl(var(--primary))",
    bgClass: "bg-primary/20 border-primary/40",
    textClass: "text-primary",
    glowClass: "shadow-[0_0_25px_hsl(var(--primary)/0.25)]",
    width: "w-[42%]",
    emoji: "💎",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    name: "Gold",
    code: "gold",
    commission: 30,
    requirement: "30+ sales",
    minSales: 30,
    color: "hsl(45 93% 47%)",
    bgClass: "bg-[hsl(45_93%_47%)]/20 border-[hsl(45_93%_47%)]/40",
    textClass: "text-[hsl(45_93%_47%)]",
    glowClass: "shadow-[0_0_20px_hsl(45_93%_47%/0.2)]",
    width: "w-[56%]",
    emoji: "👑",
    gradient: "from-[hsl(45_93%_47%)]/20 to-[hsl(45_93%_47%)]/5",
  },
  {
    name: "Silver",
    code: "silver",
    commission: 20,
    requirement: "15+ sales",
    minSales: 15,
    color: "hsl(var(--muted-foreground))",
    bgClass: "bg-muted/30 border-muted-foreground/30",
    textClass: "text-muted-foreground",
    glowClass: "",
    width: "w-[72%]",
    emoji: "🌟",
    gradient: "from-muted/20 to-muted/5",
  },
  {
    name: "Bronze",
    code: "bronze",
    commission: 15,
    requirement: "5+ sales",
    minSales: 5,
    color: "hsl(30 70% 45%)",
    bgClass: "bg-[hsl(30_70%_45%)]/20 border-[hsl(30_70%_45%)]/40",
    textClass: "text-[hsl(30_70%_45%)]",
    glowClass: "",
    width: "w-[86%]",
    emoji: "🔥",
    gradient: "from-[hsl(30_70%_45%)]/15 to-[hsl(30_70%_45%)]/5",
  },
  {
    name: "Starter",
    code: "starter",
    commission: 10,
    requirement: "0+ sales",
    minSales: 0,
    color: "hsl(var(--muted-foreground))",
    bgClass: "bg-muted/10 border-border/30",
    textClass: "text-muted-foreground/60",
    glowClass: "",
    width: "w-full",
    emoji: "🌱",
    gradient: "from-muted/10 to-muted/5",
  },
];

/* ── SAMPLE PRODUCTS ── */
const SAMPLE_PRODUCTS = [
  { label: "Eau de Parfum (50ml)", price: 89 },
  { label: "Parfum Extrait (30ml)", price: 129 },
  { label: "Discovery Set (5×10ml)", price: 59 },
  { label: "Bespoke Collection (3×50ml)", price: 249 },
];

/* ── TEAM MEMBER SIMULATION ── */
const TEAM_SIMULATION = [
  { name: "Agent A", level: "Direct", yourCut: 100, emoji: "👤" },
  { name: "Agent B", level: "Direct", yourCut: 100, emoji: "👤" },
  { name: "Sub-Agent A1", level: "Level 2", yourCut: 50, emoji: "👥" },
  { name: "Sub-Agent A2", level: "Level 2", yourCut: 50, emoji: "👥" },
  { name: "Sub-Agent B1", level: "Level 2", yourCut: 50, emoji: "👥" },
  { name: "Deep Agent", level: "Level 3", yourCut: 25, emoji: "🔗" },
];

/* ── FOUNDER-LEVEL EXCLUSIVE REWARDS ── */
const FOUNDER_PERKS = [
  { icon: Crown, title: "Personal Fragrance Line", desc: "Get your own co-branded fragrance collection manufactured under your name", emoji: "👑", unlockAt: 80 },
  { icon: Gift, title: "Annual Luxury Retreat", desc: "All-expenses-paid trip to our French atelier with your top 3 team members", emoji: "✈️", unlockAt: 85 },
  { icon: DollarSign, title: "Equity Partnership", desc: "Become a minority stakeholder with profit-sharing from the entire network", emoji: "📈", unlockAt: 90 },
  { icon: Trophy, title: "CEO Direct Line", desc: "Personal WhatsApp access to LAW el HARIRI for mentorship & strategy", emoji: "📱", unlockAt: 95 },
  { icon: Sparkles, title: "Legacy Builder Status", desc: "Your earnings pass to your family. Build generational wealth through fragrance", emoji: "🏛️", unlockAt: 100 },
];

/* ── STREAK BONUSES ── */
const STREAK_BONUSES = [
  { streak: 3, bonus: "5% bonus on all sales this week", emoji: "🔥", color: "text-[hsl(30_70%_50%)]" },
  { streak: 7, bonus: "Free Discovery Set + 10% bonus", emoji: "⚡", color: "text-primary" },
  { streak: 14, bonus: "Double commission day unlock", emoji: "💎", color: "text-accent" },
  { streak: 30, bonus: "VIP Diamond Rush — 60% commission for 48 hours", emoji: "🏆", color: "text-[hsl(45_93%_47%)]" },
];

/* ── URGENCY NOTIFICATIONS ── */
const FOMO_MESSAGES = [
  "🚀 3 affiliates were promoted to Gold this week",
  "💰 Top earner made €2,340 yesterday alone",
  "🔥 Only 5 Platinum slots remain in your region",
  "⚡ Double commission event starts in 48 hours",
  "👑 The next Diamond member gets a €500 launch bonus",
];

interface Props {
  currentTier?: string;
  totalEarnings?: number;
  totalReferrals?: number;
}

export default function AffiliatePyramidChart({ currentTier = "starter", totalEarnings = 0, totalReferrals = 0 }: Props) {
  const currentTierData = TIERS.find(t => t.code === currentTier) || TIERS[TIERS.length - 1];
  const currentTierIndex = TIERS.findIndex(t => t.code === currentTier);
  const nextTier = currentTierIndex > 0 ? TIERS[currentTierIndex - 1] : null;
  const [expandedReward, setExpandedReward] = useState<number | null>(null);
  const [confettiIdx, setConfettiIdx] = useState<number | null>(null);
  const [fomoIdx] = useState(() => Math.floor(Math.random() * FOMO_MESSAGES.length));

  return (
    <div className="space-y-12">

      {/* ═══════ FOMO TICKER ═══════ */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative overflow-hidden rounded-xl border border-accent/20 bg-accent/5 px-5 py-3"
      >
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center gap-3"
        >
          <Zap className="w-4 h-4 text-accent shrink-0" />
          <p className="text-sm font-display tracking-wide text-accent font-bold">{FOMO_MESSAGES[fomoIdx]}</p>
        </motion.div>
      </motion.div>

      {/* ═══════ YOUR POSITION BANNER ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 border border-accent/20 mb-6"
        >
          <span className="text-3xl">{currentTierData.emoji}</span>
          <div className="text-left">
            <span className="text-[10px] font-display tracking-[0.3em] text-muted-foreground block">YOUR RANK</span>
            <span className="text-xl font-display font-black tracking-wider text-foreground">
              {currentTierData.name}
            </span>
          </div>
          <div className="ml-4 pl-4 border-l border-border/30 text-right">
            <span className={`text-3xl font-display font-black ${currentTierData.textClass}`}>{currentTierData.commission}%</span>
            <span className="text-[10px] font-display tracking-wider text-muted-foreground block">per sale</span>
          </div>
        </motion.div>

        {nextTier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground font-body">
              <span className="text-foreground font-bold">{nextTier.minSales - totalReferrals} more sales</span> to unlock{" "}
              <span className={`font-black ${nextTier.textClass}`}>{nextTier.name} ({nextTier.commission}%)</span>
            </p>
            <div className="max-w-xs mx-auto">
              <div className="w-full h-3 rounded-full bg-muted/30 overflow-hidden border border-border/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((totalReferrals - currentTierData.minSales) / (nextTier.minSales - currentTierData.minSales)) * 100, 100)}%` }}
                  transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-primary"
                />
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {totalReferrals}/{nextTier.minSales} sales
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ═══════ THE PYRAMID — VISUAL HIERARCHY ═══════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-6 h-6 text-accent" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Affiliate Network</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-8">
          LAW el HARIRI sits at the apex. Climb closer to the top and unlock <span className="text-accent font-bold">legendary rewards</span> no one else gets.
        </p>

        {/* Founder Apex */}
        <div className="flex flex-col items-center mb-4">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-[180px] rounded-2xl border-2 border-accent/60 bg-gradient-to-b from-accent/20 to-accent/5 p-4 text-center shadow-[0_0_40px_hsl(var(--accent)/0.2)] backdrop-blur-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Crown className="w-6 h-6 text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]" />
                </motion.div>
              </div>
              <p className="font-display text-xs font-black tracking-[0.2em] text-accent mt-2">FOUNDER</p>
              <p className="font-display text-sm font-black text-foreground mt-1">LAW el HARIRI</p>
              <p className="text-[9px] text-muted-foreground font-display tracking-wider mt-1">CEO & Visionary</p>
              <div className="mt-2 pt-2 border-t border-accent/20">
                <p className="text-[9px] font-display tracking-wider text-accent/80">EARNS FROM EVERY SALE IN THE NETWORK</p>
              </div>
            </div>
          </motion.div>
          <div className="w-px h-6 bg-accent/30" />
        </div>

        {/* Tier Pyramid Blocks */}
        <div className="flex flex-col items-center gap-3">
          {TIERS.map((tier, i) => {
            const isActive = tier.code === currentTier;
            const isUnlocked = currentTierIndex <= i;
            return (
              <motion.div
                key={tier.code}
                initial={{ opacity: 0, scaleX: 0.3 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                className={`${tier.width} relative`}
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.015, 1] } : {}}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className={`rounded-xl border-2 px-5 py-4 flex items-center justify-between transition-all ${
                    isActive
                      ? `${tier.bgClass} ring-2 ring-offset-2 ring-offset-background ring-primary/50 ${tier.glowClass}`
                      : isUnlocked
                      ? `${tier.bgClass} opacity-75`
                      : "bg-muted/5 border-border/20 opacity-30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tier.emoji}</span>
                    <div>
                      <span className={`text-sm font-display font-black tracking-wide ${isActive || isUnlocked ? "text-foreground" : "text-muted-foreground/50"}`}>
                        {tier.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-display tracking-wider text-muted-foreground">
                          {tier.requirement}
                        </span>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[8px] font-display tracking-[0.25em] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30"
                          >
                            ★ YOU ARE HERE
                          </motion.span>
                        )}
                        {!isUnlocked && (
                          <Lock className="w-3 h-3 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-display text-2xl font-black ${isActive ? tier.textClass : isUnlocked ? "text-muted-foreground/60" : "text-muted-foreground/30"}`}>
                      {tier.commission}%
                    </span>
                    <p className="text-[9px] font-display text-muted-foreground/50">commission</p>
                  </div>
                </motion.div>
                {i < TIERS.length - 1 && (
                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-10">
                    <ArrowUp className="w-3.5 h-3.5 text-muted-foreground/20 rotate-180" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══════ TEAM EARNINGS WATERFALL ═══════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-6 h-6 text-primary" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Your Team Earnings Breakdown</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-6">
          See exactly how much <span className="text-primary font-bold">you earn</span> from each member's sale. Build your team = multiply your income.
        </p>

        <div className="glass-surface rounded-xl border border-border/30 overflow-hidden">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 px-5 py-3 border-b border-border/20">
            <p className="text-xs font-display tracking-[0.2em] text-foreground font-bold">
              SCENARIO: Average Sale = €89 | Your Tier: {currentTierData.name} ({currentTierData.commission}%)
            </p>
          </div>
          <div className="divide-y divide-border/10">
            {TEAM_SIMULATION.map((member, i) => {
              const yourEarning = (89 * currentTierData.commission / 100 * member.yourCut / 100);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-center justify-between px-5 py-3 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{member.emoji}</span>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground">{member.name}</p>
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground">{member.level} · {member.yourCut}% of your commission</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.p
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="font-display text-lg font-black text-primary"
                    >
                      €{yourEarning.toFixed(2)}
                    </motion.p>
                    <p className="text-[9px] font-display tracking-wider text-muted-foreground/60">per sale</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <p className="font-display text-sm font-black text-foreground">If ALL 6 members sell once</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-black text-accent">
                €{TEAM_SIMULATION.reduce((sum, m) => sum + (89 * currentTierData.commission / 100 * m.yourCut / 100), 0).toFixed(2)}
              </p>
              <p className="text-[9px] font-display tracking-wider text-accent/70">YOUR TOTAL TAKE</p>
            </div>
          </div>
        </div>

        {/* Scale projection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 rounded-xl border border-accent/15 bg-gradient-to-r from-accent/5 to-primary/5 p-5"
        >
          <p className="text-xs font-display tracking-wider text-muted-foreground mb-3">📈 SCALE PROJECTION — What if your team grows?</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { team: 10, label: "Small Team" },
              { team: 25, label: "Growing Network" },
              { team: 50, label: "Empire" },
            ].map((proj, i) => {
              const monthly = proj.team * 2 * (89 * currentTierData.commission / 100 * 0.7);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.15 }}
                  className="text-center p-3 rounded-xl bg-background/50 border border-border/20"
                >
                  <p className="text-2xl mb-1">
                    {i === 0 ? "🌱" : i === 1 ? "🌳" : "🏰"}
                  </p>
                  <p className="text-[10px] font-display tracking-wider text-muted-foreground">{proj.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{proj.team} members</p>
                  <p className="font-display text-xl font-black text-primary mt-2">
                    €{monthly.toFixed(0)}
                  </p>
                  <p className="text-[9px] font-display tracking-wider text-primary/60">/month est.</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══════ PER-PRODUCT EARNINGS TABLE ═══════ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-6 h-6 text-primary" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">What You Earn Per Product</h3>
        </div>
        <div className="glass-surface rounded-xl overflow-hidden border border-border/30">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-muted/10">
                  <th className="text-left px-5 py-4 text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">Product</th>
                  <th className="text-center px-4 py-4 text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">Price</th>
                  {TIERS.slice().reverse().map(tier => (
                    <th key={tier.code} className={`text-center px-3 py-4 text-[10px] font-display tracking-[0.15em] uppercase ${tier.code === currentTier ? `${tier.textClass} font-bold` : "text-muted-foreground/50"}`}>
                      <span className="block">{tier.emoji}</span>
                      <span className="block mt-0.5">{tier.commission}%</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE_PRODUCTS.map((tx, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="border-b border-border/10 hover:bg-muted/10 transition-colors"
                  >
                    <td className="px-5 py-3 font-body text-foreground font-medium text-xs">{tx.label}</td>
                    <td className="px-4 py-3 text-center font-display font-bold text-foreground">€{tx.price}</td>
                    {TIERS.slice().reverse().map(tier => {
                      const earning = (tx.price * tier.commission / 100).toFixed(2);
                      const isCurrent = tier.code === currentTier;
                      return (
                        <td key={tier.code} className={`px-3 py-3 text-center ${isCurrent ? "bg-primary/5" : ""}`}>
                          <span className={`font-display font-black ${isCurrent ? "text-primary text-base" : "text-muted-foreground/40 text-sm"}`}>
                            €{earning}
                          </span>
                          {isCurrent && (
                            <motion.span
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="block text-[8px] font-display tracking-[0.2em] text-primary mt-0.5"
                            >
                              YOURS
                            </motion.span>
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

      {/* ═══════ STREAK BONUSES ═══════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Flame className="w-6 h-6 text-[hsl(30_70%_50%)]" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Streak Bonuses</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-6">
          Sell consistently and unlock <span className="text-accent font-bold">insane multipliers</span>. Don't break the chain!
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STREAK_BONUSES.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="rounded-xl border border-border/20 bg-muted/10 p-5 text-center cursor-default hover:border-primary/30 transition-all group"
            >
              <motion.span
                className="text-3xl block mb-2"
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
              >
                {s.emoji}
              </motion.span>
              <p className={`font-display text-2xl font-black ${s.color}`}>{s.streak} days</p>
              <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-2">CONSECUTIVE SALES</p>
              <p className="text-xs font-body text-foreground/80 leading-relaxed">{s.bonus}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ═══════ FOUNDER-PROXIMITY REWARDS ═══════ */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Gem className="w-6 h-6 text-accent" />
          <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Founder-Level Exclusives</h3>
        </div>
        <p className="text-xs text-muted-foreground font-body mb-2">
          Get close to the top and unlock rewards that <span className="text-accent font-bold">no money can buy</span>.
        </p>
        <p className="text-[10px] text-accent/60 font-display tracking-wider mb-6">
          💡 These rewards are ONLY available to Diamond Legends with 80+ sales
        </p>

        <div className="space-y-3">
          {FOUNDER_PERKS.map((perk, i) => {
            const Icon = perk.icon;
            const isUnlocked = totalReferrals >= perk.unlockAt;
            const isExpanded = expandedReward === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  onClick={() => {
                    const opening = !isExpanded;
                    setExpandedReward(opening ? i : null);
                    if (opening && isUnlocked) {
                      setConfettiIdx(i);
                      playCelebrationChime();
                      setTimeout(() => setConfettiIdx(null), 1200);
                    }
                  }}
                  className={`rounded-xl border-2 p-5 cursor-pointer transition-all ${
                    isUnlocked
                      ? "border-accent/40 bg-gradient-to-r from-accent/10 to-accent/5 hover:shadow-lg hover:shadow-accent/10"
                      : "border-border/20 bg-muted/5 hover:border-border/40"
                  }`}
                >
                  <div className="flex items-center justify-between relative">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? "bg-accent/20" : "bg-muted/20"}`}>
                        {isUnlocked ? (
                          <span className="text-2xl">{perk.emoji}</span>
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground/30" />
                        )}
                      </div>
                      <div>
                        <p className={`font-display text-sm font-black tracking-wide ${isUnlocked ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {perk.title}
                        </p>
                        <p className="text-[10px] font-display tracking-wider text-muted-foreground">
                          Unlocks at {perk.unlockAt} sales
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isUnlocked && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-display text-muted-foreground/40">{perk.unlockAt - totalReferrals} sales away</p>
                        </div>
                      )}
                      <ChevronRight className={`w-4 h-4 text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                    <ConfettiBurst trigger={confettiIdx === i} intensity={i + 3} />
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-muted-foreground font-body mt-4 pt-3 border-t border-border/20 leading-relaxed">
                          {perk.desc}
                        </p>
                        {!isUnlocked && (
                          <div className="mt-3">
                            <div className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((totalReferrals / perk.unlockAt) * 100, 100)}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full bg-gradient-to-r from-accent/50 to-accent"
                              />
                            </div>
                            <p className="text-[9px] text-muted-foreground/50 mt-1">{totalReferrals}/{perk.unlockAt} sales</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══════ EARNINGS SUMMARY CARDS ═══════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Total Earned", value: `€${totalEarnings.toFixed(2)}`, border: "border-primary/20", iconColor: "text-primary" },
          { icon: DollarSign, label: "Avg / Sale", value: `€${totalReferrals > 0 ? (totalEarnings / totalReferrals).toFixed(2) : "0.00"}`, border: "border-accent/20", iconColor: "text-accent" },
          { icon: Crown, label: "Max Per Sale", value: `€${(249 * currentTierData.commission / 100).toFixed(2)}`, border: "border-[hsl(45_93%_47%)]/20", iconColor: "text-[hsl(45_93%_47%)]" },
          { icon: Rocket, label: "Diamond Potential", value: `€${(249 * 50 / 100 * 10).toFixed(0)}/wk`, border: "border-primary/20", iconColor: "text-primary" },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={`glass-surface rounded-xl p-5 text-center border ${card.border}`}
          >
            <card.icon className={`w-6 h-6 ${card.iconColor} mx-auto mb-2`} />
            <p className="font-display text-2xl font-black text-foreground">{card.value}</p>
            <p className="text-[9px] font-display tracking-[0.2em] text-muted-foreground uppercase mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ═══════ FINAL CTA ═══════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border-2 border-accent/20 bg-gradient-to-br from-accent/10 via-background to-primary/10 p-10 text-center relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative z-10">
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Rocket className="w-12 h-12 text-accent mx-auto mb-4 drop-shadow-[0_0_15px_hsl(var(--accent)/0.4)]" />
          </motion.div>
          <h3 className="font-display text-2xl font-black tracking-wider text-foreground mb-3">
            Your Empire Awaits
          </h3>
          <p className="text-sm text-muted-foreground font-body max-w-lg mx-auto mb-6">
            Every sale brings you closer to <span className="text-accent font-bold">Diamond Legend</span> status.
            The top earners in our network pocket <span className="text-primary font-bold">€8,000+/month</span> — 
            with a team of just 25 active members.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-display tracking-wider text-muted-foreground">
            <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-[hsl(30_70%_50%)]" /> No earning caps</span>
            <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-accent" /> Lifetime commissions</span>
            <span className="flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-[hsl(45_93%_47%)]" /> Generational wealth</span>
            <span className="flex items-center gap-1.5"><Gem className="w-3.5 h-3.5 text-primary" /> Equity options</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
