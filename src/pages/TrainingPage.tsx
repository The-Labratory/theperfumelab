import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";

const TRAINING_MODULES = [
  {
    title: "Brand & Products",
    questions: [
      {
        question: "What is The Perfume Lab's core value proposition?",
        options: ["Mass-market fragrances", "Bespoke niche perfumery with AI-assisted blending", "Reselling designer brands", "Aromatherapy candles"],
        correct: 1,
      },
      {
        question: "How are our perfumes formulated?",
        options: ["Pre-made in factories", "Hand-blended using IFRA-compliant ingredients with AI harmony scoring", "Imported from France", "Mixed by customers at home"],
        correct: 1,
      },
    ],
  },
  {
    title: "Customer Experience",
    questions: [
      {
        question: "What tool helps customers find their ideal scent?",
        options: ["Random selection", "Scent DNA Quiz & AI Perfumer", "Price comparison", "Celebrity endorsements"],
        correct: 1,
      },
      {
        question: "What is a Growth Credit?",
        options: ["A bank loan", "Reward currency earned through engagement and referrals", "A discount coupon", "A shipping fee"],
        correct: 1,
      },
    ],
  },
  {
    title: "Platform Features",
    questions: [
      {
        question: "Where can partners track their business performance?",
        options: ["External spreadsheet", "My Business Portal dashboard", "Email reports only", "Phone calls with admin"],
        correct: 1,
      },
      {
        question: "How does the referral system work?",
        options: ["No referral system exists", "Share your unique link → earn Growth Credits when friends join", "Pay for referrals", "Referrals are admin-only"],
        correct: 1,
      },
    ],
  },
];

const PASS_THRESHOLD = 0.8;

export default function TrainingPage() {
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

  const currentModule = TRAINING_MODULES[moduleIdx];
  const currentQuestion = currentModule?.questions[questionIdx];
  const totalQuestions = TRAINING_MODULES.reduce((s, m) => s + m.questions.length, 0);
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100);

  const handleSelect = (idx: number) => {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    const isCorrect = idx === currentQuestion.correct;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setTotalAnswered((t) => t + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowFeedback(false);

    if (questionIdx < currentModule.questions.length - 1) {
      setQuestionIdx((q) => q + 1);
    } else if (moduleIdx < TRAINING_MODULES.length - 1) {
      setModuleIdx((m) => m + 1);
      setQuestionIdx(0);
    } else {
      const score = (correctCount) / totalQuestions;
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
    toast.success("Training complete! Welcome aboard 🎉");
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
                <h2 className="font-display text-2xl font-black tracking-wider text-foreground mb-2">Training Passed!</h2>
                <p className="text-muted-foreground font-body mb-2">
                  You scored {correctCount}/{totalQuestions} ({Math.round((correctCount / totalQuestions) * 100)}%)
                </p>
                <p className="text-sm text-muted-foreground font-body mb-8">You're ready to explore The Perfume Lab.</p>
                <Button onClick={handleFinish} disabled={saving} size="lg" className="font-display tracking-wider">
                  {saving ? "Saving…" : "Enter Dashboard"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="font-display text-2xl font-black tracking-wider text-foreground mb-2">Not Quite There</h2>
                <p className="text-muted-foreground font-body mb-2">
                  You scored {correctCount}/{totalQuestions} ({Math.round((correctCount / totalQuestions) * 100)}%)
                </p>
                <p className="text-sm text-muted-foreground font-body mb-8">You need at least 80% to pass. Let's try again!</p>
                <Button onClick={handleRetry} size="lg" variant="outline" className="font-display tracking-wider">
                  Retry Training
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div key={`${moduleIdx}-${questionIdx}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="max-w-lg w-full">
          <div className="text-center mb-8">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
            <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-1">Platform Training</h2>
            <p className="text-xs text-muted-foreground font-body">
              Module {moduleIdx + 1}/{TRAINING_MODULES.length}: {currentModule.title}
            </p>
            <Progress value={progressPct} className="mt-4 h-2" />
          </div>

          <div className="glass-surface rounded-2xl p-6 border border-border/30">
            <p className="font-display text-base font-semibold text-foreground mb-6">{currentQuestion.question}</p>
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                let border = "border-border/30";
                if (showFeedback && idx === currentQuestion.correct) border = "border-green-500 bg-green-500/10";
                else if (showFeedback && idx === selected && idx !== currentQuestion.correct) border = "border-destructive bg-destructive/10";

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
                <p className={`text-sm font-display font-bold mb-3 ${selected === currentQuestion.correct ? "text-green-500" : "text-destructive"}`}>
                  {selected === currentQuestion.correct ? "✅ Correct!" : "❌ Not quite. The correct answer is highlighted above."}
                </p>
                <Button onClick={handleNext} className="font-display tracking-wider">
                  {questionIdx < currentModule.questions.length - 1
                    ? "Next Question →"
                    : moduleIdx < TRAINING_MODULES.length - 1
                    ? "Next Module →"
                    : "See Results →"}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
