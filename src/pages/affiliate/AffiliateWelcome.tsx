import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Circle, ArrowRight, Sparkles, Upload, Type, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { getMyAffiliate, updateAffiliateProfile, completeOnboarding, type AffiliateProfile } from "@/lib/affiliates";
import { ONBOARDING_STEPS, calculateLevel, awardPoints } from "@/lib/gamification";
import { toast } from "sonner";

const AffiliateWelcome = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [headline, setHeadline] = useState("");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    getMyAffiliate().then((data) => {
      if (!data || data.slug !== slug) { navigate("/auth"); return; }
      setAffiliate(data);
      setBio(data.bio || "");
      setInstagram((data.social_links as any)?.instagram || "");
      setTiktok((data.social_links as any)?.tiktok || "");
      setHeadline(data.landing_headline || "");
      
      // Pre-mark completed steps
      const done = new Set<string>();
      if (data.avatar_url) done.add("profile_photo");
      if (data.bio) done.add("bio");
      if (data.social_links && Object.values(data.social_links).some(Boolean)) done.add("social_links");
      if (data.landing_headline) done.add("customize_landing");
      setCompletedSteps(done);
      setLoading(false);
    });
  }, [slug, navigate]);

  const progress = Math.round((completedSteps.size / ONBOARDING_STEPS.length) * 100);
  const level = affiliate ? calculateLevel(affiliate.points) : null;

  const handleSaveProfile = async () => {
    if (!affiliate) return;
    try {
      const socialLinks = { instagram, tiktok };
      await updateAffiliateProfile(affiliate.id, {
        bio, social_links: socialLinks, landing_headline: headline,
      });
      
      const newCompleted = new Set(completedSteps);
      if (bio) newCompleted.add("bio");
      if (instagram || tiktok) newCompleted.add("social_links");
      if (headline) newCompleted.add("customize_landing");
      
      // Award points for newly completed steps
      for (const stepId of newCompleted) {
        if (!completedSteps.has(stepId)) {
          const step = ONBOARDING_STEPS.find((s) => s.id === stepId);
          if (step) await awardPoints(affiliate.id, `onboarding_${stepId}`, step.points);
        }
      }
      setCompletedSteps(newCompleted);
      toast.success("Profile saved! 🎉");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleFinish = async () => {
    if (!affiliate) return;
    await handleSaveProfile();
    await completeOnboarding(affiliate.id);
    await awardPoints(affiliate.id, "onboarding_complete", 50);
    toast.success("Welcome aboard! 🚀");
    navigate(`/affiliate/${slug}/dashboard`);
  };

  if (loading || !affiliate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
              Welcome, {affiliate.display_name}! 🎉
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Complete these steps to set up your affiliate profile and start earning.
            </p>
          </div>

          {/* Level + Progress */}
          {level && (
            <div className="glass-surface rounded-2xl p-4 border border-border/50 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-xs tracking-widest text-muted-foreground">
                  LEVEL {level.level} — {level.title}
                </span>
                <span className="font-display text-xs text-accent font-bold">{affiliate.points} pts</span>
              </div>
              <Progress value={level.progress} className="h-2" />
            </div>
          )}

          {/* Onboarding Progress */}
          <div className="glass-surface rounded-2xl p-4 border border-border/50 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xs tracking-widest text-muted-foreground">SETUP PROGRESS</span>
              <span className="font-display text-sm font-bold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="space-y-2">
              {ONBOARDING_STEPS.map((step) => (
                <div key={step.id} className="flex items-center gap-3">
                  {completedSteps.has(step.id) ? (
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className={`font-body text-sm ${completedSteps.has(step.id) ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {step.label}
                  </span>
                  <span className="ml-auto font-display text-[10px] text-accent">+{step.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="glass-surface rounded-2xl p-6 border border-border/50 space-y-5">
            <div className="space-y-2">
              <label className="font-display text-xs tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Bio
              </label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell people about yourself..." rows={3}
                className="bg-card/50 border-border/50 font-body text-sm" maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <label className="font-display text-xs tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Social Links
              </label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Instagram handle"
                className="bg-card/50 border-border/50 font-body text-sm" />
              <Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="TikTok handle"
                className="bg-card/50 border-border/50 font-body text-sm" />
            </div>

            <div className="space-y-2">
              <label className="font-display text-xs tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Landing Page Headline
              </label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Your custom headline for visitors"
                className="bg-card/50 border-border/50 font-body text-sm" maxLength={200}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveProfile} variant="outline" className="flex-1 font-display tracking-wider text-sm">
                Save Progress
              </Button>
              <Button onClick={handleFinish} className="flex-1 bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90">
                Finish & Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateWelcome;
