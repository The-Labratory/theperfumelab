import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, BookOpen, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface GiftData {
  blend_name: string | null;
  blend_story: string | null;
  blend_notes: { name: string; emoji: string; layer: string; reason?: string }[];
  blend_mood: string | null;
  blend_intensity: string | null;
  scent_letter: string | null;
  personal_message: string | null;
  gifter_name: string | null;
  recipient_name: string | null;
  is_duo: boolean | null;
  revealed_at: string | null;
  reaction_emoji: string | null;
  reaction_message: string | null;
}

const GiftRevealPage = () => {
  const { shareCode } = useParams();
  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"unveil" | "reveal" | "react">("unveil");
  const [reactionEmoji, setReactionEmoji] = useState("");
  const [reactionMessage, setReactionMessage] = useState("");
  const [reactionSent, setReactionSent] = useState(false);

  useEffect(() => {
    if (!shareCode) return;
    const fetchGift = async () => {
      const { data, error } = await supabase
        .rpc("get_gift_by_share_code", { _share_code: shareCode });

      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        setLoading(false);
        return;
      }
      const giftData = Array.isArray(data) ? data[0] : data;
      setGift(giftData as unknown as GiftData);
      if (giftData.reaction_emoji) setReactionSent(true);
      setLoading(false);
    };
    fetchGift();
  }, [shareCode]);

  const handleReveal = async () => {
    setPhase("reveal");
    // Mark as revealed
    if (shareCode) {
      await supabase.from("gifts").update({ revealed_at: new Date().toISOString() }).eq("share_code", shareCode);
    }
  };

  const sendReaction = async () => {
    if (!reactionEmoji || !shareCode) return;
    const { error } = await supabase.from("gifts").update({
      reaction_emoji: reactionEmoji.slice(0, 10),
      reaction_message: reactionMessage.slice(0, 500) || null,
    }).eq("share_code", shareCode);

    if (error) {
      toast.error("Could not send reaction");
    } else {
      setReactionSent(true);
      toast.success("Your reaction has been sent!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!gift || !gift.blend_name) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center px-6">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Gift Not Found</h1>
          <p className="text-muted-foreground font-body text-sm">This gift link may have expired or doesn't exist.</p>
          <Link to="/gifting" className="text-primary font-display text-sm mt-4 inline-block hover:underline">
            Create your own →
          </Link>
        </div>
      </div>
    );
  }

  const notes = Array.isArray(gift.blend_notes) ? gift.blend_notes : [];
  const reactionEmojis = ["😍", "🥹", "💕", "🔥", "✨", "🌹", "😭", "🤩"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={15} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Phase 1: Unveil button */}
          {phase === "unveil" && (
            <motion.div key="unveil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-20">
              {gift.gifter_name && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-muted-foreground font-body text-sm mb-2">
                  A scent gift from <span className="text-foreground font-semibold">{gift.gifter_name}</span>
                </motion.p>
              )}
              {gift.recipient_name && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-foreground font-display text-lg mb-8">
                  For you, <span className="gradient-text">{gift.recipient_name}</span>
                </motion.p>
              )}

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: "spring", stiffness: 100 }}
              >
                <button
                  onClick={handleReveal}
                  className="relative w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/30 glow-primary mx-auto flex items-center justify-center group hover:scale-105 transition-transform"
                >
                  <Gift className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 rounded-full animate-ping bg-primary/5" />
                </button>
                <p className="font-display text-xs tracking-widest text-muted-foreground mt-6">TAP TO REVEAL</p>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 2: The reveal */}
          {phase === "reveal" && (
            <motion.div key="reveal" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              {/* Blend name entrance */}
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mb-8">
                <Gift className="w-8 h-8 text-accent mx-auto mb-3" />
                <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider gradient-text mb-1">
                  {gift.blend_name}
                </h1>
                <p className="text-xs font-display tracking-wider text-primary">
                  {gift.blend_mood} • {gift.blend_intensity} {gift.is_duo && "• DUO BLEND"}
                </p>
              </motion.div>

              {/* Story */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                className="glass-surface rounded-2xl p-6 mb-6 text-center border border-primary/10"
              >
                <p className="text-sm font-body text-muted-foreground leading-relaxed italic">
                  "{gift.blend_story}"
                </p>
              </motion.div>

              {/* Scent Letter */}
              {gift.scent_letter && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
                  className="glass-surface rounded-2xl p-6 mb-6 border border-accent/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-display text-[10px] tracking-widest text-accent">SCENT LETTER</span>
                  </div>
                  <p className="text-xs font-body text-muted-foreground leading-relaxed italic whitespace-pre-line">
                    {gift.scent_letter}
                  </p>
                </motion.div>
              )}

              {/* Notes reveal */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                className="glass-surface rounded-2xl p-6 mb-6 border border-border/50"
              >
                <div className="space-y-3">
                  {(["top", "heart", "base"] as const).map((layer, li) => {
                    const layerNotes = notes.filter((n) => n.layer === layer);
                    if (layerNotes.length === 0) return null;
                    return (
                      <motion.div key={layer} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 + li * 0.3 }}>
                        <span className="text-[9px] font-display tracking-widest text-muted-foreground uppercase">{layer}</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {layerNotes.map((n) => (
                            <span key={n.name} className="glass-surface rounded-lg px-3 py-1.5 text-xs font-body text-foreground">
                              {n.emoji} {n.name}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Personal message */}
              {gift.personal_message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.8 }}
                  className="glass-surface rounded-xl p-5 mb-6 text-center border border-secondary/10"
                >
                  <p className="text-[10px] font-display tracking-widest text-secondary mb-2">A WHISPERED MESSAGE</p>
                  <p className="text-sm font-body text-foreground italic">"{gift.personal_message}"</p>
                  {gift.gifter_name && <p className="text-xs text-muted-foreground mt-2 font-body">— {gift.gifter_name}</p>}
                </motion.div>
              )}

              {/* Reaction */}
              {!reactionSent ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.3 }}
                  className="glass-surface rounded-xl p-5 text-center border border-accent/10"
                >
                  <p className="text-[10px] font-display tracking-widest text-accent mb-3">HOW DOES THIS MAKE YOU FEEL?</p>
                  <div className="flex justify-center gap-2 mb-4">
                    {reactionEmojis.map((e) => (
                      <button key={e} onClick={() => setReactionEmoji(e)}
                        className={`text-2xl p-1.5 rounded-lg transition-all ${reactionEmoji === e ? "bg-accent/10 scale-125" : "hover:scale-110"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                  {reactionEmoji && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                      <Textarea
                        value={reactionMessage}
                        onChange={(e) => setReactionMessage(e.target.value.slice(0, 500))}
                        placeholder="Write a message back… (optional)"
                        className="bg-card/50 border-border/50 font-body text-sm min-h-[60px] resize-none"
                      />
                      <button onClick={sendReaction}
                        className="px-6 py-2.5 rounded-xl bg-accent text-accent-foreground font-display text-xs tracking-wider"
                      >
                        Send Reaction {reactionEmoji}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <p className="text-muted-foreground font-body text-sm">Your reaction has been shared ✨</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GiftRevealPage;
