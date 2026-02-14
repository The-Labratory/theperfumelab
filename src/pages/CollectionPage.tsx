import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Clock, Flame, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { perfumeCollections, type PerfumeCollection } from "@/data/collectionsData";

const intensityBars: Record<string, number> = { Light: 1, Moderate: 2, Bold: 3, Intense: 4 };

const CollectionPage = () => {
  const [selectedPerfume, setSelectedPerfume] = useState<PerfumeCollection | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-wider gradient-text mb-3">
            THE COLLECTION
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-lg max-w-xl mx-auto">
            Curated signatures crafted by master perfumers. Each one a world, a story, a piece of identity.
          </p>
        </motion.div>

        {/* Featured */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {perfumeCollections.map((perfume, i) => (
            <motion.div
              key={perfume.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelectedPerfume(perfume)}
              className="group glass-surface rounded-2xl p-5 sm:p-6 cursor-pointer hover:border-primary/30 transition-all relative overflow-hidden"
            >
              {perfume.featured && (
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] font-display tracking-widest bg-accent/10 text-accent px-2 py-1 rounded-full border border-accent/30">
                    FEATURED
                  </span>
                </div>
              )}

              <div className="text-4xl mb-3">{perfume.emoji}</div>
              <h3 className="font-display text-base sm:text-lg font-bold tracking-wide text-foreground mb-1">
                {perfume.name}
              </h3>
              <p className="text-xs text-muted-foreground font-body italic mb-3">{perfume.tagline}</p>
              <p className="text-xs text-muted-foreground font-body line-clamp-2 mb-4">{perfume.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-display tracking-wider text-muted-foreground">{perfume.family}</span>
                <span className="font-display text-sm text-primary">€{perfume.price["50ml"]}</span>
              </div>

              {/* Intensity bars */}
              <div className="flex items-center gap-1 mt-3">
                <Flame className="w-3 h-3 text-muted-foreground" />
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      level <= intensityBars[perfume.intensity]
                        ? "bg-primary"
                        : "bg-muted/50"
                    }`}
                  />
                ))}
                <span className="text-[9px] text-muted-foreground font-body ml-1">{perfume.intensity}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
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

              {/* Story */}
              <div className="glass-surface rounded-xl p-4 mb-4 border border-border">
                <p className="text-[10px] font-display tracking-widest text-accent mb-2">THE STORY</p>
                <p className="text-xs sm:text-sm font-body text-muted-foreground leading-relaxed italic">
                  "{selectedPerfume.story}"
                </p>
              </div>

              {/* Notes pyramid */}
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

              {/* Meta */}
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

              {/* Occasions */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {selectedPerfume.occasion.map((o) => (
                  <span key={o} className="text-[10px] font-display tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                    {o}
                  </span>
                ))}
                {selectedPerfume.season.map((s) => (
                  <span key={s} className="text-[10px] font-display tracking-wider bg-accent/10 text-accent px-2.5 py-1 rounded-full border border-accent/20">
                    {s}
                  </span>
                ))}
              </div>

              {/* Pricing */}
              <div className="flex gap-3">
                <div className="flex-1 glass-surface rounded-xl p-4 text-center">
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground block mb-1">50ML</span>
                  <span className="font-display text-lg text-primary">€{selectedPerfume.price["50ml"]}</span>
                </div>
                <div className="flex-1 glass-surface rounded-xl p-4 text-center border border-primary/30">
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground block mb-1">100ML</span>
                  <span className="font-display text-lg text-primary">€{selectedPerfume.price["100ml"]}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectionPage;
