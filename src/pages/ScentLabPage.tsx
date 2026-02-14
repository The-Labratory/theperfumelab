import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sparkles, Star, Wind, Clock, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import GlowOrb from "@/components/GlowOrb";

interface Note {
  id: string;
  name: string;
  emoji: string;
  layer: "top" | "heart" | "base";
  color: string;
}

const availableNotes: Note[] = [
  // Top
  { id: "bergamot", name: "Bergamot", emoji: "🍊", layer: "top", color: "hsl(35 90% 55%)" },
  { id: "lemon", name: "Lemon Zest", emoji: "🍋", layer: "top", color: "hsl(50 90% 55%)" },
  { id: "pink-pepper", name: "Pink Pepper", emoji: "🌶️", layer: "top", color: "hsl(350 70% 55%)" },
  { id: "grapefruit", name: "Grapefruit", emoji: "🍈", layer: "top", color: "hsl(15 80% 55%)" },
  // Heart
  { id: "rose", name: "Rose", emoji: "🌹", layer: "heart", color: "hsl(340 70% 55%)" },
  { id: "jasmine", name: "Jasmine", emoji: "🌼", layer: "heart", color: "hsl(45 80% 70%)" },
  { id: "iris", name: "Iris", emoji: "💜", layer: "heart", color: "hsl(265 60% 55%)" },
  { id: "lavender", name: "Lavender", emoji: "💐", layer: "heart", color: "hsl(265 40% 60%)" },
  // Base
  { id: "vanilla", name: "Vanilla", emoji: "🍦", layer: "base", color: "hsl(35 70% 65%)" },
  { id: "sandalwood", name: "Sandalwood", emoji: "🪵", layer: "base", color: "hsl(25 50% 40%)" },
  { id: "musk", name: "White Musk", emoji: "🤍", layer: "base", color: "hsl(0 0% 80%)" },
  { id: "amber", name: "Amber", emoji: "🔶", layer: "base", color: "hsl(35 90% 45%)" },
];

interface SelectedNote extends Note {
  intensity: number;
  warmth: number;
}

const ScentLabPage = () => {
  const [selected, setSelected] = useState<SelectedNote[]>([]);
  const [activeLayer, setActiveLayer] = useState<"top" | "heart" | "base">("top");

  const layers = ["top", "heart", "base"] as const;
  const layerLabels = { top: "Top Notes", heart: "Heart Notes", base: "Base Notes" };
  const layerEmojis = { top: "✨", heart: "💎", base: "🌑" };

  const addNote = (note: Note) => {
    if (selected.find((s) => s.id === note.id)) return;
    if (selected.filter((s) => s.layer === note.layer).length >= 2) return;
    setSelected([...selected, { ...note, intensity: 50, warmth: 50 }]);
  };

  const removeNote = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
  };

  const updateNote = (id: string, field: "intensity" | "warmth", value: number) => {
    setSelected(selected.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const harmonyScore = Math.min(100, Math.round(
    (selected.length / 6) * 60 +
    (new Set(selected.map((s) => s.layer)).size / 3) * 40
  ));

  const notesForLayer = availableNotes.filter((n) => n.layer === activeLayer);
  const selectedForLayer = selected.filter((s) => s.layer === activeLayer);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-24 pb-16 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-wider gradient-text mb-2">
            SCENT LAB
          </h1>
          <p className="text-muted-foreground font-body">
            Craft your signature fragrance. Drag notes into your blend.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_300px_1fr] gap-8 items-start">
          {/* Note Palette */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Layer tabs */}
            <div className="flex gap-2 mb-6">
              {layers.map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLayer(l)}
                  className={`flex-1 py-2 rounded-lg text-sm font-display tracking-wide transition-all ${
                    activeLayer === l
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "glass-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {layerEmojis[l]} {layerLabels[l]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {notesForLayer.map((note) => {
                const isSelected = selected.find((s) => s.id === note.id);
                return (
                  <motion.button
                    key={note.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => (isSelected ? removeNote(note.id) : addNote(note))}
                    className={`glass-surface rounded-xl p-4 text-center transition-all ${
                      isSelected
                        ? "border-primary/50 bg-primary/5"
                        : "hover:border-primary/20"
                    }`}
                  >
                    <span className="text-2xl block mb-1">{note.emoji}</span>
                    <span className="text-xs font-body text-foreground">{note.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Central Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-48 h-48 md:w-64 md:h-64 mb-6">
              <GlowOrb className="w-full h-full" />
              {/* Note indicators orbiting */}
              {selected.map((s, i) => {
                const angle = (i / Math.max(selected.length, 1)) * 360;
                const radius = 45;
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: Math.cos((angle * Math.PI) / 180) * radius,
                      y: Math.sin((angle * Math.PI) / 180) * radius,
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl"
                    style={{ filter: `drop-shadow(0 0 6px ${s.color})` }}
                  >
                    {s.emoji}
                  </motion.div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="glass-surface rounded-xl p-5 w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Star className="w-3 h-3" /> Harmony
                </span>
                <span className="font-display text-sm text-primary">{harmonyScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Wind className="w-3 h-3" /> Projection
                </span>
                <span className="font-display text-sm text-accent">
                  {selected.length > 3 ? "Strong" : selected.length > 1 ? "Moderate" : "Light"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Longevity
                </span>
                <span className="font-display text-sm text-foreground">
                  {selected.filter((s) => s.layer === "base").length > 0 ? "6-8 hrs" : "2-4 hrs"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  <Heart className="w-3 h-3" /> Mood
                </span>
                <span className="font-display text-sm text-secondary">
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
            <h3 className="font-display text-sm tracking-wider text-muted-foreground mb-4">
              YOUR BLEND ({selected.length}/6)
            </h3>

            {selected.length === 0 && (
              <div className="glass-surface rounded-xl p-8 text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">
                  Select notes from the left to begin your creation
                </p>
              </div>
            )}

            <AnimatePresence>
              {selected.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-surface rounded-xl p-4 mb-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span>{note.emoji}</span>
                      <span className="text-sm font-body text-foreground">{note.name}</span>
                      <span className="text-[10px] font-display tracking-wider text-muted-foreground uppercase">
                        {note.layer}
                      </span>
                    </div>
                    <button
                      onClick={() => removeNote(note.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-muted-foreground font-body">Intensity</span>
                        <span className="text-[10px] text-primary font-display">{note.intensity}%</span>
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
                        <span className="text-[10px] text-muted-foreground font-body">Warmth</span>
                        <span className="text-[10px] text-accent font-display">{note.warmth}%</span>
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

            {selected.length > 0 && (
              <Button className="w-full mt-4 glow-primary font-display tracking-wider text-sm" size="lg">
                <Sparkles className="w-4 h-4 mr-2" /> Save Creation
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ScentLabPage;
