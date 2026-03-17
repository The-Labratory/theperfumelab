import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import GlowOrb from "@/components/GlowOrb";
import { supabase } from "@/integrations/supabase/client";

// Questions use i18n keys - rendered in component
const questionKeys = [
  {
    story: "onboarding.story1",
    question: "onboarding.question1",
    options: [
      { labelKey: "onboarding.opt1a", emoji: "🌿", value: "green" },
      { labelKey: "onboarding.opt1b", emoji: "🌸", value: "floral" },
      { labelKey: "onboarding.opt1c", emoji: "🌲", value: "woody" },
      { labelKey: "onboarding.opt1d", emoji: "💧", value: "fresh" },
    ],
  },
  {
    story: "onboarding.story2",
    question: "onboarding.question2",
    options: [
      { labelKey: "onboarding.opt2a", emoji: "🔥", value: "spicy" },
      { labelKey: "onboarding.opt2b", emoji: "🌊", value: "aquatic" },
      { labelKey: "onboarding.opt2c", emoji: "🌙", value: "oriental" },
      { labelKey: "onboarding.opt2d", emoji: "⚡", value: "citrus" },
    ],
  },
  {
    story: "onboarding.story3",
    question: "onboarding.question3",
    options: [
      { labelKey: "onboarding.opt3a", emoji: "🕯️", value: "gourmand" },
      { labelKey: "onboarding.opt3b", emoji: "✨", value: "fresh" },
      { labelKey: "onboarding.opt3c", emoji: "📖", value: "woody" },
      { labelKey: "onboarding.opt3d", emoji: "🌅", value: "floral" },
    ],
  },
  {
    story: "onboarding.story4",
    question: "onboarding.question4",
    options: [
      { labelKey: "onboarding.opt4a", emoji: "🧣", value: "oriental" },
      { labelKey: "onboarding.opt4b", emoji: "🪨", value: "woody" },
      { labelKey: "onboarding.opt4c", emoji: "🔮", value: "aquatic" },
      { labelKey: "onboarding.opt4d", emoji: "🍯", value: "gourmand" },
    ],
  },
];

const personalityKeys: Record<string, { nameKey: string; emoji: string; family: string; descKey: string }> = {
  green: { nameKey: "onboarding.forestSage", emoji: "🌿", family: "Green / Herbal", descKey: "onboarding.forestSageDesc" },
  floral: { nameKey: "onboarding.bloomEnchanter", emoji: "🌸", family: "Floral", descKey: "onboarding.bloomEnchanterDesc" },
  woody: { nameKey: "onboarding.emberGuardian", emoji: "🔥", family: "Woody / Spicy", descKey: "onboarding.emberGuardianDesc" },
  fresh: { nameKey: "onboarding.azureVoyager", emoji: "🌊", family: "Aquatic / Fresh", descKey: "onboarding.azureVoyagerDesc" },
  spicy: { nameKey: "onboarding.flameAlchemist", emoji: "⚡", family: "Spicy / Oriental", descKey: "onboarding.flameAlchemistDesc" },
  aquatic: { nameKey: "onboarding.azureVoyager", emoji: "🌊", family: "Aquatic / Fresh", descKey: "onboarding.azureVoyagerDesc" },
  oriental: { nameKey: "onboarding.nocturneWeaver", emoji: "🌙", family: "Oriental / Gourmand", descKey: "onboarding.nocturneWeaverDesc" },
  citrus: { nameKey: "onboarding.solarRadiant", emoji: "☀️", family: "Citrus", descKey: "onboarding.solarRadiantDesc" },
  gourmand: { nameKey: "onboarding.nocturneWeaver", emoji: "🌙", family: "Oriental / Gourmand", descKey: "onboarding.nocturneWeaverDesc" },
};

const OnboardingPage = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [completing, setCompleting] = useState(false);
  const navigate = useNavigate();

  const markOnboardingComplete = async () => {
    setCompleting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({ onboarding_completed: true } as any).eq("user_id", session.user.id);
    }
    setCompleting(false);
  };

  const handleSelect = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < questionKeys.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const getDominantTrait = () => {
    const counts: Record<string, number> = {};
    answers.forEach((a) => {
      counts[a] = (counts[a] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "woody";
  };

  const resultData = personalityKeys[getDominantTrait()];
  const dnaCode = `SCN-${answers.map(a => a[0]?.toUpperCase()).join("")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <ParticleField count={15} />

      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg w-full text-center"
            >
              {/* Progress */}
              <div className="flex gap-2 justify-center mb-12">
                {questionKeys.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-12 rounded-full transition-colors ${
                      i <= step ? "bg-primary glow-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-primary/70 font-body italic mb-6">
                {t(questionKeys[step].story)}
              </p>

              <h2 className="font-display text-xl md:text-2xl font-bold tracking-wide mb-10 text-foreground">
                {t(questionKeys[step].question)}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {questionKeys[step].options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(opt.value)}
                    className="glass-surface rounded-xl px-6 py-4 text-left flex items-center gap-4 hover:border-primary/40 transition-all group"
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-body text-base text-foreground group-hover:text-primary transition-colors">
                      {t(opt.labelKey)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg w-full text-center"
            >
              <GlowOrb className="w-40 h-40 mx-auto mb-8" />

              <p className="text-6xl mb-4">{resultData.emoji}</p>

              <h2 className="font-display text-2xl md:text-3xl font-black tracking-wider mb-2 gradient-text">
                {t(resultData.nameKey)}
              </h2>

              <p className="text-sm text-primary/70 font-display tracking-widest mb-6 uppercase">
                {resultData.family}
              </p>

              <p className="text-muted-foreground font-body leading-relaxed mb-8">
                {t(resultData.descKey)}
              </p>

              <div className="glass-surface rounded-xl p-4 mb-8 inline-block">
                <p className="text-xs text-muted-foreground font-body mb-1">{t("onboarding.dnaCode")}</p>
                <p className="font-display text-lg tracking-[0.2em] text-primary">
                  {dnaCode}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  disabled={completing}
                  className="glow-primary font-display tracking-wider text-sm"
                  onClick={async () => {
                    await markOnboardingComplete();
                    navigate("/dashboard");
                  }}
                >
                  {completing ? "…" : t("onboarding.enterLab")} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  disabled={completing}
                  className="font-display tracking-wider text-sm border-border hover:border-primary/50"
                  onClick={async () => {
                    await markOnboardingComplete();
                    navigate("/worlds");
                  }}
                >
                  {t("onboarding.exploreWorlds")}
                </Button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
