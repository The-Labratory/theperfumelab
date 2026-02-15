import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Crown, Eye, EyeOff, ArrowRight, Check, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { useProgression } from "@/hooks/useProgression";

const MAX_FOUNDING_CREATORS = 100;
const WEEKLY_BLEND_CAP = 50;

const ExclusiveAccessPage = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [revealReason, setRevealReason] = useState(false);
  const { markWaitlistJoined } = useProgression();

  useEffect(() => {
    const fetchCount = async () => {
      const { data } = await supabase.rpc("get_waitlist_count");
      if (typeof data === "number") {
        setSpotsLeft(Math.max(0, MAX_FOUNDING_CREATORS - data));
      }
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert({
        email: email.trim(),
        name: name.trim() || null,
        reason: reason.trim() || null,
      });
      if (error) {
        if (error.code === "23505") {
          toast.info("You're already on the list.");
        } else throw error;
      }
      setSubmitted(true);
      markWaitlistJoined();
      if (spotsLeft !== null && spotsLeft > 0) setSpotsLeft(spotsLeft - 1);
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <ParticleField count={15} />

      <main className="relative z-10 pt-24 pb-20 px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Restricted badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center mb-8"
        >
          <div className="glass-surface rounded-full px-5 py-2 flex items-center gap-2 border border-primary/20">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span className="font-display text-[10px] tracking-[0.3em] text-primary uppercase">
              Access by Invitation Only
            </span>
          </div>
        </motion.div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-wider mb-4">
            <span className="gradient-text">Fragrance creation</span>
            <br />
            <span className="text-foreground">was never meant to be</span>
            <br />
            <span className="text-foreground">this accessible.</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-body max-w-md mx-auto leading-relaxed mt-6">
            The private tools of master perfumers. Now in your hands.
            <br />
            <span className="text-foreground/70 italic">If you're accepted.</span>
          </p>
        </motion.div>

        {/* Scarcity indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-3 mb-10 max-w-sm mx-auto"
        >
          <div className="glass-surface rounded-xl p-4 text-center border border-accent/10">
            <Crown className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="font-display text-2xl font-black text-accent">
              {spotsLeft !== null ? spotsLeft : "—"}
            </div>
            <div className="text-[9px] font-display tracking-widest text-muted-foreground mt-1">
              FOUNDING SPOTS LEFT
            </div>
            <div className="text-[9px] font-body text-muted-foreground/60 mt-0.5">
              of {MAX_FOUNDING_CREATORS}
            </div>
          </div>
          <div className="glass-surface rounded-xl p-4 text-center border border-primary/10">
            <Flame className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="font-display text-2xl font-black text-primary">
              {WEEKLY_BLEND_CAP}
            </div>
            <div className="text-[9px] font-display tracking-widest text-muted-foreground mt-1">
              BLENDS PER WEEK
            </div>
            <div className="text-[9px] font-body text-muted-foreground/60 mt-0.5">
              hand-crafted limit
            </div>
          </div>
        </motion.div>

        {/* Application form / Success */}
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-surface rounded-2xl p-8 text-center border border-primary/20 max-w-md mx-auto"
              style={{ boxShadow: "0 0 60px hsl(var(--primary) / 0.08)" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Check className="w-10 h-10 text-primary mx-auto mb-4" />
              </motion.div>
              <h2 className="font-display text-xl font-bold tracking-wider text-foreground mb-2">
                Application Received
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">
                We review each application personally.
                <br />
                If selected, you'll receive your invitation within 48 hours.
              </p>
              <div className="mt-6 glass-surface rounded-lg p-3 inline-block">
                <span className="text-[9px] font-display tracking-widest text-muted-foreground">
                  YOUR POSITION: #{spotsLeft !== null ? MAX_FOUNDING_CREATORS - spotsLeft : "—"}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="glass-surface rounded-2xl p-6 sm:p-8 max-w-md mx-auto border border-border/50"
              style={{ boxShadow: "0 0 40px hsl(var(--primary) / 0.05)" }}
            >
              <h2 className="font-display text-base tracking-widest text-center text-muted-foreground mb-6">
                APPLY FOR ACCESS
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                    NAME
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="How should we address you"
                    className="w-full bg-card/50 border border-border/50 rounded-lg px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                    EMAIL <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Your private email"
                    className="w-full bg-card/50 border border-border/50 rounded-lg px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setRevealReason(!revealReason)}
                    className="flex items-center gap-2 text-[10px] font-display tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-1.5"
                  >
                    {revealReason ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    WHY SHOULD WE ACCEPT YOU? (OPTIONAL)
                  </button>
                  <AnimatePresence>
                    {revealReason && (
                      <motion.textarea
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        maxLength={300}
                        rows={3}
                        placeholder="Tell us about your relationship with fragrance…"
                        className="w-full bg-card/50 border border-border/50 rounded-lg px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full mt-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-widest hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-primary"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    ◎
                  </motion.div>
                ) : (
                  <>
                    Request Access <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[9px] text-muted-foreground/50 font-body text-center mt-4">
                We don't share your email. Ever.
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Bottom narrative */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-border" />
            <span className="text-[9px] font-display tracking-[0.4em] text-muted-foreground">
              THE ATELIER
            </span>
            <div className="h-px w-16 bg-border" />
          </div>
          <p className="text-xs text-muted-foreground/60 font-body max-w-sm mx-auto leading-relaxed italic">
            Each formula is blended by hand in weekly micro-batches.
            No two compositions are identical. We accept only those
            who understand that restraint is the highest form of luxury.
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default ExclusiveAccessPage;
