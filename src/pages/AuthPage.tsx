import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

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
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: getRedirectOrigin() } });
        if (error) throw error;
        toast.success(t("auth.checkEmail"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.signedIn"));
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
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
