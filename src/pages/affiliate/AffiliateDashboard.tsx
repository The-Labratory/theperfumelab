import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, CheckCircle, Plus, BarChart3, Link2, Share2, Users, DollarSign, Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { getMyAffiliate, getCampaigns, createCampaign, buildReferralLink, type AffiliateProfile } from "@/lib/affiliates";
import { calculateLevel, getEarnedBadges, BADGE_DEFINITIONS, type GamificationStats } from "@/lib/gamification";
import { toast } from "sonner";

const AffiliateDashboard = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getMyAffiliate();
      if (!data || data.slug !== slug) { navigate("/auth"); return; }
      // Gate: redirect to onboarding if not completed
      if (!data.onboarding_completed) {
        navigate("/affiliate/onboard", { replace: true });
        return;
      }
      setAffiliate(data);
      const camps = await getCampaigns(data.id);
      setCampaigns(camps);
      setLoading(false);
    };
    load();
  }, [slug, navigate]);

  const level = affiliate ? calculateLevel(affiliate.points) : null;
  const stats: GamificationStats | null = affiliate
    ? { points: affiliate.points, totalSales: affiliate.total_sales, totalReferrals: affiliate.total_referrals, campaignsCreated: campaigns.length, onboardingCompleted: affiliate.onboarding_completed, profileCompleted: !!(affiliate.bio && affiliate.avatar_url) }
    : null;
  const earnedBadges = stats ? getEarnedBadges(stats) : [];

  const copyLink = (link: string, label: string) => {
    navigator.clipboard.writeText(link);
    setCopied(label);
    toast.success("Link copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreateCampaign = async () => {
    if (!affiliate || !newCampaignName.trim()) return;
    setCreating(true);
    try {
      const camp = await createCampaign(affiliate.id, newCampaignName.trim());
      setCampaigns((prev) => [camp, ...prev]);
      setNewCampaignName("");
      toast.success("Campaign created! 🎯");
    } catch {
      toast.error("Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  if (loading || !affiliate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const mainLink = buildReferralLink(affiliate.slug);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-24 sm:pt-28 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden shrink-0">
              {affiliate.avatar_url ? (
                <img src={affiliate.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-display font-black text-accent">{affiliate.display_name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground">
                {affiliate.display_name}'s Dashboard
              </h1>
              <p className="font-body text-xs text-muted-foreground">/{affiliate.slug}</p>
            </div>
            <Button size="sm" variant="outline" className="ml-auto font-display text-xs tracking-wider" onClick={() => navigate(`/affiliate/${slug}`)}>
              View Public Page <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>

          {/* Level bar */}
          {level && (
            <div className="glass-surface rounded-xl p-3 border border-border/50 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display text-[10px] tracking-widest text-muted-foreground">LVL {level.level} — {level.title}</span>
                <span className="font-display text-xs text-accent font-bold">{affiliate.points} pts</span>
              </div>
              <Progress value={level.progress} className="h-1.5" />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: DollarSign, label: "Earnings", value: `€${affiliate.total_earnings.toFixed(2)}` },
              { icon: BarChart3, label: "Sales", value: affiliate.total_sales },
              { icon: Users, label: "Referrals", value: affiliate.total_referrals },
              { icon: Sparkles, label: "Tier", value: affiliate.tier },
            ].map((s) => (
              <div key={s.label} className="glass-surface rounded-xl p-3 border border-border/50 text-center">
                <s.icon className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="font-display text-lg font-black text-foreground">{s.value}</p>
                <p className="font-body text-[9px] text-muted-foreground tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="links" className="space-y-4">
          <TabsList className="w-full justify-start bg-card/50 border border-border/50">
            <TabsTrigger value="links" className="font-display text-xs tracking-wider">Links & Campaigns</TabsTrigger>
            <TabsTrigger value="badges" className="font-display text-xs tracking-wider">Badges</TabsTrigger>
            <TabsTrigger value="templates" className="font-display text-xs tracking-wider">Templates</TabsTrigger>
          </TabsList>

          {/* Links & Campaigns */}
          <TabsContent value="links" className="space-y-4">
            {/* Main Link */}
            <div className="glass-surface rounded-2xl p-5 border border-border/50">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">YOUR REFERRAL LINK</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs text-primary bg-card/50 rounded-lg px-3 py-2 truncate font-body">{mainLink}</code>
                <Button size="sm" variant="outline" onClick={() => copyLink(mainLink, "main")}>
                  {copied === "main" ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Create Campaign */}
            <div className="glass-surface rounded-2xl p-5 border border-border/50">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">CREATE CAMPAIGN</p>
              <div className="flex gap-2">
                <Input value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Campaign name (e.g. Instagram Bio)" className="bg-card/50 border-border/50 font-body text-sm"
                />
                <Button onClick={handleCreateCampaign} disabled={creating || !newCampaignName.trim()} size="sm"
                  className="bg-accent text-accent-foreground font-display tracking-wider shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1" /> Create
                </Button>
              </div>
            </div>

            {/* Campaign List */}
            {campaigns.length > 0 && (
              <div className="glass-surface rounded-2xl p-5 border border-border/50">
                <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">YOUR CAMPAIGNS</p>
                <div className="space-y-3">
                  {campaigns.map((c: any) => {
                    const link = buildReferralLink(affiliate.slug, c.slug);
                    return (
                      <div key={c.id} className="flex items-center gap-3 bg-card/30 rounded-xl p-3">
                        <Link2 className="w-4 h-4 text-accent shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm text-foreground font-bold truncate">{c.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground truncate">{link}</p>
                        </div>
                        <div className="text-center px-2">
                          <p className="font-display text-sm font-black text-foreground">{c.clicks ?? 0}</p>
                          <p className="font-body text-[8px] text-muted-foreground">clicks</p>
                        </div>
                        <Button size="icon" variant="ghost" className="shrink-0 h-8 w-8"
                          onClick={() => copyLink(link, c.id)}
                        >
                          {copied === c.id ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="glass-surface rounded-2xl p-5 border border-border/50">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">
                BADGES ({earnedBadges.length}/{BADGE_DEFINITIONS.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BADGE_DEFINITIONS.map((badge) => {
                  const earned = earnedBadges.some((b) => b.id === badge.id);
                  return (
                    <div key={badge.id} className={`rounded-xl p-4 text-center border transition-all ${earned ? "bg-accent/5 border-accent/30" : "bg-card/20 border-border/20 opacity-40"}`}>
                      <span className="text-2xl block mb-2">{badge.icon}</span>
                      <p className="font-display text-xs font-bold text-foreground">{badge.name}</p>
                      <p className="font-body text-[9px] text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <div className="glass-surface rounded-2xl p-5 border border-border/50 space-y-4">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">SHARE TEMPLATES</p>
              {[
                { label: "Instagram Caption", text: `🌹 Discover your signature scent! I use @ThePerfumeLab to create custom luxury fragrances. Try it with my link: ${mainLink}` },
                { label: "WhatsApp Message", text: `Hey! 👋 I found this amazing perfume brand where you can create your own scent. Check it out: ${mainLink}` },
                { label: "Email Subject", text: `Discover Your Signature Scent — Exclusive Partner Link` },
              ].map((t) => (
                <div key={t.label} className="bg-card/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display text-xs font-bold text-foreground">{t.label}</span>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => copyLink(t.text, t.label)}>
                      {copied === t.label ? <CheckCircle className="w-3 h-3 mr-1 text-primary" /> : <Copy className="w-3 h-3 mr-1" />}
                      Copy
                    </Button>
                  </div>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
