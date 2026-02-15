import { motion } from "framer-motion";
import { ArrowLeft, BookHeart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  memory: string;
  onMemoryChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const memoryPrompts = [
  "The first time we met, the air smelled like…",
  "Our favorite place together always reminds me of…",
  "If I could bottle one moment with them, it would be…",
  "The scent that always brings them to mind is…",
];

const MemoryStep = ({ memory, onMemoryChange, onNext, onBack }: Props) => (
  <motion.div key="memory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
      <ArrowLeft className="w-3 h-3" /> Back
    </button>
    <div className="text-center mb-6">
      <BookHeart className="w-8 h-8 text-accent mx-auto mb-3" />
      <h2 className="font-display text-sm tracking-widest text-muted-foreground">
        A SHARED MEMORY
      </h2>
      <p className="text-[11px] text-muted-foreground/70 font-body mt-2 max-w-sm mx-auto">
        The AI will weave this memory into the scent story and choose notes that evoke it. This is optional but makes the gift deeply personal.
      </p>
    </div>

    <div className="space-y-3 mb-4">
      <p className="text-[10px] font-display tracking-widest text-muted-foreground">INSPIRATION</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {memoryPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onMemoryChange(prompt)}
            className="text-left glass-surface rounded-lg px-3 py-2 text-[11px] font-body text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>

    <Textarea
      value={memory}
      onChange={(e) => onMemoryChange(e.target.value.slice(0, 500))}
      placeholder="Describe a memory you share with this person… the AI will translate it into fragrance notes."
      className="bg-card/50 border-border/50 font-body text-sm min-h-[100px] resize-none focus:border-primary/30"
    />
    <p className="text-[10px] text-muted-foreground font-body mt-1 text-right">{memory.length}/500</p>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex gap-3 justify-center">
      <button
        onClick={onNext}
        className="px-6 py-3 rounded-xl glass-surface text-muted-foreground font-display text-xs tracking-wider hover:text-foreground transition-all"
      >
        Skip
      </button>
      <button
        onClick={onNext}
        disabled={!memory.trim()}
        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display text-xs tracking-wider hover:brightness-110 transition-all disabled:opacity-40"
      >
        Continue →
      </button>
    </motion.div>
  </motion.div>
);

export default MemoryStep;
