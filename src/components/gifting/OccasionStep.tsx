import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { occasions } from "./giftingData";

interface Props {
  occasion: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}

const OccasionStep = ({ occasion, onSelect, onBack }: Props) => (
  <motion.div key="occasion" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
      <ArrowLeft className="w-3 h-3" /> Back
    </button>
    <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">THE OCCASION</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {occasions.map((o) => (
        <button
          key={o.id}
          onClick={() => onSelect(o.id)}
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
);

export default OccasionStep;
