import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type QuestionType = "mcq" | "numeric" | "truefalse";

interface Question {
  id: string;
  type: QuestionType;
  options?: string[];
  correctIndex?: number;
  correctNumeric?: number;
  numericTolerance?: number;
  correctBool?: boolean;
}

const QUESTIONS: Question[] = [
  { id: "Q1", type: "mcq", correctIndex: 1 },
  { id: "Q2", type: "numeric", correctNumeric: 2304, numericTolerance: 1 },
  { id: "Q3", type: "mcq", correctIndex: 2 },
  { id: "Q4", type: "numeric", correctNumeric: 14, numericTolerance: 0.1 },
  { id: "Q5", type: "truefalse", correctBool: true },
  { id: "Q6", type: "numeric", correctNumeric: 9120, numericTolerance: 1 },
  { id: "Q7", type: "mcq", correctIndex: 2 },
];

const PASS_THRESHOLD = 6;
const MAX_ATTEMPTS = 3;

interface Props {
  onComplete: (score: number, passed: boolean, details: any[], attempts: number) => void;
}

const StepMathQuiz = ({ onComplete }: Props) => {
  const { t } = useTranslation();
  const [qIdx, setQIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [numericInput, setNumericInput] = useState("");
  const [boolAnswer, setBoolAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [retried, setRetried] = useState(false);
  const [score, setScore] = useState(0);
  const [details, setDetails] = useState<any[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const startedAt = useRef(new Date().toISOString());

  const q = QUESTIONS[qIdx];
  const progressPct = Math.round((qIdx / QUESTIONS.length) * 100);

  const normalizeNumeric = (val: string) => parseFloat(val.replace(",", "."));

  const checkAnswer = useCallback(() => {
    let correct = false;
    let userAnswer: any;

    if (q.type === "mcq") {
      correct = selectedAnswer === q.correctIndex;
      userAnswer = selectedAnswer;
    } else if (q.type === "numeric") {
      const num = normalizeNumeric(numericInput);
      correct = !isNaN(num) && Math.abs(num - q.correctNumeric!) <= (q.numericTolerance || 0);
      userAnswer = numericInput;
    } else if (q.type === "truefalse") {
      correct = boolAnswer === q.correctBool;
      userAnswer = boolAnswer;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct || retried) {
      if (correct) setScore((s) => s + 1);
      setDetails((d) => [...d, { q: q.id, answer: userAnswer, correct }]);
    }
  }, [q, selectedAnswer, numericInput, boolAnswer, retried]);

  const handleRetry = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setNumericInput("");
    setBoolAnswer(null);
    setRetried(true);
  };

  const handleNext = () => {
    if (!isCorrect && !retried) {
      // First wrong answer on this question - already recorded in details via checkAnswer
      // Actually we only record when correct or retried, so record now
      if (!details.find((d) => d.q === q.id)) {
        setDetails((d) => [...d, { q: q.id, answer: selectedAnswer ?? numericInput ?? boolAnswer, correct: false }]);
      }
    }

    setShowResult(false);
    setSelectedAnswer(null);
    setNumericInput("");
    setBoolAnswer(null);
    setRetried(false);

    if (qIdx < QUESTIONS.length - 1) {
      setQIdx((i) => i + 1);
    } else {
      setQuizDone(true);
    }
  };

  const handleRetryQuiz = () => {
    setQIdx(0);
    setScore(0);
    setDetails([]);
    setShowResult(false);
    setSelectedAnswer(null);
    setNumericInput("");
    setBoolAnswer(null);
    setRetried(false);
    setQuizDone(false);
    setAttempt((a) => a + 1);
    startedAt.current = new Date().toISOString();
  };

  const passed = score >= PASS_THRESHOLD;

  // Quiz complete screen
  if (quizDone) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6 text-center">
        {passed ? (
          <>
            <Trophy className="w-12 h-12 text-accent mx-auto" />
            <h2 className="font-display text-xl font-black tracking-wider text-foreground">
              {t("mathQuiz.passedTitle")}
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              {t("mathQuiz.passedScore", { score, total: QUESTIONS.length })}
            </p>
            <p className="font-body text-sm text-foreground/80">
              {t("mathQuiz.passedMessage")}
            </p>
            <Button
              onClick={() => onComplete(score, true, details, attempt)}
              className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm h-12"
            >
              {t("mathQuiz.continueCta")}
            </Button>
          </>
        ) : (
          <>
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="font-display text-xl font-black tracking-wider text-foreground">
              {t("mathQuiz.failedTitle")}
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              {t("mathQuiz.failedScore", { score, total: QUESTIONS.length })}
            </p>
            {attempt < MAX_ATTEMPTS ? (
              <>
                <p className="font-body text-sm text-foreground/80">
                  {t("mathQuiz.failedRetry", { remaining: MAX_ATTEMPTS - attempt })}
                </p>
                <Button
                  onClick={handleRetryQuiz}
                  className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm h-12"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t("mathQuiz.retryBtn")}
                </Button>
              </>
            ) : (
              <>
                <p className="font-body text-sm text-foreground/80">
                  {t("mathQuiz.failedMaxAttempts")}
                </p>
                <Button
                  onClick={() => onComplete(score, false, details, attempt)}
                  variant="outline"
                  className="w-full font-display tracking-wider text-sm h-12"
                >
                  {t("mathQuiz.requestCoaching")}
                </Button>
              </>
            )}
          </>
        )}
      </motion.div>
    );
  }

  const optionKeys = q.type === "mcq" ? ["A", "B", "C", "D"] : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <Brain className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-1">
          {t("mathQuiz.title")}
        </h2>
        <p className="font-body text-xs text-muted-foreground">
          {t("mathQuiz.subtitle", { current: qIdx + 1, total: QUESTIONS.length })}
        </p>
      </div>

      <Progress value={progressPct} className="h-2" />

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-surface rounded-2xl p-5 border border-border/50"
        >
          <p className="font-display text-sm font-bold text-foreground mb-4">
            {t(`mathQuiz.${q.id}`)}
          </p>

          {/* MCQ */}
          {q.type === "mcq" && (
            <div className="space-y-2">
              {optionKeys.map((key, i) => {
                let style = "border-border/50 hover:border-primary/30";
                if (showResult) {
                  if (i === q.correctIndex) style = "border-green-500/50 bg-green-500/5";
                  else if (i === selectedAnswer && i !== q.correctIndex) style = "border-red-500/50 bg-red-500/5";
                } else if (selectedAnswer === i) {
                  style = "border-accent/50 bg-accent/5";
                }

                return (
                  <button
                    key={i}
                    onClick={() => !showResult && setSelectedAnswer(i)}
                    disabled={showResult}
                    className={`w-full glass-surface rounded-xl p-3 border text-left transition-all ${style}`}
                    aria-label={`${t("mathQuiz.option")} ${key}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs font-bold text-muted-foreground w-5">{key})</span>
                      {showResult && i === q.correctIndex && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                      {showResult && i === selectedAnswer && i !== q.correctIndex && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                      <span className="font-body text-sm text-foreground">
                        {t(`mathQuiz.${q.id}o${i + 1}`)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Numeric */}
          {q.type === "numeric" && (
            <div className="space-y-2">
              <Input
                type="text"
                inputMode="decimal"
                value={numericInput}
                onChange={(e) => setNumericInput(e.target.value)}
                disabled={showResult}
                placeholder={t("mathQuiz.numericPlaceholder")}
                className="font-body text-lg"
                aria-label={t("mathQuiz.numericLabel")}
              />
            </div>
          )}

          {/* True/False */}
          {q.type === "truefalse" && (
            <div className="flex gap-3">
              {[true, false].map((val) => {
                let style = "border-border/50 hover:border-primary/30";
                if (showResult) {
                  if (val === q.correctBool) style = "border-green-500/50 bg-green-500/5";
                  else if (val === boolAnswer && val !== q.correctBool) style = "border-red-500/50 bg-red-500/5";
                } else if (boolAnswer === val) {
                  style = "border-accent/50 bg-accent/5";
                }

                return (
                  <button
                    key={String(val)}
                    onClick={() => !showResult && setBoolAnswer(val)}
                    disabled={showResult}
                    className={`flex-1 glass-surface rounded-xl p-4 border text-center transition-all ${style}`}
                  >
                    <span className="font-display text-sm font-bold text-foreground">
                      {val ? t("mathQuiz.true") : t("mathQuiz.false")}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Submit */}
          {!showResult && (
            <Button
              onClick={checkAnswer}
              disabled={
                (q.type === "mcq" && selectedAnswer === null) ||
                (q.type === "numeric" && !numericInput.trim()) ||
                (q.type === "truefalse" && boolAnswer === null)
              }
              className="w-full mt-4 bg-accent text-accent-foreground font-display tracking-wider text-sm"
            >
              {t("mathQuiz.submit")}
            </Button>
          )}

          {/* Feedback */}
          {showResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
              <div
                className={`rounded-xl p-3 border ${
                  isCorrect ? "bg-green-500/5 border-green-500/30" : "bg-red-500/5 border-red-500/30"
                }`}
              >
                <p className="font-body text-sm font-semibold">
                  {isCorrect ? t("mathQuiz.correct") : t("mathQuiz.incorrect")}
                </p>
                <p className="font-body text-xs text-muted-foreground mt-1">
                  {t(`mathQuiz.${q.id}exp`)}
                </p>
              </div>

              {/* Retry or Next */}
              <div className="flex gap-2">
                {!isCorrect && !retried && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="flex-1 font-display tracking-wider text-sm"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    {t("mathQuiz.retryQuestion")}
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className={`${!isCorrect && !retried ? "flex-1" : "w-full"} bg-accent text-accent-foreground font-display tracking-wider text-sm`}
                >
                  {qIdx < QUESTIONS.length - 1 ? t("mathQuiz.next") : t("mathQuiz.finish")}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default StepMathQuiz;
