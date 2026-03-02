import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Link2, Copy, CheckCircle, TrendingUp, DollarSign,
  Award, ArrowRight, Share2, BarChart3, Gift, Zap, Crown,
  ShieldCheck, Wallet, UserPlus, MessageCircle, Mail, Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const TIERS = [
  { name: "Bronze", code: "bronze", commission: "20%", requirement: "0 referrals", color: "from-amber-700 to-amber-900", icon: Award },
  { name: "Silver", code: "silver", commission: "30%", requirement: "10+ referrals", color: "from-gray-300 to-gray-500", icon: Award },
  { name: "Gold", code: "gold", commission: "35%", requirement: "50+ referrals", color: "from-yellow-400 to-amber-500", icon: Crown },
  { name: "Platinum", code: "platinum", commission: "40%", requirement: "100+ referrals", color: "from-cyan-300 to-blue-400", icon: Crown },
  { name: "High Achiever", code: "high_achiever", commission: "50%", requirement: "250+ referrals", color: "from-purple-400 to-fuchsia-500", icon: Crown },
];

const HOW_IT_WORKS = [
  { icon: UserPlus, title: "Sign Up", description: "Create your free affiliate account and get your unique referral link instantly." },
  { icon: Share2, title: "Share & Promote", description: "Share your link with your network — social media, email, word of mouth." },
  { icon: Gift, title: "They Create", description: "When someone joins through your link and creates a blend, you earn commission." },
  { icon: Wallet, title: "Get Paid", description: "Track your earnings in real-time and request payouts whenever you want." },
];

const AffiliatePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"overview" | "referrals" | "payouts">("overview");
  const [referrals, setReferrals] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Check if already an affiliate
        const { data } = await supabase
          .from("affiliate_partners")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (data) {
          setAffiliate(data);
          // Fetch referrals
          const { data: refs } = await supabase
            .from("affiliate_referrals")
            .select("*")
            .eq("affiliate_id", data.id)
            .order("created_at", { ascending: false });
          setReferrals(refs || []);
        }
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleApply = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setApplying(true);
    try {
      const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Partner";
      const { data, error } = await supabase
        .from("affiliate_partners")
        .insert({
          user_id: user.id,
          display_name: displayName,
          email: user.email!,
        })
        .select()
        .single();
      if (error) throw error;
      setAffiliate(data);
      toast.success("Welcome to the Affiliate Program!", { description: "Your referral link is ready." });
    } catch (err: any) {
      if (err.message?.includes("duplicate")) {
        toast.error("You already have an affiliate account.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setApplying(false);
    }
  };

  const referralLink = affiliate
    ? `${window.location.origin}?ref=${affiliate.referral_code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTier = TIERS.find(t => t.code === (affiliate?.tier || "bronze")) || TIERS[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-20 sm:pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/20 mb-8"
          >
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-display tracking-[0.3em] text-accent">EARN UP TO 25% COMMISSION</span>
          </motion.div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black tracking-wider gradient-text mb-6 leading-tight">
            Partner Program &<br />Affiliate Network
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
            Join our network of fragrance ambassadors. Share The Perfume Lab with your audience 
            and earn commission on every creation they make.
          </p>
        </motion.div>

        {!affiliate ? (
          <>
            {/* How It Works */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
              <div className="text-center mb-12">
                <span className="text-[10px] font-display tracking-[0.3em] text-primary mb-3 block">HOW IT WORKS</span>
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground">Four Simple Steps</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {HOW_IT_WORKS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-surface rounded-xl p-6 text-center relative group hover:border-primary/30 transition-colors"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <span className="text-[10px] font-display text-primary font-bold">{i + 1}</span>
                    </div>
                    <step.icon className="w-8 h-8 text-primary mx-auto mb-3 mt-2 group-hover:drop-shadow-[0_0_12px_hsl(185_80%_55%/0.5)] transition-all" />
                    <h3 className="font-display text-sm font-semibold tracking-wide mb-2 text-foreground">{step.title}</h3>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Commission Tiers */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
              <div className="text-center mb-12">
                <span className="text-[10px] font-display tracking-[0.3em] text-accent mb-3 block">COMMISSION TIERS</span>
                <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground">The More You Share, The More You Earn</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {TIERS.map((tier, i) => (
                  <motion.div
                    key={tier.code}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-surface rounded-xl p-6 text-center group hover:border-primary/30 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tier.color} mx-auto mb-4 flex items-center justify-center`}>
                      <tier.icon className="w-5 h-5 text-background" />
                    </div>
                    <h3 className="font-display text-base font-bold tracking-wide text-foreground mb-1">{tier.name}</h3>
                    <p className="font-display text-3xl font-black gradient-text mb-2">{tier.commission}</p>
                    <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">{tier.requirement}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-20">
              <div className="glass-surface rounded-2xl p-8 sm:p-12">
                <div className="text-center mb-10">
                  <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-3">Why Join Our Network?</h2>
                  <p className="text-sm text-muted-foreground font-body max-w-lg mx-auto">More than just commissions — you become part of an exclusive community shaping the future of luxury fragrance.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { icon: DollarSign, title: "Recurring Revenue", desc: "Earn on every purchase your referrals make — not just the first one." },
                    { icon: BarChart3, title: "Real-Time Dashboard", desc: "Track clicks, conversions, and earnings with your personal analytics hub." },
                    { icon: ShieldCheck, title: "90-Day Cookie", desc: "Your referrals are tracked for 90 days — giving you more time to convert." },
                  ].map((b, i) => (
                    <div key={i} className="text-center">
                      <b.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                      <h3 className="font-display text-sm font-semibold tracking-wide mb-2 text-foreground">{b.title}</h3>
                      <p className="text-xs text-muted-foreground font-body leading-relaxed">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <Button
                size="lg"
                onClick={handleApply}
                disabled={applying}
                className="glow-primary font-display tracking-wider text-sm px-12"
              >
                {applying ? "Setting up..." : user ? "Join the Affiliate Program" : "Sign In to Join"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-xs text-muted-foreground font-body mt-4">Free to join · No minimum sales · Instant approval</p>
            </motion.div>
          </>
        ) : (
          /* AFFILIATE DASHBOARD */
          <>
            {/* Status Banner */}
            {affiliate.status === "pending" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface rounded-xl p-4 mb-8 text-center border border-accent/30">
                <p className="text-sm text-accent font-display tracking-wide">
                  ⏳ Your application is being reviewed. You can start sharing your link now!
                </p>
              </motion.div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Referrals", value: affiliate.total_referrals, icon: Users, accent: false },
                { label: "Total Sales", value: `€${(affiliate.total_sales || 0).toFixed(2)}`, icon: TrendingUp, accent: false },
                { label: "Earnings", value: `€${(affiliate.total_earnings || 0).toFixed(2)}`, icon: DollarSign, accent: true },
                { label: "Commission Rate", value: `${affiliate.commission_rate}%`, icon: Award, accent: false },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass-surface rounded-xl p-5 ${stat.accent ? "border-primary/30" : ""}`}
                >
                  <stat.icon className={`w-5 h-5 mb-2 ${stat.accent ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-display text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Referral Link */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface rounded-xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-primary" />
                <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">Your Referral Link</h3>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 bg-muted/30 rounded-lg px-4 py-3 text-sm font-body text-foreground/70 overflow-x-auto whitespace-nowrap border border-border">
                  {referralLink}
                </div>
                <Button onClick={copyLink} variant="outline" className="font-display tracking-wider text-xs shrink-0">
                  {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out The Perfume Lab — create your own signature scent! ${referralLink}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(142_70%_40%)]/10 border border-[hsl(142_70%_40%)]/20 text-[hsl(142_70%_40%)] hover:bg-[hsl(142_70%_40%)]/20 transition-colors text-xs font-display tracking-wider"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Create your own signature scent at The Perfume Lab 🧪✨`)}&url=${encodeURIComponent(referralLink)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-xs font-display tracking-wider"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  Twitter / X
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(referralLink);
                    toast.success("Link copied! Paste it in your Instagram bio or story.", { description: "Instagram doesn't support direct link sharing." });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors text-xs font-display tracking-wider"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Instagram
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent("Create Your Signature Scent — The Perfume Lab")}&body=${encodeURIComponent(`I've been using The Perfume Lab to create custom fragrances and thought you'd love it!\n\nJoin here: ${referralLink}`)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-xs font-display tracking-wider"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </a>
              </div>
              <p className="text-xs text-muted-foreground font-body mt-3">Share this link anywhere — social media, email, your website. Every signup earns you commission.</p>
            </motion.div>

            {/* Tier Progress */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <currentTier.icon className="w-5 h-5 text-accent" />
                  <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
                    {currentTier.name} Tier — {affiliate.commission_rate}% Commission
                  </h3>
                </div>
              </div>
              <div className="flex gap-2">
                {TIERS.map((t, i) => (
                  <div key={t.code} className="flex-1">
                    <div className={`h-2 rounded-full ${t.code === affiliate.tier ? "bg-primary" : i < TIERS.findIndex(x => x.code === affiliate.tier) ? "bg-primary/40" : "bg-muted"}`} />
                    <p className="text-[9px] font-display tracking-wider text-muted-foreground mt-1 text-center">{t.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {(["overview", "referrals", "payouts"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-xs font-display tracking-wider transition-colors ${
                    tab === t ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-surface rounded-xl p-6">
                  <h3 className="font-display text-base font-semibold tracking-wide text-foreground mb-4">Quick Start Guide</h3>
                  <div className="space-y-4">
                    {[
                      "Copy your referral link above and share it on social media",
                      "Send personalized invitations to fragrance enthusiasts in your network",
                      "Create content about your own Perfume Lab experience to inspire others",
                      "Track your performance and optimize your strategy with real-time analytics",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-display text-primary font-bold">{i + 1}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-body">{step}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "referrals" && (
                <motion.div key="referrals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-surface rounded-xl p-6">
                  <h3 className="font-display text-base font-semibold tracking-wide text-foreground mb-4">Your Referrals</h3>
                  {referrals.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-body">No referrals yet. Share your link to get started!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {referrals.map((ref) => (
                        <div key={ref.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                          <div>
                            <p className="text-sm font-body text-foreground">{ref.referred_email || "Anonymous"}</p>
                            <p className="text-[10px] font-display tracking-wider text-muted-foreground">
                              {new Date(ref.created_at).toLocaleDateString()} · {ref.referral_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-display tracking-wider px-2 py-1 rounded-full ${
                              ref.status === "converted" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>
                              {ref.status}
                            </span>
                            {ref.commission_amount > 0 && (
                              <p className="text-xs font-display text-primary mt-1">+€{ref.commission_amount.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === "payouts" && (
                <motion.div key="payouts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-surface rounded-xl p-6">
                  <h3 className="font-display text-base font-semibold tracking-wide text-foreground mb-4">Payout History</h3>
                  <div className="text-center py-12">
                    <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground font-body">No payouts yet. Earn your first commission to see it here.</p>
                    <p className="text-xs text-muted-foreground/60 font-body mt-2">Minimum payout: €25 · Processed monthly</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <footer className="relative z-10 border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground font-body tracking-wide">© 2026 The Perfume Lab — Affiliate Program</p>
      </footer>
    </div>
  );
};

export default AffiliatePage;
