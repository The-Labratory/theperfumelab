import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const MilestonesPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-20 pb-12 px-4 max-w-5xl mx-auto text-center">
      <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-display font-bold gradient-text mb-2">Milestones</h1>
      <p className="text-muted-foreground">Coming soon — track your fragrance journey achievements.</p>
    </div>
  </div>
);
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Filter, Search, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import {
  allMilestones,
  milestoneCategories,
  rarityConfig,
  milestoneStats,
  type MilestoneCategory,
  type MilestoneRarity,
  type Milestone,
} from "@/data/milestonesData";

const MilestonesPage = () => {
  const [activeCategory, setActiveCategory] = useState<MilestoneCategory | "all">("all");
  const [activeRarity, setActiveRarity] = useState<MilestoneRarity | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = allMilestones;
    if (activeCategory !== "all") list = list.filter((m) => m.category === activeCategory);
    if (activeRarity !== "all") list = list.filter((m) => m.rarity === activeRarity);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
    }
    return list;
  }, [activeCategory, activeRarity, search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={8} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Trophy className="w-10 h-10 text-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-wider gradient-text mb-2">
            MILESTONE CARDS
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base mb-1">
            {milestoneStats.total} unique milestones across your perfumery journey
          </p>
          <p className="text-xs text-muted-foreground/60 font-body">
            {milestoneStats.totalXP.toLocaleString()} total XP to earn
          </p>
        </motion.div>

        {/* Stats ribbon */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {milestoneStats.byRarity.map((r) => (
            <div key={r.rarity} className="glass-surface rounded-lg px-3 py-1.5 flex items-center gap-1.5"
              style={{ borderColor: `${r.color}33` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-[10px] font-display tracking-wider" style={{ color: r.color }}>
                {r.count} {r.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search milestones..."
            className="w-full bg-card/50 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-display tracking-wider transition-all ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "glass-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            ALL ({milestoneStats.total})
          </button>
          {milestoneStats.byCategory.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-display tracking-wider transition-all ${
                activeCategory === cat.category ? "bg-primary text-primary-foreground" : "glass-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.emoji} {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Rarity filters */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveRarity("all")}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-display tracking-wider transition-all ${
              activeRarity === "all" ? "bg-secondary text-secondary-foreground" : "glass-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            All Rarities
          </button>
          {(["common", "rare", "epic", "legendary"] as MilestoneRarity[]).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRarity(r)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-display tracking-wider transition-all ${
                activeRarity === r ? "text-white" : "glass-surface text-muted-foreground hover:text-foreground"
              }`}
              style={activeRarity === r ? { backgroundColor: rarityConfig[r].color } : undefined}
            >
              {rarityConfig[r].label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-center text-xs text-muted-foreground font-body mb-6">
          Showing {filtered.length} of {milestoneStats.total} milestones
        </p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((milestone, i) => (
              <MilestoneCard key={milestone.id} milestone={milestone} index={i} />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">No milestones match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MilestoneCard = ({ milestone, index }: { milestone: Milestone; index: number }) => {
  const rarity = rarityConfig[milestone.rarity];
  const category = milestoneCategories[milestone.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      className="glass-surface rounded-xl p-4 border transition-all hover:scale-[1.02]"
      style={{ borderColor: `${rarity.color}22`, boxShadow: milestone.rarity === "legendary" ? rarity.glow : undefined }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ backgroundColor: `${rarity.color}15`, boxShadow: rarity.glow }}
        >
          {milestone.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-display text-xs sm:text-sm tracking-wider text-foreground truncate">
              {milestone.title}
            </h3>
          </div>
          <p className="text-[10px] sm:text-xs font-body text-muted-foreground leading-relaxed">
            {milestone.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[9px] font-display tracking-widest px-1.5 py-0.5 rounded"
              style={{ color: rarity.color, backgroundColor: `${rarity.color}15` }}
            >
              {rarity.label.toUpperCase()}
            </span>
            <span className="text-[9px] font-display tracking-wider text-muted-foreground/60">
              {category.emoji} {category.label}
            </span>
            <span className="text-[9px] font-display tracking-wider text-accent ml-auto flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> {milestone.xp} XP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MilestonesPage;
