import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, Crown, Flame, ArrowRight, Share2, Copy, Check, Instagram, Twitter } from "lucide-react";
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

const teaserPhrases = [
  "What is this?",
  "How do I get access?",
  "I need to try this.",
  "The formulas are real?",
  "Only 100 spots?",
  "This changes everything.",
];

const LaunchPage = () => {
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePhrase, setActivePhrase] = useState(0);
  const [revealedCard, setRevealedCard] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const { data } = await supabase.rpc("get_waitlist_count");
      if (typeof data === "number") setSpotsLeft(Math.max(0, MAX_FOUNDING - data));
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhrase((p) => (p + 1) % teaserPhrases.length);
    }, 3000);
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

      {/* ── HERO: THE PROVOCATION ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Restricted badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 glass-surface rounded-full px-5 py-2 border border-primary/20 mb-8"
          >
            <Lock className="w-3 h-3 text-primary" />
            <span className="font-display text-[9px] tracking-[0.4em] text-primary uppercase">
              Applications Open Soon
            </span>
          </motion.div>

          {/* Main headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider leading-[0.95]">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="block gradient-text"
            >
              Something
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="block text-foreground"
            >
              is being
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="block text-foreground"
            >
              created.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-8 text-sm sm:text-base text-muted-foreground font-body max-w-md mx-auto leading-relaxed"
          >
            Fragrance creation was never meant to be this accessible.
            <br />
            <span className="text-foreground/70 italic">The private tools of master perfumers. Now in your hands.</span>
          </motion.p>
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

      {/* ── LEAKED FORMULAS: BLURRED TEASERS ── */}
      <section className="relative z-10 py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-border" />
              <Eye className="w-4 h-4 text-primary" />
              <div className="h-px w-12 bg-border" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-3">
              Classified Formulas
            </h2>
            <p className="text-xs text-muted-foreground font-body">
              Some blends have already been created. Their full compositions remain sealed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {leakedBlends.map((blend, i) => (
              <motion.div
                key={blend.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setRevealedCard(revealedCard === i ? null : i)}
                className="glass-surface rounded-xl p-5 cursor-pointer group hover:border-primary/30 transition-all relative overflow-hidden"
              >
                {/* Blur overlay */}
                <div
                  className={`absolute inset-0 backdrop-blur-sm bg-background/30 transition-opacity duration-500 flex items-center justify-center ${
                    revealedCard === i ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  <div className="text-center">
                    <EyeOff className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <span className="text-[9px] font-display tracking-widest text-muted-foreground">TAP TO PEEK</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-lg font-black gradient-text">
                    No. {blend.number}
                  </span>
                  <span className="text-[8px] font-display tracking-widest text-accent">
                    {blend.status.toUpperCase()}
                  </span>
                </div>

                <div className="font-body text-xs text-muted-foreground mb-3 tracking-wide">
                  {blend.notes}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${blend.harmony}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-[10px] font-display text-primary">{blend.harmony}%</span>
                  </div>
                  <Crown className="w-3.5 h-3.5 text-accent/60" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── SOCIAL PROOF: WHAT PEOPLE ARE SAYING ── */}
      <section className="relative z-10 py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-8">
              People are asking:
            </h2>

            <div className="h-16 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activePhrase}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="font-display text-2xl sm:text-4xl font-black gradient-text italic"
                >
                  "{teaserPhrases[activePhrase]}"
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SCARCITY ENGINE ── */}
      <section className="relative z-10 py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="glass-surface rounded-2xl p-8 text-center border border-primary/10"
            style={{ boxShadow: "0 0 80px hsl(var(--primary) / 0.06)" }}
          >
            <Flame className="w-8 h-8 text-accent mx-auto mb-4" />
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
              The Numbers
            </h2>
            <p className="text-xs text-muted-foreground font-body mb-8">
              Controlled. Deliberate. By design.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass-surface rounded-xl p-5 border border-accent/10">
                <div className="font-display text-3xl sm:text-4xl font-black text-accent">
                  {spotsLeft ?? "—"}
                </div>
                <div className="text-[8px] font-display tracking-[0.3em] text-muted-foreground mt-2">
                  FOUNDING SPOTS
                </div>
                <div className="text-[8px] font-body text-muted-foreground/50 mt-0.5">
                  of {MAX_FOUNDING} total
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 rounded-full bg-muted mt-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-accent rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: spotsLeft !== null ? `${(spotsLeft / MAX_FOUNDING) * 100}%` : "100%" }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
              </div>
              <div className="glass-surface rounded-xl p-5 border border-primary/10">
                <div className="font-display text-3xl sm:text-4xl font-black text-primary">
                  50
                </div>
                <div className="text-[8px] font-display tracking-[0.3em] text-muted-foreground mt-2">
                  WEEKLY CAPACITY
                </div>
                <div className="text-[8px] font-body text-muted-foreground/50 mt-0.5">
                  hand-blended limit
                </div>
                <div className="w-full h-1 rounded-full bg-muted mt-3">
                  <div className="h-full bg-primary rounded-full w-full" />
                </div>
              </div>
            </div>

            {/* Quick waitlist signup */}
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm font-display tracking-wider text-primary">You're on the list</span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleJoin}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="flex-1 bg-card/50 border border-border/50 rounded-lg px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 rounded-lg bg-primary text-primary-foreground font-display text-xs tracking-widest hover:brightness-110 transition-all disabled:opacity-40 glow-primary whitespace-nowrap"
                  >
                    {loading ? "..." : "Join"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ── SHARE SECTION ── */}
      <section className="relative z-10 py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto text-center"
        >
          <Share2 className="w-6 h-6 text-primary mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold tracking-wider text-foreground mb-2">
            Spread the word. Or don't.
          </h2>
          <p className="text-xs text-muted-foreground font-body mb-6">
            Exclusivity works best when few people know.
          </p>

          <div className="flex items-center gap-2 max-w-sm mx-auto mb-4">
            <div className="flex-1 glass-surface rounded-lg px-3 py-2.5 text-xs font-body text-muted-foreground truncate">
              {shareUrl}
            </div>
            <button
              onClick={copyLink}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-display text-xs tracking-wider flex items-center gap-1.5 glow-primary"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex justify-center gap-3">
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-surface rounded-lg px-4 py-2.5 flex items-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Instagram className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display tracking-wider text-muted-foreground">Instagram</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Something is being created. Access by invitation only.\n\n" + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-surface rounded-lg px-4 py-2.5 flex items-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Twitter className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-display tracking-wider text-muted-foreground">Twitter / X</span>
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── MANIFESTO FOOTER ── */}
      <section className="relative z-10 py-24 px-4 sm:px-6 border-t border-border/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center space-y-6"
        >
          <p className="font-display text-xs tracking-[0.5em] text-muted-foreground">THE MANIFESTO</p>
          <div className="space-y-4 text-sm sm:text-base text-muted-foreground font-body leading-relaxed">
            <p>We don't chase trends. We set the standard.</p>
            <p>We don't mass-produce. We hand-blend.</p>
            <p>We don't sell access. <span className="text-foreground font-medium">We grant it.</span></p>
          </div>
          <div className="h-px w-16 mx-auto bg-primary/30 my-8" />
          <p className="text-[9px] font-display tracking-[0.4em] text-muted-foreground/40">
            © 2026 THE PERFUME LAB — EACH COMPOSITION IS UNIQUE
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default LaunchPage;
