import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";

const PASS_THRESHOLD = 0.8;

// Question keys per module — maps to i18n keys training.q1..q6
const MODULE_KEYS = [
  { titleKey: "training.moduleBrand", questionKeys: ["1", "2"] },
  { titleKey: "training.moduleCustomer", questionKeys: ["3", "4"] },
  { titleKey: "training.modulePlatform", questionKeys: ["5", "6"] },
];
// All correct answers are option index 1 (the second option)
const CORRECT_INDEX = 1;

export default function TrainingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [moduleIdx, setModuleIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [passed, setPassed] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentModule = MODULE_KEYS[moduleIdx];
  const currentQKey = currentModule?.questionKeys[questionIdx];
  const totalQuestions = MODULE_KEYS.reduce((s, m) => s + m.questionKeys.length, 0);
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100);

  const getOptions = (qKey: string) => [
    t(`training.q${qKey}o1`),
    t(`training.q${qKey}o2`),
    t(`training.q${qKey}o3`),
    t(`training.q${qKey}o4`),
  ];

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    if (idx === CORRECT_INDEX) setCorrectCount((c) => c + 1);
    setTotalAnswered((t) => t + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);

    if (questionIdx < currentModule.questionKeys.length - 1) {
      setQuestionIdx((q) => q + 1);
    } else if (moduleIdx < MODULE_KEYS.length - 1) {
      setModuleIdx((m) => m + 1);
      setQuestionIdx(0);
    } else {
      const score = correctCount / totalQuestions;
      setPassed(score >= PASS_THRESHOLD);
      setCompleted(true);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from("profiles").update({ training_completed: true } as any).eq("user_id", session.user.id);
    }
    setSaving(false);
    toast.success(t("training.complete"));
    navigate("/dashboard", { replace: true });
  };

  const handleRetry = () => {
    setModuleIdx(0);
    setQuestionIdx(0);
    setSelected(null);
    setShowFeedback(false);
    setCorrectCount(0);
    setTotalAnswered(0);
    setCompleted(false);
    setPassed(false);
  };

  const scorePct = Math.round((correctCount / totalQuestions) * 100);

  if (completed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ParticleField count={10} />
        <div className="min-h-screen flex items-center justify-center px-6 pt-16">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full text-center">
            {passed ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="font-display text-2xl font-black tracking-wider text-foreground mb-2">{t("training.passedTitle")}</h2>
                <p className="text-muted-foreground font-body mb-2">
                  {t("training.passedScore", { correct: correctCount, total: totalQuestions, pct: scorePct })}
                </p>
                <p className="text-sm text-muted-foreground font-body mb-8">{t("training.passedMessage")}</p>
                <Button onClick={handleFinish} disabled={saving} size="lg" className="font-display tracking-wider">
                  {saving ? t("training.saving") : t("training.enterDashboard")} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="font-display text-2xl font-black tracking-wider text-foreground mb-2">{t("training.failedTitle")}</h2>
                <p className="text-muted-foreground font-body mb-2">
                  {t("training.passedScore", { correct: correctCount, total: totalQuestions, pct: scorePct })}
                </p>
                <p className="text-sm text-muted-foreground font-body mb-8">{t("training.failedMessage")}</p>
                <Button onClick={handleRetry} size="lg" variant="outline" className="font-display tracking-wider">
                  {t("training.retryTraining")}
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const options = getOptions(currentQKey);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div key={`${moduleIdx}-${questionIdx}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="max-w-lg w-full">
          <div className="text-center mb-8">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-1">{t("training.pageTitle")}</h2>
            <p className="text-xs text-muted-foreground font-body">
              {t("training.module", { current: moduleIdx + 1, total: MODULE_KEYS.length, title: t(currentModule.titleKey) })}
            </p>
            <Progress value={progressPct} className="mt-4 h-2" />
          </div>

          <div className="glass-surface rounded-2xl p-6 border border-border/30">
            <p className="font-display text-base font-semibold text-foreground mb-6">{t(`training.q${currentQKey}`)}</p>
            <div className="space-y-3">
              {options.map((opt, idx) => {
                let border = "border-border/30";
                if (showFeedback && idx === CORRECT_INDEX) border = "border-green-500 bg-green-500/10";
                else if (showFeedback && idx === selected && idx !== CORRECT_INDEX) border = "border-destructive bg-destructive/10";

                return (
                  <motion.button
                    key={idx}
                    whileHover={!showFeedback ? { scale: 1.01 } : {}}
                    whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border ${border} transition-colors font-body text-sm text-foreground`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>

            {showFeedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                <p className={`text-sm font-display font-bold mb-3 ${selected === CORRECT_INDEX ? "text-green-500" : "text-destructive"}`}>
                  {selected === CORRECT_INDEX ? t("training.correct") : t("training.incorrect")}
                </p>
                <Button onClick={handleNext} className="font-display tracking-wider">
                  {questionIdx < currentModule.questionKeys.length - 1
                    ? t("training.nextQuestion")
                    : moduleIdx < MODULE_KEYS.length - 1
                    ? t("training.nextModule")
                    : t("training.seeResults")}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
