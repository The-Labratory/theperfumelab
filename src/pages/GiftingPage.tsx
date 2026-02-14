import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Heart, Sparkles, Sun, Moon, Zap, Coffee, Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const personalities = [
  { id: "romantic", label: "Romantic", emoji: "💕", desc: "Dreamy, sensual, soft" },
  { id: "bold", label: "Bold", emoji: "🔥", desc: "Confident, intense, powerful" },
  { id: "elegant", label: "Elegant", emoji: "👑", desc: "Refined, classic, polished" },
  { id: "adventurous", label: "Adventurous", emoji: "🌍", desc: "Free-spirited, fresh, natural" },
  { id: "mysterious", label: "Mysterious", emoji: "🌙", desc: "Dark, deep, enigmatic" },
  { id: "playful", label: "Playful", emoji: "✨", desc: "Light, fun, sweet" },
];

const occasions = [
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "valentine", label: "Valentine's", emoji: "❤️" },
  { id: "wedding", label: "Wedding", emoji: "💒" },
  { id: "corporate", label: "Corporate Gift", emoji: "💼" },
  { id: "thank-you", label: "Thank You", emoji: "🙏" },
  { id: "just-because", label: "Just Because", emoji: "🎁" },
];

const moods = [
  { id: "warm", label: "Warm & Cozy", icon: Coffee },
  { id: "fresh", label: "Fresh & Bright", icon: Sun },
  { id: "seductive", label: "Seductive", icon: Moon },
  { id: "energizing", label: "Energizing", icon: Zap },
  { id: "calming", label: "Calming", icon: Heart },
  { id: "luxurious", label: "Luxurious", icon: Sparkles },
];

interface GiftBlend {
  blendName: string;
  story: string;
  notes: { name: string; emoji: string; layer: string; reason: string }[];
  mood: string;
  intensity: string;
}

const GiftingPage = () => {
  const [step, setStep] = useState(1);
  const [personality, setPersonality] = useState("");
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GiftBlend | null>(null);

  const canGenerate = personality && occasion && mood;

  const generateBlend = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("perfumer-ai", {
        body: {
          notes: { personality, occasion, mood },
          concentration: "Eau de Parfum",
          mode: "gift",
        },
      });
      if (error) throw error;

      try {
        const parsed = JSON.parse(data.content);
        setResult(parsed);
        setStep(4);
      } catch {
        // AI returned non-JSON, try to extract
        toast.error("Could not generate blend. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI Perfumer is temporarily unavailable");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-wider gradient-text mb-2">
            GIFTING MODE
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base">
            Create the perfect fragrance for someone special
          </p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs transition-all ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "glass-surface text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 rounded-full transition-all ${step > s ? "bg-primary" : "bg-muted/50"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personality */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">
                THEIR PERSONALITY
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {personalities.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPersonality(p.id); setStep(2); }}
                    className={`glass-surface rounded-xl p-4 text-center transition-all hover:border-primary/30 ${
                      personality === p.id ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-2xl block mb-2">{p.emoji}</span>
                    <span className="font-display text-xs tracking-wider text-foreground block">{p.label}</span>
                    <span className="text-[10px] text-muted-foreground font-body block mt-1">{p.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Occasion */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">
                THE OCCASION
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {occasions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => { setOccasion(o.id); setStep(3); }}
                    className={`glass-surface rounded-xl p-4 text-center transition-all hover:border-primary/30 ${
                      occasion === o.id ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-2xl block mb-2">{o.emoji}</span>
                    <span className="font-display text-xs tracking-wider text-foreground block">{o.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Mood */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">
                THE MOOD
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {moods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { setMood(m.id); }}
                      className={`glass-surface rounded-xl p-4 text-center transition-all hover:border-primary/30 ${
                        mood === m.id ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${mood === m.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-display text-xs tracking-wider text-foreground block">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {mood && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
                  <button
                    onClick={generateBlend}
                    disabled={isGenerating}
                    className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider hover:brightness-110 transition-all glow-primary disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Creating their perfect scent…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Generate Gift Blend
                      </span>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 4: Result */}
          {step === 4 && result && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <button onClick={() => { setStep(1); setResult(null); }} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
                <ArrowLeft className="w-3 h-3" /> Create another
              </button>

              <div className="glass-surface rounded-2xl p-6 sm:p-8 text-center border border-primary/20 mb-6"
                style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.1)" }}
              >
                <Gift className="w-8 h-8 text-accent mx-auto mb-3" />
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground mb-1">
                  {result.blendName}
                </h2>
                <p className="text-xs font-display tracking-wider text-primary mb-4">{result.mood} • {result.intensity}</p>
                <p className="text-xs sm:text-sm font-body text-muted-foreground leading-relaxed italic mb-6">
                  "{result.story}"
                </p>

                {/* Notes */}
                <div className="space-y-2 text-left">
                  {(["top", "heart", "base"] as const).map((layer) => {
                    const layerNotes = result.notes.filter((n) => n.layer === layer);
                    if (layerNotes.length === 0) return null;
                    return (
                      <div key={layer}>
                        <span className="text-[9px] font-display tracking-widest text-muted-foreground uppercase">{layer}</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {layerNotes.map((n) => (
                            <div key={n.name} className="glass-surface rounded-lg px-3 py-1.5 group relative">
                              <span className="text-xs font-body text-foreground">{n.emoji} {n.name}</span>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-card border border-border text-[10px] text-muted-foreground font-body w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                                {n.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="glass-surface rounded-xl p-4 text-center">
                <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">CREATED FOR</p>
                <div className="flex justify-center gap-3">
                  <span className="text-xs font-body text-foreground capitalize">
                    {personalities.find((p) => p.id === personality)?.emoji} {personality}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs font-body text-foreground capitalize">
                    {occasions.find((o) => o.id === occasion)?.emoji} {occasion}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs font-body text-foreground capitalize">
                    {moods.find((m) => m.id === mood)?.label}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GiftingPage;
