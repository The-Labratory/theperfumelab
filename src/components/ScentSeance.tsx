import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const SeanceResultSchema = z.object({
  spiritName: z.string(),
  prophecy: z.string(),
  spiritNotes: z.array(z.object({
    name: z.string(),
    emoji: z.string(),
    layer: z.string(),
    whisper: z.string(),
  })),
  element: z.string(),
  aura: z.string(),
  ritualAdvice: z.string(),
});

interface SeanceResult {
  spiritName: string;
  prophecy: string;
  spiritNotes: { name: string; emoji: string; layer: string; whisper: string }[];
  element: string;
  aura: string;
  ritualAdvice: string;
}

interface Props {
  worldName: string;
  worldType: string;
  worldEmoji: string;
}

const ritualQuestions = [
  "What emotion does this world awaken in you?",
  "If this world had a sound, what would it be?",
  "What memory does this world remind you of?",
];

const ScentSeance = ({ worldName, worldType, worldEmoji }: Props) => {
  const [phase, setPhase] = useState<"intro" | "questions" | "channeling" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [result, setResult] = useState<SeanceResult | null>(null);

  const updateAnswer = (val: string) => {
    setAnswers((prev) => prev.map((a, i) => (i === currentQ ? val.slice(0, 200) : a)));
  };

  const nextQuestion = () => {
    if (currentQ < 2) {
      setCurrentQ((c) => c + 1);
    } else {
      performSeance();
    }
  };

  const performSeance = async () => {
    setPhase("channeling");
    try {
      const { data, error } = await supabase.functions.invoke("perfumer-ai", {
        body: {
          notes: { worldName, worldType, answers },
          concentration: "",
          mode: "seance",
        },
      });
      if (error) throw error;

      const raw = JSON.parse(data.content);
      const parsed = SeanceResultSchema.parse(raw) as SeanceResult;
      setResult(parsed);
      setPhase("result");
    } catch (err) {
      console.error(err);
      toast.error("The spirits are silent. Try again later.");
      setPhase("intro");
    }
  };

  const reset = () => {
    setPhase("intro");
    setCurrentQ(0);
    setAnswers(["", "", ""]);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <Eye className="w-5 h-5 text-secondary" /> Scent Séance
      </h2>
      <p className="text-muted-foreground font-body text-sm">
        A one-time ritual. Answer three questions and the Oracle will channel a spirit fragrance that exists only for you — never to be generated again.
      </p>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
            <motion.div
              animate={{ boxShadow: ["0 0 20px hsl(265 60% 50% / 0.2)", "0 0 60px hsl(265 60% 50% / 0.4)", "0 0 20px hsl(265 60% 50% / 0.2)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-secondary/10 border border-secondary/20"
            >
              <span className="text-4xl">{worldEmoji}</span>
            </motion.div>
            <p className="font-display text-xs tracking-widest text-muted-foreground mb-6">
              THE ORACLE AWAITS IN {worldName.toUpperCase()}
            </p>
            <button
              onClick={() => setPhase("questions")}
              className="px-8 py-3 rounded-xl bg-secondary text-secondary-foreground font-display text-sm tracking-wider hover:brightness-110 transition-all glow-secondary"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" /> Begin the Séance
              </span>
            </button>
          </motion.div>
        )}

        {phase === "questions" && (
          <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-surface rounded-2xl p-6 border border-secondary/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-display tracking-widest text-muted-foreground">
                  RITUAL QUESTION {currentQ + 1} OF 3
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i <= currentQ ? "bg-secondary" : "bg-muted/50"}`} />
                  ))}
                </div>
              </div>

              <h3 className="font-display text-base font-semibold text-foreground mb-4">
                {ritualQuestions[currentQ]}
              </h3>

              <Textarea
                value={answers[currentQ]}
                onChange={(e) => updateAnswer(e.target.value)}
                placeholder="Close your eyes and answer from the heart…"
                className="bg-card/50 border-secondary/10 font-body text-sm min-h-[80px] resize-none focus:border-secondary/30"
              />
              <p className="text-[10px] text-muted-foreground font-body mt-1 text-right">{answers[currentQ].length}/200</p>

              <div className="mt-4 text-center">
                <button
                  onClick={nextQuestion}
                  disabled={!answers[currentQ].trim()}
                  className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-display text-xs tracking-wider hover:brightness-110 transition-all disabled:opacity-40"
                >
                  {currentQ < 2 ? "Next Question →" : "Channel the Spirit ✨"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "channeling" && (
          <motion.div key="channeling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full mx-auto mb-6 border-2 border-secondary/30 border-t-secondary flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-secondary" />
            </motion.div>
            <p className="font-display text-xs tracking-widest text-secondary animate-pulse">
              THE ORACLE IS CHANNELING YOUR SPIRIT FRAGRANCE…
            </p>
          </motion.div>
        )}

        {phase === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <div className="glass-surface rounded-2xl p-6 sm:p-8 text-center border border-secondary/20 mb-4"
              style={{ boxShadow: "0 0 60px hsl(var(--glow-secondary) / 0.15)" }}
            >
              <Eye className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground mb-1">
                {result.spiritName}
              </h3>
              <p className="text-xs font-display tracking-wider text-secondary mb-1">
                {result.element} • {result.aura}
              </p>
              <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-4">
                SPIRIT FRAGRANCE — ONE OF ONE
              </p>

              <p className="text-xs sm:text-sm font-body text-muted-foreground leading-relaxed italic mb-6">
                "{result.prophecy}"
              </p>

              <div className="space-y-2 text-left mb-4">
                {(["top", "heart", "base"] as const).map((layer) => {
                  const layerNotes = result.spiritNotes.filter((n) => n.layer === layer);
                  if (layerNotes.length === 0) return null;
                  return (
                    <div key={layer}>
                      <span className="text-[9px] font-display tracking-widest text-muted-foreground uppercase">{layer}</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {layerNotes.map((n) => (
                          <div key={n.name} className="glass-surface rounded-lg px-3 py-1.5 group relative">
                            <span className="text-xs font-body text-foreground">{n.emoji} {n.name}</span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-card border border-border text-[10px] text-muted-foreground font-body w-48 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                              {n.whisper}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="glass-surface rounded-lg p-3 mt-4">
                <p className="text-[10px] font-display tracking-widest text-accent mb-1">RITUAL ADVICE</p>
                <p className="text-xs font-body text-muted-foreground italic">{result.ritualAdvice}</p>
              </div>
            </div>

            <div className="text-center">
              <button onClick={reset} className="text-muted-foreground hover:text-foreground text-xs font-body">
                The spirits fade… begin a new séance
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScentSeance;
