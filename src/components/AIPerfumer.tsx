import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Note } from "@/data/scentNotes";

interface SelectedNote extends Note {
  intensity: number;
  warmth: number;
}

interface AIPerfumerProps {
  notes: SelectedNote[];
  concentration: string;
}

const AIPerfumer = ({ notes, concentration }: AIPerfumerProps) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getAdvice = useCallback(async () => {
    if (notes.length < 2) {
      toast.info("Add at least 2 notes for AI analysis");
      return;
    }
    setIsLoading(true);
    setIsOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke("perfumer-ai", {
        body: {
          notes: notes.map((n) => ({
            name: n.name,
            layer: n.layer,
            intensity: n.intensity,
            warmth: n.warmth,
          })),
          concentration,
          mode: "analyze",
        },
      });
      if (error) throw error;
      setAdvice(data.content);
    } catch (err) {
      console.error(err);
      toast.error("AI Perfumer is temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  }, [notes, concentration]);

  return (
    <div className="mt-3">
      {!isOpen ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={getAdvice}
          disabled={notes.length < 2}
          className="w-full glass-surface rounded-xl p-3 sm:p-4 flex items-center gap-3 hover:border-secondary/30 transition-all disabled:opacity-40"
        >
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-left flex-1">
            <p className="text-xs font-display tracking-wider text-foreground">Master Perfumer AI</p>
            <p className="text-[10px] text-muted-foreground font-body">
              {notes.length < 2 ? "Add 2+ notes for analysis" : "Tap for expert blend advice"}
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-secondary/50" />
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-surface rounded-xl p-4 sm:p-5 border border-secondary/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-secondary" />
                <span className="font-display text-[10px] sm:text-xs tracking-widest text-secondary">MASTER PERFUMER</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={getAdvice}
                  disabled={isLoading}
                  className="text-[10px] font-display tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  Refresh
                </button>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-0.5">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-secondary" />
                <span className="text-xs text-muted-foreground font-body italic">Analyzing your composition…</span>
              </div>
            ) : (
              <p className="text-xs sm:text-sm font-body text-muted-foreground leading-relaxed">
                {advice}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default AIPerfumer;
