import { useRef } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  blendNumber: number;
  blendName: string;
  harmonyScore: number;
  noteEmojis: string[];
  concentration: string;
  className?: string;
}

const getRank = (score: number, blendCount?: number): { title: string; tier: string } => {
  if (score >= 95) return { title: "Grand Perfumer", tier: "LEGENDARY" };
  if (score >= 85) return { title: "Master Alchemist", tier: "MASTER" };
  if (score >= 70) return { title: "Scent Architect", tier: "EXPERT" };
  if (score >= 50) return { title: "Essence Weaver", tier: "ADEPT" };
  return { title: "Apprentice Nose", tier: "NOVICE" };
};

const ScentIdentityCard = ({ blendNumber, blendName, harmonyScore, noteEmojis, concentration, className = "" }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const rank = getRank(harmonyScore);
  const formattedNumber = String(blendNumber).padStart(4, "0");

  const shareCard = async () => {
    const text = `Blend No. ${formattedNumber}\nHarmony ${harmonyScore}%\nStatus: ${rank.title}\n\nCrafted at The Perfume Lab`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: `Blend No. ${formattedNumber}`, text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Identity card copied to clipboard");
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Card */}
      <div
        className="relative rounded-2xl border border-primary/20 p-6 sm:p-8"
        style={{
          background: "linear-gradient(145deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
          boxShadow: "0 0 60px hsl(var(--primary) / 0.08), inset 0 1px 0 hsl(var(--primary) / 0.1)",
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/30 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/30 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/30 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/30 rounded-br-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-display text-[9px] tracking-[0.4em] text-muted-foreground">
              THE PERFUME LAB
            </span>
          </div>
          <span className="font-display text-[9px] tracking-[0.3em] text-primary">
            {rank.tier}
          </span>
        </div>

        {/* Blend Number - hero element */}
        <div className="text-center mb-6">
          <div className="font-display text-[10px] tracking-[0.5em] text-muted-foreground mb-1">
            BLEND
          </div>
          <div className="font-display text-4xl sm:text-5xl font-black tracking-wider gradient-text">
            No. {formattedNumber}
          </div>
          {blendName && (
            <div className="font-body text-xs text-muted-foreground mt-2 italic">
              "{blendName}"
            </div>
          )}
        </div>

        {/* Notes display */}
        <div className="flex justify-center gap-2 mb-6">
          {noteEmojis.map((emoji, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="text-xl sm:text-2xl"
              style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center">
            <div className="font-display text-xl sm:text-2xl font-black text-primary">
              {harmonyScore}%
            </div>
            <div className="text-[8px] font-display tracking-widest text-muted-foreground mt-0.5">
              HARMONY
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-xl sm:text-2xl font-black text-accent">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
            </div>
            <div className="text-[8px] font-display tracking-widest text-muted-foreground mt-0.5">
              {rank.title.toUpperCase()}
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-xl sm:text-2xl font-black text-secondary">
              {noteEmojis.length}
            </div>
            <div className="text-[8px] font-display tracking-widest text-muted-foreground mt-0.5">
              NOTES
            </div>
          </div>
        </div>

        {/* Concentration */}
        <div className="text-center mb-6">
          <span className="glass-surface rounded-full px-4 py-1.5 text-[9px] font-display tracking-widest text-muted-foreground">
            {concentration.toUpperCase()}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-4" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-body text-muted-foreground/50">
            Each composition is unique
          </span>
          <button
            onClick={shareCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
          >
            <Share2 className="w-3 h-3" />
            <span className="text-[10px] font-display tracking-wider">SHARE</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ScentIdentityCard;
