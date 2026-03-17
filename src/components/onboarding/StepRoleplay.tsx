import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROLEPLAY_SCENARIOS, QUIZ_PASS_THRESHOLD } from "@/lib/affiliateOnboarding";

interface Props {
  onComplete: (passed: boolean) => void;
}

const StepRoleplay = ({ onComplete }: Props) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const current = ROLEPLAY_SCENARIOS[idx];
  const total = ROLEPLAY_SCENARIOS.length;
  const passed = score / total >= QUIZ_PASS_THRESHOLD;

  const handleAnswer = (i: number) => {
    if (showResult) return;
    setSelected(i);
    setShowResult(true);
    if (i === current.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowResult(false);
    if (idx < total - 1) {
      setIdx((i) => i + 1);
    } else {
      setFinished(true);
      setAttempts((a) => a + 1);
    }
  };

  const retry = () => {
    setIdx(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center space-y-6">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
          {passed ? <CheckCircle className="w-8 h-8 text-green-500" /> : <XCircle className="w-8 h-8 text-red-500" />}
        </div>
        <h2 className="font-display text-xl font-black text-foreground">
          {passed ? "Roleplay Passed! 🎉" : "Not quite — try again"}
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Score: {score}/{total} ({Math.round((score / total) * 100)}%) — Need {Math.round(QUIZ_PASS_THRESHOLD * 100)}% to pass
        </p>
        {passed ? (
          <Button size="lg" onClick={() => onComplete(true)} className="bg-accent text-accent-foreground font-display tracking-wider text-sm">
            Continue →
          </Button>
        ) : (
          <Button size="lg" onClick={retry} variant="outline" className="font-display tracking-wider text-sm">
            <RotateCcw className="w-4 h-4 mr-2" /> Retry Roleplay
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <MessageSquare className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-1">Verification Roleplay</h2>
        <p className="font-body text-xs text-muted-foreground">Scenario {idx + 1}/{total}</p>
      </div>

      <Progress value={((idx + 1) / total) * 100} className="h-2" />

      <div className="glass-surface rounded-2xl p-5 border border-border/50">
        <p className="font-display text-sm font-bold text-foreground mb-4 italic">"{current.scenario}"</p>
        <div className="space-y-2">
          {current.options.map((opt, i) => {
            let style = "border-border/50 hover:border-primary/30";
            if (showResult) {
              if (i === current.correct) style = "border-green-500/50 bg-green-500/5";
              else if (i === selected) style = "border-red-500/50 bg-red-500/5";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={showResult}
                className={`w-full glass-surface rounded-xl p-3 border text-left transition-all ${style}`}
              >
                <span className="font-body text-sm text-foreground">{opt}</span>
              </button>
            );
          })}
        </div>
        {showResult && (
          <Button onClick={handleNext} className="w-full mt-4 bg-accent text-accent-foreground font-display tracking-wider text-sm">
            {idx < total - 1 ? "Next Scenario →" : "See Results →"}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default StepRoleplay;
