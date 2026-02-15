import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2, Crown, Trophy, Flame, Copy, Check,
  Instagram, Twitter, ArrowRight, Sparkles, Users, Zap,
  TrendingUp, Star, Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProgression } from "@/hooks/useProgression";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";

/* ── Rank system ── */
const getRank = (score: number) => {
  if (score >= 95) return { title: "Grand Perfumer", tier: "LEGENDARY", color: "text-accent" };
  if (score >= 85) return { title: "Master Alchemist", tier: "MASTER", color: "text-primary" };
  if (score >= 70) return { title: "Scent Architect", tier: "EXPERT", color: "text-primary" };
  if (score >= 50) return { title: "Essence Weaver", tier: "ADEPT", color: "text-muted-foreground" };
  return { title: "Apprentice Nose", tier: "NOVICE", color: "text-muted-foreground" };
};

/* ── Status triggers — rotating FOMO ── */
const statusTriggers = [
  "Only 3 people reached 96% this week.",
  "No one has cracked 98% harmony. Yet.",
  "A new Grand Perfumer was crowned today.",
  "The weekly leaderboard resets every Monday.",
  "Someone just hit Signature Level for the first time.",
];

interface LeaderboardEntry {
  blend_number: number;
  blend_name: string | null;
  harmony_score: number;
  concentration: string;
  note_count: number;
  created_at: string;
}

interface SavedBlend {
  blend_number: number;
  name: string | null;
  harmony_score: number | null;
  concentration: string;
  scent_notes: any[];
  created_at: string;
}

