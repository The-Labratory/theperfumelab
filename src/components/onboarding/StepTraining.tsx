import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TRAINING_MODULES, QUIZ_PASS_THRESHOLD } from "@/lib/affiliateOnboarding";

interface Props {
  onComplete: (scores: Record<string, number>, passed: boolean) => void;
}

const StepTraining = ({ onComplete }: Props) => {
  const { t } = useTranslation();
  const [moduleIdx, setModuleIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [moduleCorrect, setModuleCorrect] = useState(0);
  const [moduleTotal, setModuleTotal] = useState(0);

  const currentModule = TRAINING_MODULES[moduleIdx];
  const currentQuestion = currentModule?.questions[questionIdx];

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === currentQuestion.correct) {
      setModuleCorrect((c) => c + 1);
    }
    setModuleTotal((t) => t + 1);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);

    if (questionIdx < currentModule.questions.length - 1) {
      setQuestionIdx((q) => q + 1);
    } else {
      const score = moduleCorrect / currentModule.questions.length;
      const newScores = { ...scores, [currentModule.id]: score };
      setScores(newScores);
      setModuleCorrect(0);
      setModuleTotal(0);

      if (moduleIdx < TRAINING_MODULES.length - 1) {
        setModuleIdx((m) => m + 1);
        setQuestionIdx(0);
      } else {
        const totalCorrect = Object.values(newScores).reduce((sum, s) => sum + s, 0);
        const avgScore = totalCorrect / TRAINING_MODULES.length;
        onComplete(newScores, avgScore >= QUIZ_PASS_THRESHOLD);
      }
    }
  };

  const progressPct = Math.round(
    ((moduleIdx * 100) / TRAINING_MODULES.length) +
    ((questionIdx / (currentModule?.questions.length || 1)) * (100 / TRAINING_MODULES.length))
  );

  if (!currentQuestion) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-1">
          {t("training.pageTitle")}
        </h2>
        <p className="font-body text-xs text-muted-foreground">
          {t("training.module", { current: moduleIdx + 1, total: TRAINING_MODULES.length, title: currentModule.title })}
        </p>
      </div>

      <Progress value={progressPct} className="h-2" />

      <div className="glass-surface rounded-2xl p-5 border border-border/50">
        <p className="font-body text-xs text-muted-foreground mb-1">{currentModule.description}</p>
        <p className="font-display text-sm font-bold text-foreground mb-4">
          {currentQuestion.q}
        </p>

        <div className="space-y-2">
          {currentQuestion.options.map((opt, i) => {
            let style = "border-border/50 hover:border-primary/30";
            if (showResult) {
              if (i === currentQuestion.correct) style = "border-green-500/50 bg-green-500/5";
              else if (i === selectedAnswer) style = "border-red-500/50 bg-red-500/5";
            } else if (selectedAnswer === i) {
              style = "border-accent/50 bg-accent/5";
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                className={`w-full glass-surface rounded-xl p-3 border text-left transition-all ${style}`}
              >
                <div className="flex items-center gap-2">
                  {showResult && i === currentQuestion.correct && (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                  {showResult && i === selectedAnswer && i !== currentQuestion.correct && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="font-body text-sm text-foreground">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {showResult && (
          <Button onClick={handleNext} className="w-full mt-4 bg-accent text-accent-foreground font-display tracking-wider text-sm">
            {questionIdx < currentModule.questions.length - 1
              ? t("training.nextQuestion")
              : moduleIdx < TRAINING_MODULES.length - 1
              ? t("training.nextModule")
              : t("training.seeResults")}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default StepTraining;
