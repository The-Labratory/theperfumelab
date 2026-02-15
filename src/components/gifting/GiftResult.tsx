import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, ArrowLeft, Share2, Copy, Check, BookOpen } from "lucide-react";
import { personalities, occasions, moods, type GiftBlend } from "./giftingData";
import { toast } from "sonner";

interface Props {
  result: GiftBlend;
  personality: string;
  occasion: string;
  mood: string;
  shareCode: string;
  isDuo: boolean;
  onReset: () => void;
}

const GiftResult = ({ result, personality, occasion, mood, shareCode, isDuo, onReset }: Props) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = shareCode ? `${window.location.origin}/gift/${shareCode}` : "";

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Gift link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <button onClick={onReset} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
        <ArrowLeft className="w-3 h-3" /> Create another
      </button>

      <div
        className="glass-surface rounded-2xl p-6 sm:p-8 text-center border border-primary/20 mb-6"
        style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.1)" }}
      >
        <Gift className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground mb-1">
          {result.blendName}
        </h2>
        <p className="text-xs font-display tracking-wider text-primary mb-4">
          {result.mood} • {result.intensity} {isDuo && "• DUO"}
        </p>
        <p className="text-xs sm:text-sm font-body text-muted-foreground leading-relaxed italic mb-6">
          "{result.story}"
        </p>

        {/* Scent Letter */}
        {result.scentLetter && (
          <div className="mb-6 p-4 rounded-xl bg-accent/5 border border-accent/10 text-left">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="font-display text-[10px] tracking-widest text-accent">SCENT LETTER</span>
            </div>
            <p className="text-xs font-body text-muted-foreground leading-relaxed italic whitespace-pre-line">
              {result.scentLetter}
            </p>
          </div>
        )}

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

      {/* Share */}
      {shareCode && (
        <div className="glass-surface rounded-xl p-4 text-center mb-4">
          <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-3">
            <Share2 className="w-3 h-3 inline mr-1" /> SHARE THIS GIFT
          </p>
          <div className="flex items-center gap-2 max-w-md mx-auto">
            <div className="flex-1 bg-card/50 rounded-lg px-3 py-2 text-xs font-body text-muted-foreground truncate border border-border/50">
              {shareUrl}
            </div>
            <button onClick={copyLink} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-xs tracking-wider flex items-center gap-1.5">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="glass-surface rounded-xl p-4 text-center">
        <p className="text-[10px] font-display tracking-widest text-muted-foreground mb-2">CREATED FOR</p>
        <div className="flex justify-center gap-3 flex-wrap">
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
  );
};

export default GiftResult;
