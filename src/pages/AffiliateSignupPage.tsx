import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, CheckCircle, ArrowRight, Copy, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COUNTRIES = [
  "Germany", "Austria", "Switzerland", "Turkey", "Lebanon", "United States",
  "United Kingdom", "France", "Netherlands", "Sweden", "Denmark", "Norway",
  "Italy", "Spain", "Canada", "Australia", "United Arab Emirates", "Saudi Arabia", "Other"
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner — I'm new to affiliate marketing" },
  { value: "intermediate", label: "Intermediate — I've done some promotions" },
  { value: "advanced", label: "Advanced — I run campaigns regularly" },
  { value: "influencer", label: "Creator/Influencer — I have an active audience" },
];

const AffiliateSignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [affiliateData, setAffiliateData] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    country: "",
    experience: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.country || !form.experience) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        // Sign up the user first
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: crypto.randomUUID().slice(0, 16) + "Aa1!", // Temporary password
          options: {
            data: { full_name: form.name.trim() },
          },
        });

        if (authErr) {
          if (authErr.message?.includes("already registered")) {
            toast.error("This email is already registered. Please log in first.", {
              action: { label: "Log in", onClick: () => navigate("/auth") },
            });
            setSubmitting(false);
            return;
          }
          throw authErr;
        }

        // User created but needs email verification — we'll still create the affiliate record
        if (authData.user) {
          const { data, error } = await supabase
            .from("affiliate_partners")
            .insert({
              user_id: authData.user.id,
              display_name: form.name.trim().slice(0, 200),
              email: form.email.trim().slice(0, 255),
              phone: null,
              company_name: [form.instagram, form.tiktok, form.youtube].filter(Boolean).join(", ").slice(0, 200) || null,
            })
            .select()
            .single();

          if (error) throw error;
          setAffiliateData(data);
          setStep("success");
          // Redirect to personalized onboarding
          if (data.slug) {
            setTimeout(() => navigate(`/affiliate/${data.slug}/welcome`), 2000);
          }
        }
      } else {
        // Already logged in
        const { data, error } = await supabase
          .from("affiliate_partners")
          .insert({
            user_id: session.user.id,
            display_name: form.name.trim().slice(0, 200),
            email: form.email.trim().slice(0, 255),
            company_name: [form.instagram, form.tiktok, form.youtube].filter(Boolean).join(", ").slice(0, 200) || null,
            social_links: { instagram: form.instagram || null, tiktok: form.tiktok || null, youtube: form.youtube || null },
          } as any)
          .select()
          .single();

        if (error) {
          if (error.message?.includes("duplicate")) {
            toast.error("You already have an affiliate account.", {
              action: { label: "Go to Dashboard", onClick: () => navigate("/affiliate") },
            });
            setSubmitting(false);
            return;
          }
          throw error;
        }
        setAffiliateData(data);
        setStep("success");
        // Redirect to personalized onboarding
        if ((data as any).slug) {
          setTimeout(() => navigate(`/affiliate/${(data as any).slug}/welcome`), 2000);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const referralLink = affiliateData
    ? `https://www.lenzohariri.com?ref=${affiliateData.referral_code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={8} />

      <div className="relative z-10 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 max-w-xl mx-auto">
        {step === "form" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-7 h-7 text-accent" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
                Join the Partner Program
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Start earning 50% B2C or 20% B2B commission today. It's free and takes 60 seconds.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="glass-surface rounded-2xl p-6 sm:p-8 border border-border/50 space-y-5">
              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => handleChange("name", e.target.value)}
                  placeholder="Your full name"
                  maxLength={200}
                  required
                  className="bg-card/50 border-border/50 font-body"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  maxLength={255}
                  required
                  className="bg-card/50 border-border/50 font-body"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">Country *</Label>
                <Select value={form.country} onValueChange={v => handleChange("country", v)}>
                  <SelectTrigger className="bg-card/50 border-border/50 font-body">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">Experience Level *</Label>
                <Select value={form.experience} onValueChange={v => handleChange("experience", v)}>
                  <SelectTrigger className="bg-card/50 border-border/50 font-body">
                    <SelectValue placeholder="Select your experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map(l => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">SOCIAL MEDIA (OPTIONAL)</p>
                <div className="space-y-3">
                  <Input
                    value={form.instagram}
                    onChange={e => handleChange("instagram", e.target.value)}
                    placeholder="Instagram handle"
                    maxLength={100}
                    className="bg-card/50 border-border/50 font-body text-sm"
                  />
                  <Input
                    value={form.tiktok}
                    onChange={e => handleChange("tiktok", e.target.value)}
                    placeholder="TikTok handle"
                    maxLength={100}
                    className="bg-card/50 border-border/50 font-body text-sm"
                  />
                  <Input
                    value={form.youtube}
                    onChange={e => handleChange("youtube", e.target.value)}
                    placeholder="YouTube channel"
                    maxLength={100}
                    className="bg-card/50 border-border/50 font-body text-sm"
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting}
                className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm py-6 hover:bg-accent/90"
              >
                {submitting ? "Creating your account..." : "Create My Affiliate Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-center font-body text-[10px] text-muted-foreground">
                Already a partner?{" "}
                <button type="button" onClick={() => navigate("/affiliate")} className="text-primary hover:underline">
                  Go to Dashboard
                </button>
              </p>
            </form>
          </motion.div>
        )}

        {step === "success" && affiliateData && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
              Welcome, Partner! 🎉
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-8">
              Your affiliate account is ready. Check your email to verify and set your password.
            </p>

            <div className="glass-surface rounded-2xl p-6 border border-border/50 mb-6 text-left space-y-4">
              <div>
                <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-1">YOUR AFFILIATE ID</p>
                <p className="font-display text-sm text-foreground font-bold tracking-wider">{affiliateData.referral_code}</p>
              </div>

              <div>
                <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-1">YOUR REFERRAL LINK</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-primary bg-card/50 rounded-lg px-3 py-2 truncate font-body">
                    {referralLink}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0">
                    {copied ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-1">COMMISSION RATE</p>
                <p className="font-display text-lg font-black text-accent">20%</p>
                <p className="font-body text-[10px] text-muted-foreground">Grow to 50% as Platinum</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate("/affiliate")}
                className="flex-1 bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90"
              >
                Open Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={() => navigate("/affiliate-starter-pack")} variant="outline"
                className="flex-1 font-display tracking-wider text-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Get Starter Pack
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AffiliateSignupPage;
