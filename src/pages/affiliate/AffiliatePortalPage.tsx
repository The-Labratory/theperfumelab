import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import ParticleField from "@/components/ParticleField";
import lhLogo from "@/assets/lhariri-logo.png";
import { redirectAfterAuth } from "@/lib/affiliateRouting";

const AffiliatePortalPage = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      redirectAfterAuth(navigate);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      <ParticleField count={6} />

      {/* Language switcher top-right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full text-center space-y-8"
      >
        {/* Logo */}
        <img
          src={lhLogo}
          alt="Louis Hariri"
          className="h-14 w-auto mx-auto"
          loading="eager"
        />

        {/* Tagline */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground">
            {t("affiliatePortal.headline")}
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            {t("affiliatePortal.subline")}
          </p>
        </div>

        {/* Two primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            onClick={() => navigate("/auth?mode=signup&affiliate=true")}
            className="flex-1 bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90 py-6"
          >
            {t("affiliatePortal.signUp")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/auth?mode=login&affiliate=true")}
            className="flex-1 font-display tracking-wider text-sm py-6"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {t("affiliatePortal.signIn")}
          </Button>
        </div>

        {/* Clarifiers */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="glass-surface rounded-xl p-3 border border-border/50">
            <p className="font-display text-xs font-bold text-foreground mb-1">
              {t("affiliatePortal.signUpLabel")}
            </p>
            <p className="font-body text-[10px] text-muted-foreground">
              {t("affiliatePortal.signUpDesc")}
            </p>
          </div>
          <div className="glass-surface rounded-xl p-3 border border-border/50">
            <p className="font-display text-xs font-bold text-foreground mb-1">
              {t("affiliatePortal.signInLabel")}
            </p>
            <p className="font-body text-[10px] text-muted-foreground">
              {t("affiliatePortal.signInDesc")}
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex justify-center gap-4 text-[10px] text-muted-foreground font-body">
          <a href="/landing" className="hover:text-foreground transition-colors">
            {t("affiliatePortal.backToSite")}
          </a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">
            {t("affiliatePortal.privacy")}
          </a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">
            {t("affiliatePortal.terms")}
          </a>
        </div>

        <p className="font-body text-[10px] text-muted-foreground">
          {t("affiliatePortal.helpLine")}
        </p>
      </motion.div>
    </div>
  );
};

export default AffiliatePortalPage;
