import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Lock, Eye, EyeOff, Crown, Flame, ArrowRight, Share2, Copy, Check, Instagram, Twitter, Users, Zap, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const MAX_FOUNDING = 100;

/* Fake "leaked" blend teasers — blurred on screen */
const leakedBlends = [
  { number: "0003", notes: "████ · Oud · ████", harmony: 94, status: "Grand Perfumer" },
  { number: "0017", notes: "Rose · ████ · ████", harmony: 87, status: "Master Alchemist" },
  { number: "0024", notes: "████ · ████ · Amber", harmony: 91, status: "Master Alchemist" },
  { number: "0031", notes: "Bergamot · ████ · ████", harmony: 78, status: "Scent Architect" },
  { number: "0042", notes: "████ · Jasmine · ████", harmony: 96, status: "Grand Perfumer" },
  { number: "0058", notes: "████ · ████ · Sandalwood", harmony: 83, status: "Master Alchemist" },
];

/* Rotating "live activity" — fake real-time social proof */
const liveActivity = [
  { city: "Paris", action: "just joined the waitlist", time: "12s ago" },
  { city: "Dubai", action: "peeked at Blend No. 0042", time: "34s ago" },
  { city: "Tokyo", action: "just joined the waitlist", time: "1m ago" },
  { city: "London", action: "shared an invite link", time: "2m ago" },
  { city: "New York", action: "just joined the waitlist", time: "3m ago" },
  { city: "Milan", action: "peeked at Blend No. 0017", time: "4m ago" },
  { city: "Berlin", action: "just joined the waitlist", time: "5m ago" },
  { city: "Seoul", action: "requested early access", time: "6m ago" },
];

/* Whispers — cryptic micro-copy that creates curiosity gaps */
const whispers = [
  "They said this was never meant to be shared…",
  "Some formulas should stay hidden.",
  "You weren't supposed to see this.",
  "The vault was never meant to open.",
  "Not everyone can handle what's inside.",
  "This page will be taken down.",
];

