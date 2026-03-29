import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import ParticleField from "@/components/ParticleField";

const PRODUCTION_ORIGIN = "https://theperfumelab.de";

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const processedReferralFor = useRef<string | null>(null);

  const referralCode = searchParams.get("ref") || "";

  useEffect(() => {
    if (referralCode) setMode("signup");
  }, [referralCode]);

  const getRedirectOrigin = () => {
    if (window.location.hostname === "theperfumelab.de" || window.location.hostname === "www.theperfumelab.de") {
      return PRODUCTION_ORIGIN;
    }
    return window.location.origin;
  };

  const handleReferralAttribution = async (userId: string, userEmail?: string) => {
    if (!referralCode || processedReferralFor.current === userId) return;
    processedReferralFor.current = userId;

    await Promise.allSettled([
      supabase.rpc("apply_referral_signup", {
        _new_user_id: userId,
        _referral_code: referralCode,
        _referred_email: userEmail ?? null,
      } as any),
      supabase.rpc("process_referral_signup", {
        _new_user_id: userId,
        _referral_code: referralCode,
      }),
    ]);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await handleReferralAttribution(session.user.id, session.user.email);
        await supabase.rpc("award_growth_credit", { _credit_type: "welcome_bonus" } as any);
        navigate("/dashboard", { replace: true });
      }

      if (event === "SIGNED_OUT") {
        navigate("/auth", { replace: true });
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await handleReferralAttribution(session.user.id, session.user.email);
        navigate("/dashboard", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${getRedirectOrigin()}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for a password reset link");
        setMode("login");
      } else if (mode === "signup") {
        const { data: signupData, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${getRedirectOrigin()}/dashboard` },
        });

        if (error) throw error;

        if (signupData.session?.user) {
          await handleReferralAttribution(signupData.session.user.id, signupData.session.user.email);
          await supabase.rpc("award_growth_credit", { _credit_type: "welcome_bonus" } as any);
          toast.success(t("auth.signedIn"));
          navigate("/dashboard", { replace: true });
        } else {
          toast.success(t("auth.checkEmail"));
          navigate(`/auth/confirm?email=${encodeURIComponent(email)}`, { replace: true });
        }
      } else {
        const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (loginData.user) {
          await handleReferralAttribution(loginData.user.id, loginData.user.email);
        }

        toast.success(t("auth.signedIn"));
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Invalid login")) {
        toast.error("Invalid email or password. Please try again.");
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        toast.error("This email is already registered. Try signing in instead.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Please confirm your email before signing in. Check your inbox.");
      } else {
        toast.error(msg || t("auth.error"));
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
      <ParticleField count={8} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-surface rounded-2xl p-8 max-w-sm w-full relative z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display font-bold text-foreground">
            {mode === "login" ? t("auth.signInCta") : mode === "signup" ? t("auth.signUpCta") : "Reset Password"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-muted-foreground text-xs">{t("auth.email")}</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
          </div>
          {mode !== "forgot" && (
            <div>
              <Label htmlFor="password" className="text-muted-foreground text-xs">{t("auth.password")}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="mt-1" />
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full font-display tracking-wider">
            {loading ? "…" : mode === "login" ? t("auth.signIn") : mode === "signup" ? t("auth.signUp") : "Send Reset Link"}
          </Button>
        </form>

        {mode === "login" && (
          <button onClick={() => setMode("forgot")} className="text-xs text-primary underline mt-3 block w-full text-center">
            Forgot password?
          </button>
        )}

        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-xs text-primary underline mt-3 block w-full text-center">
            ← Back to sign in
          </button>
        )}


        {mode !== "forgot" && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            {mode === "login" ? t("auth.noAccount") + " " : t("auth.hasAccount") + " "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-primary underline">
              {mode === "login" ? t("auth.signUp") : t("auth.signIn")}
            </button>
          </p>
        )}

        <div className="mt-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/landing")} className="w-full text-muted-foreground text-xs gap-2">
            <ArrowLeft className="w-3 h-3" /> {t("auth.backToSite")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
