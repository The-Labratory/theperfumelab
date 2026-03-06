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
