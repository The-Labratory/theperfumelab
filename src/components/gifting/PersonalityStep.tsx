import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { personalities } from "./giftingData";

interface Props {
  personality: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  label?: string;
}

const PersonalityStep = ({ personality, onSelect, onBack, label = "THEIR PERSONALITY" }: Props) => (
  <motion.div key="personality" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
      <ArrowLeft className="w-3 h-3" /> Back
    </button>
    <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">{label}</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {personalities.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
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
);

export default PersonalityStep;