const LaunchPage = () => {
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealedCard, setRevealedCard] = useState<number | null>(null);
  const [activityIndex, setActivityIndex] = useState(0);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdRevealed, setHoldRevealed] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [viewerCount, setViewerCount] = useState(17);

  useEffect(() => {
    const fetchCount = async () => {
      const { data } = await supabase.rpc("get_waitlist_count");
      if (typeof data === "number") setSpotsLeft(Math.max(0, MAX_FOUNDING - data));
    };
    fetchCount();
  }, []);

  // Rotate live activity feed
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((p) => (p + 1) % liveActivity.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Rotate whispers
  useEffect(() => {
    const interval = setInterval(() => {
      setWhisperIndex((p) => (p + 1) % whispers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fluctuate "viewers" for urgency
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((v) => Math.max(8, Math.min(34, v + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("waitlist").insert({ email: email.trim() });
      if (error?.code === "23505") toast.info("You're already on the list.");
      else if (error) throw error;
      setSubmitted(true);
      if (spotsLeft !== null && spotsLeft > 0) setSpotsLeft(spotsLeft - 1);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Hold-to-reveal mechanic
  const startHold = () => {
    if (holdRevealed) return;
    holdTimer.current = setInterval(() => {
      setHoldProgress((p) => {
        if (p >= 100) {
          if (holdTimer.current) clearInterval(holdTimer.current);
          setHoldRevealed(true);
          return 100;
        }
        return p + 2;
      });
    }, 30);
  };

  const endHold = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    if (!holdRevealed) setHoldProgress(0);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/launch" : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <ParticleField count={20} />

      {/* ── LIVE ACTIVITY TICKER — social proof pressure ── */}
      <div className="fixed top-16 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activityIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-lg"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-body text-muted-foreground">
              Someone in <span className="text-foreground font-medium">{liveActivity[activityIndex].city}</span>{" "}
              {liveActivity[activityIndex].action}
            </span>
            <span className="text-[9px] text-muted-foreground/50">{liveActivity[activityIndex].time}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── HERO: FORBIDDEN FRUIT ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Warning badge — triggers "forbidden" instinct */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 glass-surface rounded-full px-4 py-2 border border-accent/20 mb-6"
          >
            <AlertTriangle className="w-3 h-3 text-accent" />
            <span className="font-display text-[9px] tracking-[0.3em] text-accent uppercase">
              Not for everyone
            </span>
          </motion.div>

          {/* Main headline — incomplete statement (Zeigarnik) */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-wider leading-[0.95]">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="block gradient-text"
            >
              You weren't
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="block text-foreground"
            >
              supposed to
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="block text-foreground"
            >
              find this.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-8 text-sm sm:text-base text-muted-foreground font-body max-w-md mx-auto leading-relaxed"
          >
            The private perfumery tools used by master creators.
            <br />
            <span className="text-foreground/70 italic">Now accidentally exposed.</span>
          </motion.p>

          {/* Live viewer count — urgency */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="mt-6 inline-flex items-center gap-2 text-[10px] text-muted-foreground/60 font-body"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span>{viewerCount} people viewing this page right now</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-5 h-8 rounded-full border border-primary/30 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-primary/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── WHISPER BAR — cryptic micro-copy scrolling ── */}
      <section className="relative z-10 py-6 border-y border-border/20">
        <div className="overflow-hidden h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={whisperIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="font-body text-xs italic text-muted-foreground text-center"
            >
              {whispers[whisperIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </section>

      {/* ── HOLD TO REVEAL — irresistible interaction ── */}
      <section className="relative z-10 py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-sm mx-auto text-center"
        >
          <Zap className="w-5 h-5 text-accent mx-auto mb-3" />
          <p className="text-[10px] font-display tracking-[0.3em] text-muted-foreground/60 mb-6">
            RESTRICTED CONTENT
          </p>

          <div className="relative">
            {/* The hold button */}
            <motion.button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              whileTap={{ scale: 0.97 }}
              className="w-full glass-surface rounded-2xl p-8 border border-primary/20 cursor-pointer select-none touch-none relative overflow-hidden group"
            >
              {/* Progress fill */}
              <div
                className="absolute inset-0 bg-primary/10 transition-none"
                style={{ width: `${holdProgress}%` }}
              />

              <div className="relative z-10">
                {holdRevealed ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="font-display text-lg font-bold text-foreground mb-2">
                      Blend No. 0099
                    </p>
                    <p className="text-xs text-muted-foreground font-body mb-1">
                      Oud Noir · Black Rose · Smoke
                    </p>
                    <p className="text-[10px] text-primary font-display tracking-wider">
                      HARMONY: 97% — GRAND PERFUMER
                    </p>
                    <p className="text-[9px] text-muted-foreground/50 font-body mt-3 italic">
                      This blend was created by someone just like you.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <Lock className="w-6 h-6 text-primary/40 mx-auto mb-3 group-hover:text-primary/70 transition-colors" />
                    <p className="font-display text-sm tracking-wider text-foreground/80 mb-1">
                      {holdProgress > 0 ? "Keep holding…" : "Hold to unlock"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      A secret blend is hidden here
                    </p>
                    {holdProgress > 0 && (
                      <div className="mt-3 w-full h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-none"
                          style={{ width: `${holdProgress}%` }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ── LEAKED FORMULAS: BLURRED TEASERS ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-border" />
              <Eye className="w-4 h-4 text-primary" />
              <div className="h-px w-12 bg-border" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
              Classified Formulas
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Tap any card. You know you want to.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {leakedBlends.map((blend, i) => (
              <motion.div
                key={blend.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setRevealedCard(revealedCard === i ? null : i)}
                className="glass-surface rounded-xl p-4 sm:p-5 cursor-pointer group hover:border-primary/30 transition-all relative overflow-hidden"
              >
                {/* Blur overlay */}
                <div
                  className={`absolute inset-0 backdrop-blur-sm bg-background/30 transition-opacity duration-500 flex items-center justify-center ${
                    revealedCard === i ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  <div className="text-center">
                    <EyeOff className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                    <span className="text-[8px] font-display tracking-widest text-muted-foreground">
                      TAP TO PEEK
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-base sm:text-lg font-black gradient-text">
                    No. {blend.number}
                  </span>
                  <Crown className="w-3 h-3 text-accent/60" />
                </div>

                <div className="font-body text-[10px] sm:text-xs text-muted-foreground mb-2 tracking-wide">
                  {blend.notes}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${blend.harmony}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.8 }}
                    />
                  </div>
                  <span className="text-[9px] font-display text-primary">{blend.harmony}%</span>
                </div>

                <div className="mt-2">
                  <span className="text-[7px] font-display tracking-widest text-accent/50">
                    {blend.status.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SCARCITY ENGINE — loss aversion ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div
            className="glass-surface rounded-2xl p-6 sm:p-8 text-center border border-primary/10"
            style={{ boxShadow: "0 0 80px hsl(var(--primary) / 0.06)" }}
          >
            <Flame className="w-7 h-7 text-accent mx-auto mb-3" />
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-1">
              Almost gone.
            </h2>
            <p className="text-[10px] text-muted-foreground font-body mb-6">
              Once full, this page disappears.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass-surface rounded-xl p-4 border border-accent/10">
                <div className="font-display text-2xl sm:text-3xl font-black text-accent">
                  {spotsLeft ?? "—"}
                </div>
                <div className="text-[7px] font-display tracking-[0.25em] text-muted-foreground mt-1">
                  SPOTS LEFT
                </div>
                <div className="w-full h-1 rounded-full bg-muted mt-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: "100%" }}
                    animate={{
                      width: spotsLeft !== null ? `${(spotsLeft / MAX_FOUNDING) * 100}%` : "100%",
                    }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </div>
              <div className="glass-surface rounded-xl p-4 border border-primary/10">
                <div className="font-display text-2xl sm:text-3xl font-black text-primary">50</div>
                <div className="text-[7px] font-display tracking-[0.25em] text-muted-foreground mt-1">
                  WEEKLY LIMIT
                </div>
                <div className="w-full h-1 rounded-full bg-muted mt-2">
                  <div className="h-full bg-primary rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Waitlist — casual, minimal friction */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 border border-primary/20">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm font-display tracking-wider text-primary">
                      You're in.
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 font-body italic">
                    The vault is guarded, but you've found the key. We'll be in touch.
                  </p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleJoin} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="flex-1 bg-card/50 border border-border/50 rounded-lg px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-display text-xs tracking-widest hover:brightness-110 transition-all disabled:opacity-40 glow-primary whitespace-nowrap"
                    >
                      {loading ? "…" : "Get in"}
                    </button>
                  </div>
                  <p className="text-[9px] text-muted-foreground/40 font-body">
                    No spam. Just an invitation when it's your turn.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ── SHARE SECTION — casual reverse psychology ── */}
      <section className="relative z-10 py-16 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-sm mx-auto text-center"
        >
          <Share2 className="w-5 h-5 text-primary mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold tracking-wider text-foreground mb-1">
            Don't share this.
          </h2>
          <p className="text-[10px] text-muted-foreground font-body mb-5">
            Seriously. The fewer people who know, the better your chances.
          </p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 glass-surface rounded-lg px-3 py-2 text-[10px] font-body text-muted-foreground truncate">
              {shareUrl}
            </div>
            <button
              onClick={copyLink}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-display text-[10px] tracking-wider flex items-center gap-1.5 glow-primary"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex justify-center gap-2">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-surface rounded-lg px-3 py-2 flex items-center gap-1.5 hover:border-primary/30 transition-colors"
            >
              <Instagram className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-display tracking-wider text-muted-foreground">
                Instagram
              </span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                "You weren't supposed to find this.\n\n" + shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-surface rounded-lg px-3 py-2 flex items-center gap-1.5 hover:border-primary/30 transition-colors"
            >
              <Twitter className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-display tracking-wider text-muted-foreground">
                Twitter / X
              </span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── MANIFESTO FOOTER ── */}
      <section className="relative z-10 py-20 px-4 sm:px-6 border-t border-border/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center space-y-5"
        >
          <p className="font-display text-[10px] tracking-[0.5em] text-muted-foreground/50">
            THE MANIFESTO
          </p>
          <div className="space-y-3 text-sm text-muted-foreground font-body leading-relaxed">
            <p>We don't chase trends. We set the standard.</p>
            <p>We don't mass-produce. We hand-blend.</p>
            <p>
              We don't sell access.{" "}
              <span className="text-foreground font-medium">We grant it.</span>
            </p>
          </div>
          <div className="h-px w-16 mx-auto bg-primary/30 my-6" />
          <p className="text-[8px] font-display tracking-[0.4em] text-muted-foreground/30">
            © 2026 THE PERFUME LAB — EACH COMPOSITION IS UNIQUE
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default LaunchPage;
