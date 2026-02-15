import { motion } from "framer-motion";
import { ArrowLeft, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { personalities, moods } from "./giftingData";

interface Props {
  partnerName: string;
  partnerPersonality: string;
  partnerMood: string;
  onPartnerNameChange: (val: string) => void;
  onPartnerPersonalityChange: (val: string) => void;
  onPartnerMoodChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const DuoPartnerStep = ({
  partnerName, partnerPersonality, partnerMood,
  onPartnerNameChange, onPartnerPersonalityChange, onPartnerMoodChange,
  onNext, onBack,
}: Props) => {
  const canContinue = partnerPersonality && partnerMood;

  return (
    <motion.div key="duo-partner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>
      <div className="text-center mb-6">
        <Users className="w-8 h-8 text-secondary mx-auto mb-3" />
        <h2 className="font-display text-sm tracking-widest text-muted-foreground">YOUR PARTNER'S VIBE</h2>
        <p className="text-[11px] text-muted-foreground/70 font-body mt-1">
          The AI will harmonize both of your preferences into one unified scent
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-2">THEIR NAME (optional)</label>
          <Input
            value={partnerName}
            onChange={(e) => onPartnerNameChange(e.target.value.slice(0, 50))}
            placeholder="Your duo partner's name"
            className="bg-card/50 border-border/50 font-body text-sm"
          />
        </div>

        <div>
          <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-2">THEIR PERSONALITY</label>
          <div className="grid grid-cols-3 gap-2">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => onPartnerPersonalityChange(p.id)}
                className={`glass-surface rounded-lg p-2.5 text-center transition-all text-[11px] ${
                  partnerPersonality === p.id ? "border-secondary/50 bg-secondary/5" : "hover:border-secondary/20"
                }`}
              >
                <span className="block text-lg mb-1">{p.emoji}</span>
                <span className="font-display tracking-wider text-foreground">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-2">THEIR MOOD</label>
          <div className="grid grid-cols-3 gap-2">
            {moods.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => onPartnerMoodChange(m.id)}
                  className={`glass-surface rounded-lg p-2.5 text-center transition-all text-[11px] ${
                    partnerMood === m.id ? "border-secondary/50 bg-secondary/5" : "hover:border-secondary/20"
                  }`}
                >
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${partnerMood === m.id ? "text-secondary" : "text-muted-foreground"}`} />
                  <span className="font-display tracking-wider text-foreground">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {canContinue && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
          <button
            onClick={onNext}
            className="px-8 py-3 rounded-xl bg-secondary text-secondary-foreground font-display text-sm tracking-wider hover:brightness-110 transition-all glow-secondary"
          >
            Continue →
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DuoPartnerStep;
