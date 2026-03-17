import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAffiliateOnboarding } from "@/hooks/useAffiliateOnboarding";
import { ONBOARDING_STEP_COUNT, ONBOARDING_STEP_LABELS } from "@/lib/affiliateOnboarding";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import StepWelcome from "@/components/onboarding/StepWelcome";
import StepIdentity from "@/components/onboarding/StepIdentity";
import StepQuickWin from "@/components/onboarding/StepQuickWin";
import StepStarterPack from "@/components/onboarding/StepStarterPack";
import StepTraining from "@/components/onboarding/StepTraining";
import StepPledge from "@/components/onboarding/StepPledge";
import StepTasks from "@/components/onboarding/StepTasks";
import StepRoleplay from "@/components/onboarding/StepRoleplay";
import StepPayout from "@/components/onboarding/StepPayout";
import StepCelebrate from "@/components/onboarding/StepCelebrate";

const AffiliateOnboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { affiliate, progress, loading, saveStep, emitEvent, finishOnboarding } = useAffiliateOnboarding();
  const [step, setStep] = useState(0);
  const isResuming = progress ? progress.current_step > 0 && !progress.completed : false;

  useEffect(() => {
    if (progress) {
      // Resume from saved step
      setStep(progress.current_step);
      // If already completed, redirect
      if (progress.completed && affiliate) {
        navigate(`/affiliate/${affiliate.slug}/dashboard`, { replace: true });
      }
    }
  }, [progress, affiliate, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!affiliate || !progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-body text-sm text-muted-foreground">No affiliate profile found.</p>
          <Button onClick={() => navigate("/affiliate-signup")} className="font-display tracking-wider text-sm">
            Sign Up as Affiliate
          </Button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((step / ONBOARDING_STEP_COUNT) * 100);

  const advance = () => setStep((s) => Math.min(s + 1, ONBOARDING_STEP_COUNT - 1));

  const handleSaveAndExit = async () => {
    await saveStep(step);
    toast.success(t("affiliateOnboarding.progressSaved"));
    navigate("/landing");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-20 sm:pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
        {/* Top bar */}
        {step > 0 && step < ONBOARDING_STEP_COUNT - 1 && (
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="font-display text-xs tracking-wider"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Back
            </Button>
            <span className="font-display text-[10px] tracking-widest text-muted-foreground">
              {ONBOARDING_STEP_LABELS[step]} — {step + 1}/{ONBOARDING_STEP_COUNT}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveAndExit}
              className="font-display text-xs tracking-wider"
            >
              <Save className="w-3 h-3 mr-1" /> Save & Exit
            </Button>
          </div>
        )}

        {/* Progress bar */}
        {step > 0 && (
          <Progress value={progressPct} className="h-1.5 mb-8" />
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          <div key={step}>
            {step === 0 && (
              <StepWelcome
                displayName={affiliate.display_name}
                onStart={async () => {
                  await emitEvent("onboarding_started");
                  await saveStep(0);
                  advance();
                }}
              />
            )}

            {step === 1 && (
              <StepIdentity
                onComplete={async (level) => {
                  await emitEvent("identity_chosen", { level });
                  await saveStep(1, { chosen_partner_level: level });
                  advance();
                }}
              />
            )}

            {step === 2 && (
              <StepQuickWin
                onAccept={async () => {
                  await emitEvent("quick_win_plan_accepted");
                  await saveStep(2);
                  advance();
                }}
              />
            )}

            {step === 3 && (
              <StepStarterPack
                onClaim={async (data) => {
                  await emitEvent("starter_pack_claimed", data);
                  await saveStep(3, { starter_pack_claimed: true, starter_pack_data: data });
                  toast.success("Starter Pack reserved! €20 credit added 🎁");
                  advance();
                }}
              />
            )}

            {step === 4 && (
              <StepTraining
                onComplete={async (scores, passed) => {
                  await emitEvent(passed ? "quiz_passed" : "quiz_failed", { scores });
                  await saveStep(4, { quiz_scores: scores, quiz_passed: passed });
                  if (passed) {
                    toast.success("Training passed! 🎓");
                    advance();
                  } else {
                    toast.error("Score below 80%. Please retry the training.");
                    // Reset to retry - stay on step 4
                  }
                }}
              />
            )}

            {step === 5 && (
              <StepPledge
                displayName={affiliate.display_name}
                onSign={async (pledgeText) => {
                  await emitEvent("pledge_signed", { pledgeText });
                  await saveStep(5, { pledge_signed: true, pledge_text: pledgeText });
                  toast.success("Pledge signed! Badge unlocked 🏅");
                  advance();
                }}
              />
            )}

            {step === 6 && (
              <StepTasks
                onComplete={async (tasks) => {
                  await emitEvent("tasks_assigned", { tasks });
                  await saveStep(6, { microtasks: tasks.map((t) => ({ task: t, completed: false })) as any });
                  advance();
                }}
              />
            )}

            {step === 7 && (
              <StepRoleplay
                onComplete={async (passed) => {
                  await emitEvent(passed ? "roleplay_passed" : "roleplay_failed");
                  await saveStep(7, { roleplay_passed: passed });
                  if (passed) advance();
                }}
              />
            )}

            {step === 8 && (
              <StepPayout
                onSave={async () => {
                  await emitEvent("payout_details_saved");
                  await saveStep(8, { payout_details_saved: true, terms_accepted: true, buyback_terms_accepted: true });
                  toast.success("Payout details saved! ✅");
                  advance();
                }}
              />
            )}

            {step === 9 && (
              <StepCelebrate
                displayName={affiliate.display_name}
                partnerNumber={Math.floor(Math.random() * 50) + 10}
                onFinish={async () => {
                  await saveStep(9);
                  await finishOnboarding();
                  toast.success("Welcome aboard! 🚀");
                }}
              />
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AffiliateOnboardPage;
