import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, LogIn, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ParticleField from "@/components/ParticleField";
import { toast } from "sonner";

type Mode = "password" | "magic";

const AuthPage = () => {
  const { signIn, signInWithMagicLink, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  // Already logged in — redirect immediately
  if (!loading && user) {
    navigate(from, { replace: true });
    return null;
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Sign-in failed. Check your credentials.");
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const { error } = await signInWithMagicLink(email.trim());
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not send magic link.");
    } else {
      setMagicSent(true);
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const PRODUCTION_ORIGIN = "https://theperfumelab.de";

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const referralCode = searchParams.get("ref") || "";
  const redirectTo = searchParams.get("redirect") || "/";

  useEffect(() => {
    // If there's a referral code, default to signup mode
    if (referralCode) setMode("signup");

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // If signed in and has referral code, process it then redirect
        if (referralCode) {
          supabase.rpc("process_referral_signup", {
            _new_user_id: session.user.id,
            _referral_code: referralCode,
          }).then(({ data }) => {
            const result = data as any;
            if (result?.success) toast.success("You've been linked to your inviter's network!");
            navigate(redirectTo);
          });
        } else {
          navigate(redirectTo);
        }
      }
    });
  }, [navigate, referralCode, redirectTo]);

  const getRedirectOrigin = () => {
    if (window.location.hostname === "theperfumelab.de" || window.location.hostname === "www.theperfumelab.de") {
      return PRODUCTION_ORIGIN;
    }
    return window.location.origin;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const { data: signupData, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: getRedirectOrigin() } });
        if (error) throw error;
        // If auto-confirmed and we have a referral code, process it
        if (signupData.user && referralCode) {
          await supabase.rpc("process_referral_signup", {
            _new_user_id: signupData.user.id,
            _referral_code: referralCode,
          });
        }
        toast.success(t("auth.checkEmail"));
      } else {
        const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Process referral on login if code present and not yet linked
        if (loginData.user && referralCode) {
          await supabase.rpc("process_referral_signup", {
            _new_user_id: loginData.user.id,
            _referral_code: referralCode,
          });
        }
        toast.success(t("auth.signedIn"));
        navigate(redirectTo);
      }
    } catch (err: any) {
      toast.error(err.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <ParticleField count={8} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-wider gradient-text">
            SCENTRA
          </h1>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Staff & Admin Access
          </p>
        </div>

        <div className="glass-surface rounded-2xl p-6 sm:p-8">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-border mb-6">
            <button
              onClick={() => { setMode("password"); setMagicSent(false); }}
              className={`flex-1 py-2 text-xs font-display tracking-wide transition-all ${
                mode === "password"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Password
            </button>
            <button
              onClick={() => { setMode("magic"); setMagicSent(false); }}
              className={`flex-1 py-2 text-xs font-display tracking-wide transition-all ${
                mode === "magic"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Magic Link
            </button>
          </div>

          {mode === "password" && (
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className="text-[10px] font-display tracking-wider text-muted-foreground uppercase block mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@scentra.com"
                    className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-display tracking-wider text-muted-foreground uppercase block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full glow-primary font-display tracking-wider text-sm mt-2"
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          )}

          {mode === "magic" && !magicSent && (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="text-[10px] font-display tracking-wider text-muted-foreground uppercase block mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@scentra.com"
                    className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                variant="outline"
                className="w-full font-display tracking-wider text-sm mt-2"
                size="lg"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? "Sending…" : "Send Magic Link"}
              </Button>
            </form>
          )}

          {mode === "magic" && magicSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="text-3xl mb-3">✉️</div>
              <p className="font-body text-sm text-foreground mb-1">
                Check your inbox
              </p>
              <p className="font-body text-xs text-muted-foreground">
                A sign-in link was sent to <span className="text-primary">{email}</span>
              </p>
            </motion.div>
          )}
        </div>

        <p className="text-center text-[10px] text-muted-foreground font-body mt-4">
          This portal is for authorised staff only.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-surface rounded-2xl p-8 max-w-sm w-full"
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
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: getRedirectOrigin(),
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
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="w-full text-muted-foreground text-xs gap-2">
            <ArrowLeft className="w-3 h-3" /> {t("auth.backToSite")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
