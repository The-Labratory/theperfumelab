import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodiacSigns } from "./giftingData";

interface Props {
  gifterName: string;
  recipientName: string;
  personalMessage: string;
  zodiac: string;
  relationshipDepth: string;
  onGifterNameChange: (val: string) => void;
  onRecipientNameChange: (val: string) => void;
  onPersonalMessageChange: (val: string) => void;
  onZodiacChange: (val: string) => void;
  onRelationshipDepthChange: (val: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onBack: () => void;
  isDuo: boolean;
}

const relationships = [
  { id: "acquaintance", label: "Acquaintance", emoji: "🤝" },
  { id: "friend", label: "Friend", emoji: "😊" },
  { id: "close-friend", label: "Close Friend", emoji: "💛" },
  { id: "soulmate", label: "Soulmate", emoji: "💕" },
  { id: "family", label: "Family", emoji: "🏠" },
  { id: "partner", label: "Partner", emoji: "❤️‍🔥" },
];

const DetailsStep = ({
  gifterName, recipientName, personalMessage, zodiac, relationshipDepth,
  onGifterNameChange, onRecipientNameChange, onPersonalMessageChange,
  onZodiacChange, onRelationshipDepthChange, onGenerate, isGenerating, onBack, isDuo,
}: Props) => (
  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xs font-body flex items-center gap-1 mb-4">
      <ArrowLeft className="w-3 h-3" /> Back
    </button>
    <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">FINAL TOUCHES</h2>

    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-1.5">YOUR NAME</label>
          <Input value={gifterName} onChange={(e) => onGifterNameChange(e.target.value.slice(0, 50))} placeholder="From…" className="bg-card/50 border-border/50 font-body text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-1.5">{isDuo ? "PARTNER NAME" : "RECIPIENT NAME"}</label>
          <Input value={recipientName} onChange={(e) => onRecipientNameChange(e.target.value.slice(0, 50))} placeholder="To…" className="bg-card/50 border-border/50 font-body text-sm" />
        </div>
      </div>

      {/* Relationship depth */}
      <div>
        <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-2">YOUR BOND</label>
        <div className="grid grid-cols-3 gap-2">
          {relationships.map((r) => (
            <button
              key={r.id}
              onClick={() => onRelationshipDepthChange(r.id)}
              className={`glass-surface rounded-lg px-2 py-2 text-center transition-all ${
                relationshipDepth === r.id ? "border-primary/50 bg-primary/5" : "hover:border-primary/20"
              }`}
            >
              <span className="text-sm block">{r.emoji}</span>
              <span className="font-display text-[10px] tracking-wider text-foreground">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zodiac */}
      <div>
        <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-2">
          <Star className="w-3 h-3 inline mr-1" />THEIR ZODIAC (optional)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {zodiacSigns.map((z) => (
            <button
              key={z.id}
              onClick={() => onZodiacChange(zodiac === z.id ? "" : z.id)}
              className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-body ${
                zodiac === z.id
                  ? "bg-accent/10 border border-accent/30 text-accent"
                  : "glass-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {z.emoji} {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Personal message */}
      <div>
        <label className="text-[10px] font-display tracking-widest text-muted-foreground block mb-1.5">WHISPERED MESSAGE (optional)</label>
        <Textarea
          value={personalMessage}
          onChange={(e) => onPersonalMessageChange(e.target.value.slice(0, 500))}
          placeholder="Write a personal note that will be revealed with the scent…"
          className="bg-card/50 border-border/50 font-body text-sm min-h-[80px] resize-none"
        />
      </div>
    </div>

    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider hover:brightness-110 transition-all glow-primary disabled:opacity-50"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isDuo ? "Harmonizing two souls…" : "Weaving the scent story…"}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {isDuo ? "Create Duo Blend" : "Generate Gift Blend"}
          </span>
        )}
      </button>
    </motion.div>
  </motion.div>
);

export default DetailsStep;
