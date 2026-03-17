import { motion } from "framer-motion";
import { Sparkles, Clock, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Props {
  displayName: string;
  onStart: () => void;
}

const StepWelcome = ({ displayName, onStart }: Props) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto text-center space-y-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8 text-accent" />
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground">
        {t("affiliateOnboarding.welcomeTitle", { name: displayName })}
      </h1>

      <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
        {t("affiliateOnboarding.welcomeSubtitle")}
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {[
          { icon: Clock, text: t("affiliateOnboarding.bullet1") },
          { icon: Trophy, text: t("affiliateOnboarding.bullet2") },
          { icon: Sparkles, text: t("affiliateOnboarding.bullet3") },
          { icon: Users, text: t("affiliateOnboarding.bullet4") },
        ].map((item) => (
          <div
            key={item.text}
            className="glass-surface rounded-xl p-3 border border-border/50 text-left flex items-start gap-2"
          >
            <item.icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span className="font-body text-xs text-foreground">{item.text}</span>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onStart}
        className="bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90 w-full max-w-sm"
      >
        {t("affiliateOnboarding.startCta")}
      </Button>
    </motion.div>
  );
};

export default StepWelcome;
