import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, ArrowRight, CheckCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onComplete: () => void;
}

const StepMathModule = ({ onComplete }: Props) => {
  const { t } = useTranslation();
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [showPractice, setShowPractice] = useState(false);

  const normalizeNumeric = (val: string) => {
    return parseFloat(val.replace(",", "."));
  };

  const isPracticeCorrect = Math.abs(normalizeNumeric(practiceAnswer) - 3) <= 0.01;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <Calculator className="w-10 h-10 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-1">
          {t("mathModule.title")}
        </h2>
        <p className="font-body text-xs text-muted-foreground">
          {t("mathModule.subtitle")}
        </p>
        <p className="font-body text-[10px] text-muted-foreground/60 mt-1">
          {t("mathModule.duration")}
        </p>
      </div>

      {/* Key Learning Points */}
      <div className="glass-surface rounded-2xl p-5 border border-border/50 space-y-4">
        <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-accent" />
          {t("mathModule.keyPoints")}
        </h3>

        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="font-display text-xs font-bold text-accent bg-accent/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                {i}
              </span>
              <p className="font-body text-sm text-foreground/90">
                {t(`mathModule.point${i}`)}
              </p>
            </div>
          ))}
        </div>

        {/* Worked Example */}
        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mt-4">
          <p className="font-display text-xs font-bold text-accent mb-2">
            {t("mathModule.exampleTitle")}
          </p>
          <p className="font-body text-sm text-foreground/90">
            {t("mathModule.exampleCalc")}
          </p>
        </div>
      </div>

      {/* Infographic */}
      <div className="glass-surface rounded-2xl p-5 border border-border/50">
        <p className="font-display text-xs font-bold text-foreground mb-3">
          {t("mathModule.infographicTitle")}
        </p>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-center">
            <p className="font-display text-lg font-black text-primary">€60</p>
            <p className="font-body text-[10px] text-muted-foreground">{t("mathModule.retailPrice")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2 text-center">
            <p className="font-display text-lg font-black text-orange-500">€24</p>
            <p className="font-body text-[10px] text-muted-foreground">{t("mathModule.shopShare")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-center">
            <p className="font-display text-lg font-black text-blue-500">€36</p>
            <p className="font-body text-[10px] text-muted-foreground">{t("mathModule.companyRemainder")}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-center">
            <p className="font-display text-lg font-black text-accent">€3.60</p>
            <p className="font-body text-[10px] text-muted-foreground">{t("mathModule.affiliateEarning")}</p>
          </div>
        </div>
      </div>

      {/* Micro-practice */}
      <div className="glass-surface rounded-2xl p-5 border border-border/50">
        <p className="font-display text-xs font-bold text-foreground mb-2">
          {t("mathModule.practiceTitle")}
        </p>
        <p className="font-body text-sm text-foreground/90 mb-3">
          {t("mathModule.practiceQuestion")}
        </p>

        {!showPractice ? (
          <Button
            onClick={() => setShowPractice(true)}
            variant="outline"
            className="w-full font-display tracking-wider text-sm"
          >
            {t("mathModule.tryIt")}
          </Button>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="€..."
                  value={practiceAnswer}
                  onChange={(e) => setPracticeAnswer(e.target.value)}
                  disabled={practiceSubmitted}
                  className="font-body"
                  aria-label={t("mathModule.practiceInputLabel")}
                />
                {!practiceSubmitted && (
                  <Button
                    onClick={() => setPracticeSubmitted(true)}
                    disabled={!practiceAnswer.trim()}
                    className="bg-accent text-accent-foreground font-display tracking-wider text-sm"
                  >
                    {t("mathModule.check")}
                  </Button>
                )}
              </div>

              {practiceSubmitted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-xl p-3 border ${
                    isPracticeCorrect
                      ? "bg-green-500/5 border-green-500/30"
                      : "bg-red-500/5 border-red-500/30"
                  }`}
                >
                  <p className="font-body text-sm">
                    {isPracticeCorrect
                      ? t("mathModule.practiceCorrect")
                      : t("mathModule.practiceIncorrect")}
                  </p>
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    {t("mathModule.practiceExplanation")}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Continue button */}
      <Button
        onClick={onComplete}
        className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm h-12"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        {t("mathModule.continueCta")}
      </Button>
    </motion.div>
  );
};

export default StepMathModule;
