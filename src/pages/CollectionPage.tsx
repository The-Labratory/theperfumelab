import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Flame, X, ArrowRight, Beaker, Lock, CheckCircle, Circle, Shield, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { perfumeCollections, type PerfumeCollection } from "@/data/collectionsData";
import { useProgression, collectionQuests } from "@/hooks/useProgression";

const intensityBars: Record<string, number> = { Light: 1, Moderate: 2, Bold: 3, Intense: 4 };

const CollectionPage = () => {
  const [selectedPerfume, setSelectedPerfume] = useState<PerfumeCollection | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const { isUnlocked, getQuestProgress, state } = useProgression();

  const totalUnlocked = perfumeCollections.filter((_, i) => isUnlocked(i)).length;

  const handleSelect = (perfume: PerfumeCollection, index: number) => {
    if (isUnlocked(index)) {
      setSelectedPerfume(perfume);
      setSelectedIndex(index);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-wider gradient-text mb-3">
            THE COLLECTION
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-lg max-w-xl mx-auto mb-4">
            Six masterworks. Each one earned, not given. Complete quests to unlock the next chapter.
          </p>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-display tracking-widest text-muted-foreground">
                PROGRESS
              </span>
              <span className="text-[9px] font-display tracking-widest text-primary">
                {totalUnlocked}/{perfumeCollections.length} UNLOCKED
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(totalUnlocked / perfumeCollections.length) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Collection grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {perfumeCollections.map((perfume, i) => {
            const unlocked = isUnlocked(i);
            const progress = getQuestProgress(i);

            return (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelect(perfume, i)}
                className={`group glass-surface rounded-2xl p-5 sm:p-6 relative overflow-hidden transition-all ${
                  unlocked
                    ? "cursor-pointer hover:border-primary/30"
                    : "cursor-default opacity-70"
                }`}
              >
                {/* Lock overlay for gated items */}
                {!unlocked && (
                  <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                    <Lock className="w-6 h-6 text-primary/40 mb-3" />
                    <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">
                      COMPLETE TO UNLOCK
                    </p>
                    <div className="w-full max-w-[180px] space-y-1.5">
                      {progress.quests.map((q, qi) => (
                        <div key={qi} className="flex items-center gap-2">
                          {q.done ? (
                            <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                          ) : (
                            <Circle className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                          )}
                          <span className={`text-[9px] font-body ${q.done ? "text-primary line-through" : "text-muted-foreground"}`}>
                            {q.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 h-1 w-full max-w-[180px] rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-[8px] font-display tracking-widest text-muted-foreground/50 mt-1.5">
                      {progress.completed}/{progress.total} COMPLETE
                    </span>
                  </div>
                )}

                {/* Unlock badge */}
                {unlocked && (
                  <div className="absolute top-3 right-3">
                    {perfume.featured ? (
                      <span className="text-[9px] font-display tracking-widest bg-accent/10 text-accent px-2 py-1 rounded-full border border-accent/30">
                        FEATURED
                      </span>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-primary/40" />
                    )}
                  </div>
                )}

                {/* Level indicator */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-4xl">{perfume.emoji}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: i + 1 }).map((_, si) => (
                      <Shield key={si} className={`w-2.5 h-2.5 ${unlocked ? "text-primary" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                </div>

                <h3 className="font-display text-base sm:text-lg font-bold tracking-wide text-foreground mb-1">
                  {perfume.name}
                </h3>
                <p className="text-xs text-muted-foreground font-body italic mb-3">{perfume.tagline}</p>
                <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-4">{perfume.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground">{perfume.family}</span>
                  <span className="font-display text-sm text-primary">€{perfume.price["50ml"]}</span>
                </div>

                {/* Intensity */}
                <div className="flex items-center gap-1 mt-3">
                  <Flame className="w-3 h-3 text-muted-foreground" />
                  {[1, 2, 3, 4].map((level) => (
                    <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${
                      level <= intensityBars[perfume.intensity] ? "bg-primary" : "bg-muted/50"
                    }`} />
                  ))}
                  <span className="text-[9px] text-muted-foreground font-body ml-1">{perfume.intensity}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quest summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 glass-surface rounded-2xl p-6 sm:p-8 border border-primary/10"
        >
          <div className="flex items-center gap-3 mb-5">
            <Trophy className="w-5 h-5 text-accent" />
            <h3 className="font-display text-base font-bold tracking-wider text-foreground">
              Your Quest Progress
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuestStat label="WAITLIST" value={state.waitlistJoined ? "✓" : "—"} done={state.waitlistJoined} />
            <QuestStat label="WORLDS" value={`${state.worldsVisited.length}/6`} done={state.worldsVisited.length >= 6} />
            <QuestStat label="BLENDS" value={String(state.blendsCreated)} done={state.blendsCreated >= 5} />
            <QuestStat label="SHARES" value={String(state.cardsShared)} done={state.cardsShared >= 3} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {!state.waitlistJoined && (
              <Link to="/access" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-display tracking-wider hover:bg-primary/20 transition-colors">
                Join Waitlist <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {state.worldsVisited.length < 6 && (
              <Link to="/worlds" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-display tracking-wider hover:bg-primary/20 transition-colors">
                Explore Worlds <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {state.blendsCreated < 5 && (
              <Link to="/lab" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-display tracking-wider hover:bg-primary/20 transition-colors">
                Create a Blend <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {state.cardsShared < 3 && (
              <Link to="/share" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-display tracking-wider hover:bg-primary/20 transition-colors">
                Share a Card <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </motion.div>

        {/* Create Your Own CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 glass-surface rounded-2xl p-8 sm:p-10 border border-primary/20 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="inline-block mb-4"
            >
              <Beaker className="w-10 h-10 text-primary drop-shadow-[0_0_20px_hsl(185_80%_55%/0.5)]" />
            </motion.div>
            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground mb-3">
              Why Wear Someone Else's Story?
            </h3>
            <p className="text-sm text-muted-foreground font-body max-w-lg mx-auto mb-6 leading-relaxed">
              These compositions are just the beginning. Step into our Scent Lab and design a fragrance
              that is unmistakably, irreplaceably yours — from the first note to the final drop.
            </p>
            <Button asChild size="lg" className="glow-primary font-display tracking-wider text-sm">
              <Link to="/lab">
                Create Your Own <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Detail Modal — only for unlocked perfumes */}
      <AnimatePresence>
        {selectedPerfume && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-lg"
            onClick={() => setSelectedPerfume(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-surface rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{selectedPerfume.emoji}</span>
                <button onClick={() => setSelectedPerfume(null)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wide text-foreground mb-1">
                {selectedPerfume.name}
              </h2>
              <p className="text-sm text-accent font-body italic mb-4">{selectedPerfume.tagline}</p>

              <div className="glass-surface rounded-xl p-4 mb-4 border border-border">
                <p className="text-[10px] font-display tracking-widest text-accent mb-2">THE STORY</p>
                <p className="text-xs sm:text-sm font-body text-muted-foreground leading-relaxed italic">
                  "{selectedPerfume.story}"
                </p>
              </div>

              <div className="space-y-3 mb-4">
                {(["top", "heart", "base"] as const).map((layer) => {
                  const layerNotes = selectedPerfume.notes.filter((n) => n.layer === layer);
                  if (layerNotes.length === 0) return null;
                  return (
                    <div key={layer}>
                      <span className="text-[9px] font-display tracking-widest text-muted-foreground uppercase">{layer} notes</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {layerNotes.map((n) => (
                          <span key={n.name} className="text-xs glass-surface rounded-lg px-2.5 py-1 font-body text-foreground">
                            {n.emoji} {n.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="glass-surface rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-display tracking-wider text-muted-foreground">LONGEVITY</span>
                  </div>
                  <span className="text-xs font-display text-foreground">{selectedPerfume.longevity}</span>
                </div>
                <div className="glass-surface rounded-lg p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[9px] font-display tracking-wider text-muted-foreground">MOOD</span>
                  </div>
                  <span className="text-xs font-display text-foreground">{selectedPerfume.mood}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedPerfume.occasion.map((o) => (
                  <span key={o} className="text-[10px] font-display tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">{o}</span>
                ))}
                {selectedPerfume.season.map((s) => (
                  <span key={s} className="text-[10px] font-display tracking-wider bg-accent/10 text-accent px-2.5 py-1 rounded-full border border-accent/20">{s}</span>
                ))}
              </div>

              <div className="flex gap-3 mb-5">
                <div className="flex-1 glass-surface rounded-xl p-4 text-center">
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground block mb-1">50ML</span>
                  <span className="font-display text-lg text-primary">€{selectedPerfume.price["50ml"]}</span>
                </div>
                <div className="flex-1 glass-surface rounded-xl p-4 text-center border border-primary/30">
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground block mb-1">100ML</span>
                  <span className="font-display text-lg text-primary">€{selectedPerfume.price["100ml"]}</span>
                </div>
              </div>

              <Link to="/lab" className="block rounded-xl bg-primary/5 border border-primary/15 p-4 text-center group hover:border-primary/30 transition-all">
                <p className="text-xs font-display tracking-wider text-muted-foreground mb-1">
                  INSPIRED? CREATE SOMETHING ENTIRELY YOURS
                </p>
                <span className="text-sm font-display text-primary group-hover:tracking-widest transition-all inline-flex items-center gap-1.5">
                  Open the Scent Lab <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuestStat = ({ label, value, done }: { label: string; value: string; done: boolean }) => (
  <div className="glass-surface rounded-xl p-3 text-center border border-border/30">
    <div className={`font-display text-lg font-black ${done ? "text-primary" : "text-muted-foreground"}`}>
      {value}
    </div>
    <div className="text-[7px] font-display tracking-[0.25em] text-muted-foreground mt-1">{label}</div>
  </div>
);

export default CollectionPage;
