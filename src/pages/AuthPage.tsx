import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import ParticleField from "@/components/ParticleField";
import lhLogo from "@/assets/lhariri-logo.png";
import { validatePassword } from "@/lib/passwordValidation";

const PRODUCTION_ORIGIN = "https://theperfumelab.shop";

const PasswordRequirements = ({ password }: { password: string }) => {
  const checks = [
    { label: "8+ Zeichen / characters", ok: password.length >= 8 },
    { label: "Großbuchstabe / Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Kleinbuchstabe / Lowercase", ok: /[a-z]/.test(password) },
    { label: "Zahl / Number", ok: /[0-9]/.test(password) },
    { label: "Sonderzeichen / Special", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="mt-1 space-y-0.5">
      {checks.map((c) => (
        <p key={c.label} className={`text-[10px] ${c.ok ? "text-green-500" : "text-muted-foreground"}`}>
          {c.ok ? "✓" : "○"} {c.label}
        </p>
      ))}
    </div>
  );
};

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
  const isAffiliateFlow = searchParams.get("affiliate") === "true";
  const modeParam = searchParams.get("mode");
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  useEffect(() => {
    if (referralCode) setMode("signup");
    else if (modeParam === "signup") setMode("signup");
    else if (modeParam === "login") setMode("login");
  }, [referralCode, modeParam]);

  const getRedirectOrigin = () => {
    if (window.location.hostname === "theperfumelab.shop" || window.location.hostname === "www.theperfumelab.shop") {
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

  const handlePostAuthRedirect = async (userId: string, email?: string) => {
    await handleReferralAttribution(userId, email);
    await supabase.rpc("award_growth_credit", { _credit_type: "welcome_bonus" } as any);

    if (isAffiliateFlow) {
      const { redirectAfterAuth } = await import("@/lib/affiliateRouting");
      await redirectAfterAuth(navigate);
    } else {
      navigate(redirectTo, { replace: true });
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await handlePostAuthRedirect(session.user.id, session.user.email);
      }

      if (event === "SIGNED_OUT") {
        navigate("/auth", { replace: true });
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        if (isAffiliateFlow) {
          const { redirectAfterAuth } = await import("@/lib/affiliateRouting");
          await redirectAfterAuth(navigate);
        } else {
          navigate(redirectTo, { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isAffiliateFlow]);

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
        toast.success(t("auth.resetEmailSent"));
        setMode("login");
      } else if (mode === "signup") {
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
          toast.error(pwCheck.errors[0]);
          return;
        }
        const { data: signupData, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${getRedirectOrigin()}/dashboard` },
        });

        if (error) throw error;

        if (signupData.session?.user) {
          toast.success(t("auth.signedIn"));
          await handlePostAuthRedirect(signupData.session.user.id, signupData.session.user.email);
        } else {
          toast.success(t("auth.checkEmail"));
          navigate(`/auth/confirm?email=${encodeURIComponent(email)}`, { replace: true });
        }
      } else {
        const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        toast.success(t("auth.signedIn"));
        await handlePostAuthRedirect(loginData.user.id, loginData.user.email);
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Invalid login")) {
        toast.error(t("auth.invalidLogin"));
      } else if (msg.includes("already registered") || msg.includes("already been registered")) {
        toast.error(t("auth.alreadyRegistered"));
      } else if (msg.includes("Email not confirmed")) {
        toast.error(t("auth.emailNotConfirmed"));
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
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src={lhLogo} alt="Louis Hariri" className="h-12 w-auto" />
          <h1 className="text-xl font-display font-bold text-foreground">
            {mode === "login" ? t("auth.signInCta") : mode === "signup" ? t("auth.signUpCta") : t("auth.resetPassword")}
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
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="mt-1" />
              {mode === "signup" && <PasswordRequirements password={password} />}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full font-display tracking-wider">
            {loading ? "…" : mode === "login" ? t("auth.signIn") : mode === "signup" ? t("auth.signUp") : t("auth.sendResetLink")}
          </Button>
        </form>

        {mode === "login" && (
          <button onClick={() => setMode("forgot")} className="text-xs text-primary underline mt-3 block w-full text-center">
            {t("auth.forgotPassword")}
          </button>
        )}

        {mode === "forgot" && (
          <button onClick={() => setMode("login")} className="text-xs text-primary underline mt-3 block w-full text-center">
            {t("auth.backToSignIn")}
          </button>
        )}

        {mode !== "forgot" && (
          <>
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">{t("auth.or")}</span></div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 font-display tracking-wider text-xs"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: `${getRedirectOrigin()}${redirectTo}`,
                  },
                });
                if (error) toast.error(error.message);
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {t("auth.google")}
            </Button>
          </>
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
