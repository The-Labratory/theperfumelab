import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Star, Wind, Clock, Heart, Droplets } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import PerfumeFlacon from "@/components/PerfumeFlacon";
import CreationCheckout from "@/components/CreationCheckout";
import { availableNotes, concentrations, type Note, type Concentration } from "@/data/scentNotes";

interface SelectedNote extends Note {
  intensity: number;
  warmth: number;
}

const MAX_PER_LAYER = 3;
const MAX_TOTAL = 9;

const ScentLabPage = () => {
  const [selected, setSelected] = useState<SelectedNote[]>([]);
  const [activeLayer, setActiveLayer] = useState<"top" | "heart" | "base">("top");
  const [concentration, setConcentration] = useState<Concentration>(concentrations[0]);
  const [showCheckout, setShowCheckout] = useState(false);

  const layers = ["top", "heart", "base"] as const;
  const layerLabels = { top: "Top Notes", heart: "Heart Notes", base: "Base Notes" };
  const layerEmojis = { top: "✨", heart: "💎", base: "🌑" };

  const addNote = (note: Note) => {
    if (selected.find((s) => s.id === note.id)) return;
    if (selected.filter((s) => s.layer === note.layer).length >= MAX_PER_LAYER) return;
    setSelected([...selected, { ...note, intensity: 50, warmth: 50 }]);
  };

  const removeNote = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
  };

  const updateNote = (id: string, field: "intensity" | "warmth", value: number) => {
    setSelected(selected.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const harmonyScore = Math.min(100, Math.round(
    (selected.length / MAX_TOTAL) * 60 +
    (new Set(selected.map((s) => s.layer)).size / 3) * 40
  ));

  const noteColors = useMemo(() => selected.map((s) => s.color), [selected]);
  const fillPercent = selected.length / MAX_TOTAL;

  const notesForLayer = availableNotes.filter((n) => n.layer === activeLayer);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-10"
        >
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-wider gradient-text mb-1 sm:mb-2">
            PERFUMER LAB
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-body">
            Craft your signature fragrance
          </p>
        </motion.div>

        {/* Concentration selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 max-w-lg mx-auto"
        >
          {concentrations.map((c) => (
            <button
              key={c.id}
              onClick={() => setConcentration(c)}
              className={`flex-1 rounded-xl p-2.5 sm:p-3 text-center transition-all ${
                concentration.id === c.id
                  ? "bg-primary/10 border border-primary/40 shadow-[0_0_12px_hsl(185_80%_55%/0.15)]"
                  : "glass-surface hover:border-primary/20"
              }`}
            >
              <Droplets className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto mb-1 ${
                concentration.id === c.id ? "text-primary" : "text-muted-foreground"
              }`} />
              <span className="text-[10px] sm:text-xs font-display tracking-wide block text-foreground">{c.name}</span>
              <span className="text-[10px] text-primary font-display block">{c.percentage}</span>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-body block">{c.longevity}</span>
            </button>
          ))}
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px_1fr] gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Note Palette */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {layers.map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLayer(l)}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-display tracking-wide transition-all ${
                    activeLayer === l
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "glass-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="hidden sm:inline">{layerEmojis[l]} </span>{layerLabels[l]}
                </button>
              ))}
            </div>

            <ScrollArea className="h-[280px] sm:h-[360px] lg:h-[480px]">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 pr-3">
                {notesForLayer.map((note) => {
                  const isSelected = selected.find((s) => s.id === note.id);
                  return (
                    <motion.button
                      key={note.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => (isSelected ? removeNote(note.id) : addNote(note))}
                      className={`glass-surface rounded-lg sm:rounded-xl p-2 sm:p-3 text-center transition-all ${
                        isSelected
                          ? "border-primary/50 bg-primary/5"
                          : "hover:border-primary/20"
                      }`}
                    >
                      <span className="text-lg sm:text-xl block mb-0.5 sm:mb-1">{note.emoji}</span>
                      <span className="text-[9px] sm:text-[10px] font-body text-foreground leading-tight block">{note.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Central Flacon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center order-first lg:order-none"
          >
            <PerfumeFlacon
              fillPercent={fillPercent}
              noteColors={noteColors}
              className="w-40 h-52 sm:w-48 sm:h-64 lg:w-56 lg:h-72 mb-4 sm:mb-6"
            />

            {/* Note emojis orbiting the bottle */}
            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {selected.map((s) => (
                <motion.span
                  key={s.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="text-sm sm:text-base"
                  style={{ filter: `drop-shadow(0 0 4px ${s.color})` }}
                >
                  {s.emoji}
                </motion.span>
              ))}
            </div>

            {/* Stats */}
            <div className="glass-surface rounded-xl p-4 sm:p-5 w-full space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Star className="w-3 h-3" /> Harmony
                </span>
                <span className="font-display text-xs sm:text-sm text-primary">{harmonyScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> Concentration
                </span>
                <span className="font-display text-xs sm:text-sm text-accent">{concentration.percentage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Wind className="w-3 h-3" /> Projection
                </span>
                <span className="font-display text-xs sm:text-sm text-accent">
                  {selected.length > 3 ? "Strong" : selected.length > 1 ? "Moderate" : "Light"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Longevity
                </span>
                <span className="font-display text-xs sm:text-sm text-foreground">{concentration.longevity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Mood
                </span>
                <span className="font-display text-xs sm:text-sm text-secondary">
                  {selected.length === 0 ? "—" : selected.some(s => s.layer === "heart") ? "Romantic" : "Energetic"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Selected Notes Detail */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-display text-xs sm:text-sm tracking-wider text-muted-foreground mb-3 sm:mb-4">
              YOUR BLEND ({selected.length}/{MAX_TOTAL})
            </h3>

            {selected.length === 0 && (
              <div className="glass-surface rounded-xl p-6 sm:p-8 text-center">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-muted-foreground font-body">
                  Select notes to begin your creation
                </p>
              </div>
            )}

            <ScrollArea className={selected.length > 3 ? "h-[300px] sm:h-[380px]" : ""}>
              <AnimatePresence>
                {selected.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-surface rounded-xl p-3 sm:p-4 mb-2 sm:mb-3"
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-base">{note.emoji}</span>
                        <span className="text-xs sm:text-sm font-body text-foreground">{note.name}</span>
                        <span className="text-[8px] sm:text-[10px] font-display tracking-wider text-muted-foreground uppercase">
                          {note.layer}
                        </span>
                      </div>
                      <button
                        onClick={() => removeNote(note.id)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-body">Intensity</span>
                          <span className="text-[9px] sm:text-[10px] text-primary font-display">{note.intensity}%</span>
                        </div>
                        <Slider
                          value={[note.intensity]}
                          onValueChange={([v]) => updateNote(note.id, "intensity", v)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-body">Warmth</span>
                          <span className="text-[9px] sm:text-[10px] text-accent font-display">{note.warmth}%</span>
                        </div>
                        <Slider
                          value={[note.warmth]}
                          onValueChange={([v]) => updateNote(note.id, "warmth", v)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ScrollArea>

            {selected.length > 0 && !showCheckout && (
              <Button
                onClick={() => setShowCheckout(true)}
                className="w-full mt-3 sm:mt-4 glow-primary font-display tracking-wider text-xs sm:text-sm"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Finalize & Order
              </Button>
            )}

            <AnimatePresence>
              {showCheckout && selected.length > 0 && (
                <div className="mt-4">
                  <CreationCheckout
                    selected={selected}
                    concentration={concentration}
                    onClose={() => setShowCheckout(false)}
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScentLabPage;
