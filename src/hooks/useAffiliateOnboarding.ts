import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAffiliate, type AffiliateProfile } from "@/lib/affiliates";
import {
  getOnboardingProgress,
  createOnboardingProgress,
  updateOnboardingProgress,
  emitOnboardingEvent,
  completeOnboardingFull,
  type OnboardingProgress,
} from "@/lib/affiliateOnboarding";
import { useAuth } from "@/hooks/useAuth";

export function useAffiliateOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      const aff = await getMyAffiliate();
      if (cancelled) return;
      if (!aff) {
        setLoading(false);
        return;
      }
      setAffiliate(aff);

      let prog = await getOnboardingProgress(aff.id);
      if (!prog) {
        prog = await createOnboardingProgress(user.id, aff.id);
        await emitOnboardingEvent(user.id, aff.id, "onboarding_started");
      }
      if (!cancelled) {
        setProgress(prog);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  const saveStep = useCallback(
    async (step: number, updates: Partial<OnboardingProgress> = {}) => {
      if (!progress || !user || !affiliate) return progress;

      const stepsCompleted = Array.from(
        new Set([...(progress.steps_completed as number[]), step])
      );

      const updated = await updateOnboardingProgress(progress.id, {
        ...updates,
        current_step: Math.max(progress.current_step, step + 1),
        steps_completed: stepsCompleted as any,
      });
      setProgress(updated);
      return updated;
    },
    [progress, user, affiliate]
  );

  const emitEvent = useCallback(
    async (eventType: string, eventData: Record<string, unknown> = {}) => {
      if (!user || !affiliate) return;
      await emitOnboardingEvent(user.id, affiliate.id, eventType, eventData);
    },
    [user, affiliate]
  );

  const finishOnboarding = useCallback(async () => {
    if (!progress || !user || !affiliate) return;
    await completeOnboardingFull(progress.id);
    await emitEvent("onboarding_completed");
    // Also mark the affiliate as onboarding_completed
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase
      .from("affiliate_partners")
      .update({ onboarding_completed: true } as any)
      .eq("id", affiliate.id);
    navigate(`/affiliate/${affiliate.slug}/dashboard`);
  }, [progress, user, affiliate, emitEvent, navigate]);

  return {
    affiliate,
    progress,
    loading,
    saveStep,
    emitEvent,
    finishOnboarding,
  };
}
