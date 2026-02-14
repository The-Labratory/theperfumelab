import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, Share2, Sparkles, Zap, Wind, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { availableNotes } from "@/data/scentNotes";
import { analyzeBlendDNA, scentArchetypes } from "@/data/scentDNA";

const ScentDNAPage = () => {
  // For demo purposes — user selects notes to analyze
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const analysis = useMemo(
    () => (selectedNoteIds.length >= 3 ? analyzeBlendDNA(selectedNoteIds) : null),
    [selectedNoteIds]
  );

  const toggleNote = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : prev.length < 12 ? [...prev, id] : prev
    );
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Dna className="w-8 h-8 sm:w-10 sm:h-10 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-wider gradient-text mb-3">
            YOUR SCENT DNA
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base max-w-lg mx-auto">
            Select the notes you're drawn to. We'll decode your olfactive identity.
          </p>
        </motion.div>

        {/* Note selection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="font-display text-xs tracking-widest text-muted-foreground mb-4 text-center">
            CHOOSE 3–12 NOTES THAT CALL TO YOU ({selectedNoteIds.length}/12)
          </p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {availableNotes.slice(0, 48).map((note) => {
              const isSelected = selectedNoteIds.includes(note.id);
              return (
                <button
                  key={note.id}
                  onClick={() => toggleNote(note.id)}
                  className={`rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-body transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary/40 text-primary"
                      : "glass-surface text-muted-foreground hover:text-foreground hover:border-primary/20"
                  }`}
                >
                  {note.emoji} {note.name}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Analyze button */}
        {selectedNoteIds.length >= 3 && !showResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
            <button
              onClick={() => setShowResult(true)}
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider hover:brightness-110 transition-all glow-primary"
            >
              <Sparkles className="w-4 h-4 inline mr-2" /> Decode My Scent DNA
            </button>
          </motion.div>
        )}

        {/* DNA Result */}
        <AnimatePresence>
          {showResult && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="space-y-6"
            >
              {/* Archetype Card */}
              <div
                className="glass-surface rounded-2xl p-6 sm:p-8 text-center border border-border relative overflow-hidden"
                style={{ boxShadow: `0 0 60px ${analysis.archetype.color.replace(")", " / 0.15)")}` }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-5xl sm:text-6xl mb-4"
                >
                  {analysis.archetype.emoji}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-[10px] tracking-[0.3em] text-muted-foreground mb-2"
                >
                  YOU ARE
                </motion.p>
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
                  {analysis.archetype.name}
                </h2>
                <p className="text-sm font-body text-muted-foreground italic max-w-md mx-auto mb-6">
                  "{analysis.archetype.tagline}"
                </p>

                {/* Traits */}
                <div className="flex justify-center gap-2 mb-6">
                  {analysis.archetype.traits.map((trait) => (
                    <span
                      key={trait}
                      className="text-xs font-display tracking-wider px-3 py-1.5 rounded-full border"
                      style={{
                        borderColor: analysis.archetype.color.replace(")", " / 0.4)"),
                        color: analysis.archetype.color,
                        background: analysis.archetype.color.replace(")", " / 0.1)"),
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Occasions */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {analysis.archetype.occasions.map((occ) => (
                    <span key={occ} className="text-[10px] font-display tracking-wider text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                      {occ}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-surface rounded-xl p-5 text-center">
                  <Zap className="w-5 h-5 text-accent mx-auto mb-2" />
                  <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">INTENSITY</p>
                  <p className="font-display text-sm text-foreground">{analysis.intensityPreference}</p>
                </div>
                <div className="glass-surface rounded-xl p-5 text-center">
                  <Wind className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">PROJECTION</p>
                  <p className="font-display text-sm text-foreground">{analysis.projectionStyle}</p>
                </div>
                <div className="glass-surface rounded-xl p-5 text-center">
                  <Heart className="w-5 h-5 text-secondary mx-auto mb-2" />
                  <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-1">DOMINANT FAMILY</p>
                  <p className="font-display text-sm text-foreground capitalize">{analysis.dominantFamilies[0]?.family}</p>
                </div>
              </div>

              {/* Family breakdown */}
              <div className="glass-surface rounded-xl p-5 sm:p-6">
                <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-4">OLFACTIVE SPECTRUM</p>
                <div className="space-y-3">
                  {analysis.dominantFamilies.map((f) => (
                    <div key={f.family}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-body text-foreground capitalize">{f.family}</span>
                        <span className="text-xs font-display text-primary">{f.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${f.percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="text-center">
                <button className="px-6 py-3 rounded-xl glass-surface font-display text-xs tracking-wider text-muted-foreground hover:text-foreground transition-all">
                  <Share2 className="w-4 h-4 inline mr-2" /> Share Your Scent DNA
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ScentDNAPage;
