import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { moods } from "./giftingData";

interface Props {
  mood: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}

const MoodStep = ({ mood, onSelect, onBack }: Props) => (
  <motion.div key="mood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
      <ArrowLeft className="w-3 h-3" /> Back
    </button>
    <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">THE MOOD</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {moods.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
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
  </motion.div>
);

export default MoodStep;