const SharePage = () => {
  const [blends, setBlends] = useState<SavedBlend[]>([]);
  const [selectedBlend, setSelectedBlend] = useState<SavedBlend | null>(null);
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaders, setAllTimeLeaders] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"weekly" | "alltime">("weekly");
  const [copied, setCopied] = useState(false);
  const [triggerIdx, setTriggerIdx] = useState(0);
  const [viewerCount, setViewerCount] = useState(23);
  const { markCardShared } = useProgression();

  // Fetch user blends + leaderboards
  useEffect(() => {
    const fetchAll = async () => {
      const [blendsRes, weeklyRes, alltimeRes] = await Promise.all([
        supabase
          .from("saved_blends")
          .select("blend_number, name, harmony_score, concentration, scent_notes, created_at")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase.rpc("get_weekly_leaderboard", { _limit: 10 }),
        supabase.rpc("get_alltime_leaderboard", { _limit: 10 }),
      ]);

      if (blendsRes.data && blendsRes.data.length > 0) {
        const mapped = blendsRes.data.map(d => ({
          ...d,
          scent_notes: Array.isArray(d.scent_notes) ? d.scent_notes : [],
        }));
        setBlends(mapped);
        setSelectedBlend(mapped[0]);
      }

      if (weeklyRes.data) setWeeklyLeaders(weeklyRes.data as LeaderboardEntry[]);
      if (alltimeRes.data) setAllTimeLeaders(alltimeRes.data as LeaderboardEntry[]);
    };
    fetchAll();
  }, []);

  // Realtime: listen for new blends and refresh leaderboards
  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "saved_blends" },
        async () => {
          const [weeklyRes, alltimeRes] = await Promise.all([
            supabase.rpc("get_weekly_leaderboard", { _limit: 10 }),
            supabase.rpc("get_alltime_leaderboard", { _limit: 10 }),
          ]);
          if (weeklyRes.data) setWeeklyLeaders(weeklyRes.data as LeaderboardEntry[]);
          if (alltimeRes.data) setAllTimeLeaders(alltimeRes.data as LeaderboardEntry[]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Rotate status triggers
  useEffect(() => {
    const i = setInterval(() => setTriggerIdx(p => (p + 1) % statusTriggers.length), 4500);
    return () => clearInterval(i);
  }, []);

  // Fluctuate viewer count
  useEffect(() => {
    const i = setInterval(() => {
      setViewerCount(v => Math.max(12, Math.min(45, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 3000);
    return () => clearInterval(i);
  }, []);

  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/launch" : "";

  const shareText = (b: SavedBlend) => {
    const rank = getRank(b.harmony_score ?? 0);
    return `Blend No. ${String(b.blend_number).padStart(4, "0")}\nHarmony ${b.harmony_score}%\nStatus: ${rank.title}\n\nCrafted at The Perfume Lab\n${shareUrl}`;
  };

  const handleShare = async (b: SavedBlend) => {
    const text = shareText(b);
    if (navigator.share) {
      try { await navigator.share({ title: `Blend No. ${String(b.blend_number).padStart(4, "0")}`, text }); markCardShared(); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      markCardShared();
      toast.success("Copied to clipboard — paste anywhere");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const leaders = activeTab === "weekly" ? weeklyLeaders : allTimeLeaders;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <ParticleField count={15} />

      {/* ── STATUS TRIGGER TICKER ── */}
      <div className="fixed top-16 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={triggerIdx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-lg"
          >
            <Zap className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-body text-muted-foreground">
              {statusTriggers[triggerIdx]}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-28 pb-12 px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 glass-surface rounded-full px-4 py-2 border border-accent/20 mb-6">
            <Trophy className="w-3.5 h-3.5 text-accent" />
            <span className="font-display text-[9px] tracking-[0.3em] text-accent uppercase">
              The Arena
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-wider mb-3">
            <span className="gradient-text">Your blend.</span>
            <br />
            <span className="text-foreground">Your legacy.</span>
          </h1>
          <p className="text-sm text-muted-foreground font-body max-w-md mx-auto leading-relaxed">
            Every masterpiece deserves an audience. Share your Scent Identity Card
            and claim your rank on the leaderboard.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-[10px] text-muted-foreground/60 font-body">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            {viewerCount} creators browsing the arena
          </div>
        </motion.div>
      </section>

      {/* ── IDENTITY CARD SHOWCASE ── */}
      {selectedBlend && (
        <section className="relative z-10 py-8 px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-sm mx-auto">
            <IdentityCard blend={selectedBlend} onShare={() => handleShare(selectedBlend)} />
          </motion.div>
        </section>
      )}

      {/* ── BLEND SELECTOR ── */}
      {blends.length > 1 && (
        <section className="relative z-10 py-4 px-4 sm:px-6">
          <div className="max-w-lg mx-auto">
            <p className="text-[9px] font-display tracking-[0.3em] text-muted-foreground/60 text-center mb-3">YOUR COMPOSITIONS</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {blends.map(b => (
                <button key={b.blend_number} onClick={() => setSelectedBlend(b)}
                  className={`flex-shrink-0 glass-surface rounded-xl px-4 py-3 border transition-all ${
                    selectedBlend?.blend_number === b.blend_number ? "border-primary/40 bg-primary/5" : "border-border/30 hover:border-primary/20"
                  }`}
                >
                  <div className="font-display text-sm font-bold gradient-text">No. {String(b.blend_number).padStart(4, "0")}</div>
                  <div className="text-[9px] text-muted-foreground font-body mt-0.5">{b.harmony_score ?? 0}% harmony</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NO BLENDS CTA ── */}
      {blends.length === 0 && (
        <section className="relative z-10 py-12 px-4 sm:px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm mx-auto glass-surface rounded-2xl p-8 text-center border border-primary/20">
            <Lock className="w-8 h-8 text-primary/40 mx-auto mb-4" />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground mb-2">No identity yet.</h2>
            <p className="text-xs text-muted-foreground font-body mb-6 leading-relaxed">
              Create your first blend in the Scent Lab to unlock your Identity Card and enter the arena.
            </p>
            <Link to="/lab" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display text-xs tracking-widest glow-primary">
              Enter the Lab <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── REAL-TIME LEADERBOARD ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-border" />
              <TrendingUp className="w-4 h-4 text-accent" />
              <div className="h-px w-10 bg-border" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-1">
              Live Leaderboard
            </h2>
            <p className="text-[10px] text-muted-foreground font-body">
              Real rankings. Real creators. Updated in real-time.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center gap-2 mb-6">
            {(["weekly", "alltime"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-display text-[10px] tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-primary/10 border border-primary/30 text-primary"
                    : "glass-surface border border-border/30 text-muted-foreground hover:border-primary/20"
                }`}
              >
                {tab === "weekly" ? "THIS WEEK" : "ALL TIME"}
              </button>
            ))}
          </div>

          {/* Leaderboard entries */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {leaders.length === 0 ? (
                <div className="glass-surface rounded-xl p-8 text-center border border-border/30">
                  <Flame className="w-6 h-6 text-accent/40 mx-auto mb-3" />
                  <p className="font-display text-sm tracking-wider text-foreground mb-1">
                    {activeTab === "weekly" ? "No blends this week yet." : "No blends yet."}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-body">
                    Be the first to claim the #1 spot.
                  </p>
                </div>
              ) : (
                leaders.map((entry, i) => {
                  const rank = getRank(entry.harmony_score);
                  return (
                    <motion.div
                      key={`${entry.blend_number}-${activeTab}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass-surface rounded-xl px-4 py-3 flex items-center gap-3 border border-border/30"
                    >
                      <div className={`font-display text-lg font-black w-8 text-center ${
                        i === 0 ? "text-accent" : i === 1 ? "text-primary" : i === 2 ? "text-secondary" : "text-muted-foreground"
                      }`}>
                        {i === 0 ? <Crown className="w-5 h-5 mx-auto" /> : `#${i + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-xs font-bold text-foreground truncate">
                          Blend No. {String(entry.blend_number).padStart(4, "0")}
                        </div>
                        <div className="text-[9px] text-muted-foreground/60 font-body truncate">
                          {entry.blend_name || "Unnamed"} · {entry.note_count} notes
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-display text-sm font-black ${rank.color}`}>
                          {entry.harmony_score}%
                        </div>
                        <div className="text-[7px] font-display tracking-widest text-muted-foreground/50">
                          {rank.tier}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>

          {/* Weekly reset notice */}
          {activeTab === "weekly" && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mt-4 glass-surface rounded-xl px-4 py-3 border border-accent/10 text-center"
            >
              <p className="text-[10px] font-display tracking-widest text-muted-foreground">
                RESETS EVERY <span className="text-accent">MONDAY 00:00 UTC</span>
              </p>
              <p className="text-[9px] text-muted-foreground/50 font-body mt-1">
                Create a blend with 85%+ harmony to climb the ranks
              </p>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ── SHARE TOOLKIT ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-sm mx-auto text-center">
          <Share2 className="w-5 h-5 text-primary mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground mb-1">Spread the obsession.</h2>
          <p className="text-[10px] text-muted-foreground font-body mb-5">The fewer people who know, the more exclusive your rank stays.</p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 glass-surface rounded-lg px-3 py-2 text-[10px] font-body text-muted-foreground truncate">{shareUrl}</div>
            <button onClick={copyLink} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-display text-[10px] tracking-wider flex items-center gap-1.5 glow-primary">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex justify-center gap-2">
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
              className="glass-surface rounded-lg px-4 py-2.5 flex items-center gap-2 hover:border-primary/30 transition-colors">
              <Instagram className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display tracking-wider text-muted-foreground">Story</span>
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("You weren't supposed to find this.\n\n" + shareUrl)}`}
              target="_blank" rel="noopener noreferrer"
              className="glass-surface rounded-lg px-4 py-2.5 flex items-center gap-2 hover:border-primary/30 transition-colors">
              <Twitter className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display tracking-wider text-muted-foreground">Post</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── ADDICTION HOOKS ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6 border-t border-border/20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <Flame className="w-5 h-5 text-accent mx-auto mb-3" />
            <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-1">The obsession never stops.</h2>
            <p className="text-[10px] text-muted-foreground font-body">Every week, the game resets. Every blend, your rank evolves.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Star, label: "RARE UNLOCKS", desc: "Score 90%+ to unlock hidden ingredients", color: "text-accent" },
              { icon: Trophy, label: "WEEKLY CROWN", desc: "Top harmony wins 'Grand Perfumer' status", color: "text-primary" },
              { icon: Users, label: "ARENA RANK", desc: "Compete with creators worldwide", color: "text-secondary" },
              { icon: Sparkles, label: "EVOLVE DNA", desc: "Each blend refines your Scent Identity", color: "text-primary" },
            ].map((hook, i) => (
              <motion.div key={hook.label} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass-surface rounded-xl p-4 text-center border border-border/30 hover:border-primary/20 transition-colors">
                <hook.icon className={`w-5 h-5 ${hook.color} mx-auto mb-2`} />
                <div className="text-[8px] font-display tracking-[0.2em] text-muted-foreground mb-1">{hook.label}</div>
                <p className="text-[9px] text-muted-foreground/60 font-body leading-relaxed">{hook.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6 border-t border-border/30">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="max-w-sm mx-auto text-center">
          <p className="font-display text-sm tracking-wider text-foreground mb-2">Ready to claim your rank?</p>
          <p className="text-[10px] text-muted-foreground/60 font-body mb-6">The leaderboard is waiting. The question is — are you?</p>
          <Link to="/lab" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-widest glow-primary hover:brightness-110 transition-all">
            Create a Blend <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

/* ── IDENTITY CARD — the shareable artifact ── */
const IdentityCard = ({ blend, onShare }: { blend: SavedBlend; onShare: () => void }) => {
  const rank = getRank(blend.harmony_score ?? 0);
  const num = String(blend.blend_number).padStart(4, "0");
  const emojis = (blend.scent_notes || []).map((n: any) => n.emoji || "🔮");

  return (
    <div className="relative rounded-2xl border border-primary/20 p-6 sm:p-8"
      style={{
        background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
        boxShadow: "0 0 60px hsl(var(--primary) / 0.08), inset 0 1px 0 hsl(var(--primary) / 0.1)",
      }}
    >
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/30 rounded-tl-2xl" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/30 rounded-tr-2xl" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/30 rounded-bl-2xl" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/30 rounded-br-2xl" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-display text-[9px] tracking-[0.4em] text-muted-foreground">THE PERFUME LAB</span>
        </div>
        <span className="font-display text-[9px] tracking-[0.3em] text-primary">{rank.tier}</span>
      </div>

      <div className="text-center mb-6">
        <div className="font-display text-[10px] tracking-[0.5em] text-muted-foreground mb-1">BLEND</div>
        <div className="font-display text-4xl sm:text-5xl font-black tracking-wider gradient-text">No. {num}</div>
        {blend.name && <div className="font-body text-xs text-muted-foreground mt-2 italic">"{blend.name}"</div>}
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {emojis.map((e: string, i: number) => (
          <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className="text-xl sm:text-2xl" style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }}>
            {e}
          </motion.span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center">
          <div className="font-display text-xl sm:text-2xl font-black text-primary">{blend.harmony_score ?? 0}%</div>
          <div className="text-[8px] font-display tracking-widest text-muted-foreground mt-0.5">HARMONY</div>
        </div>
        <div className="text-center">
          <Crown className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-accent" />
          <div className="text-[8px] font-display tracking-widest text-muted-foreground mt-0.5">{rank.title.toUpperCase()}</div>
        </div>
        <div className="text-center">
          <div className="font-display text-xl sm:text-2xl font-black text-secondary">{emojis.length}</div>
          <div className="text-[8px] font-display tracking-widest text-muted-foreground mt-0.5">NOTES</div>
        </div>
      </div>

      <div className="text-center mb-6">
        <span className="glass-surface rounded-full px-4 py-1.5 text-[9px] font-display tracking-widest text-muted-foreground">
          {blend.concentration.toUpperCase()}
        </span>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-4" />

      <div className="flex items-center justify-between">
        <span className="text-[8px] font-body text-muted-foreground/50">Each composition is unique</span>
        <button onClick={onShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
          <Share2 className="w-3 h-3" />
          <span className="text-[10px] font-display tracking-wider">SHARE</span>
        </button>
      </div>
    </div>
  );
};

export default SharePage;
