import { supabase } from "@/integrations/supabase/client";

export const ONBOARDING_STEP_COUNT = 10;

export const ONBOARDING_STEP_LABELS = [
  "Welcome",
  "Identity & Social Proof",
  "48-Hour Quick Win Plan",
  "Starter Pack Claim",
  "Micro-Training",
  "Commitment Pledge",
  "First Tasks & Scheduler",
  "Verification Roleplay",
  "Payout Setup & Legal",
  "Celebrate & Launch",
];

export const QUIZ_PASS_THRESHOLD = 0.8;

export interface OnboardingProgress {
  id: string;
  user_id: string;
  affiliate_id: string;
  current_step: number;
  steps_completed: number[];
  quiz_scores: Record<string, number>;
  quiz_passed: boolean;
  roleplay_passed: boolean;
  starter_pack_claimed: boolean;
  starter_pack_data: Record<string, unknown> | null;
  pledge_signed: boolean;
  pledge_text: string | null;
  payout_details_saved: boolean;
  terms_accepted: boolean;
  buyback_terms_accepted: boolean;
  chosen_partner_level: string | null;
  microtasks: Record<string, unknown>[];
  completed: boolean;
  completed_at: string | null;
  started_at: string;
  created_at: string;
  updated_at: string;
}

export async function getOnboardingProgress(affiliateId: string): Promise<OnboardingProgress | null> {
  const { data, error } = await supabase
    .from("affiliate_onboarding_progress")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as OnboardingProgress;
}

export async function createOnboardingProgress(userId: string, affiliateId: string): Promise<OnboardingProgress> {
  const { data, error } = await supabase
    .from("affiliate_onboarding_progress")
    .insert({ user_id: userId, affiliate_id: affiliateId } as any)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as OnboardingProgress;
}

export async function updateOnboardingProgress(
  id: string,
  updates: Partial<Omit<OnboardingProgress, "id" | "user_id" | "affiliate_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("affiliate_onboarding_progress")
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as OnboardingProgress;
}

export async function emitOnboardingEvent(
  userId: string,
  affiliateId: string,
  eventType: string,
  eventData: Record<string, unknown> = {}
) {
  await supabase.from("affiliate_onboarding_events").insert({
    user_id: userId,
    affiliate_id: affiliateId,
    event_type: eventType,
    event_data: eventData,
  } as any);
}

export async function completeOnboardingFull(id: string) {
  return updateOnboardingProgress(id, {
    completed: true,
    completed_at: new Date().toISOString(),
  });
}

// Training quiz data
export const TRAINING_MODULES = [
  {
    id: "demo",
    title: "60s App Demo",
    description: "Learn how the app works and how customers discover scents.",
    questions: [
      {
        q: "What is the main way customers discover their scent?",
        options: ["Random selection", "Scent DNA Quiz", "Price sorting", "Brand filtering"],
        correct: 1,
      },
      {
        q: "How does an affiliate earn commission?",
        options: ["Watching videos", "When referred customers buy", "By uploading content", "Monthly salary"],
        correct: 1,
      },
    ],
  },
  {
    id: "owner_pitch",
    title: "Owner Pitch Script",
    description: "Master the 60-second pitch to shop owners.",
    questions: [
      {
        q: "What's the best opening line for a shop owner?",
        options: [
          "Buy our products",
          "I have a risk-free way to add premium fragrances to your shelf",
          "Our company is the best",
          "You need more products",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "customer_close",
    title: "Customer Close Technique",
    description: "How to run a sampling hour and convert customers.",
    questions: [
      {
        q: "What's the best way to close a sampling customer?",
        options: [
          "Pressure them immediately",
          "Let them discover their scent profile, then suggest a match",
          "Offer the cheapest product",
          "Ignore them after sampling",
        ],
        correct: 1,
      },
      {
        q: "How many customers should you aim to sample per hour?",
        options: ["1-2", "3-5", "8-12", "20+"],
        correct: 2,
      },
    ],
  },
];

export const ROLEPLAY_SCENARIOS = [
  {
    scenario: "A shop owner says: 'I already have too many perfume brands.' What do you say?",
    options: [
      "Okay, thanks anyway.",
      "Our brand is different — it's custom-made, so it doesn't compete with existing shelf brands. Plus, the 14-day buyback means zero risk for you.",
      "You should remove those brands and sell ours instead.",
      "Let me speak to your manager.",
    ],
    correct: 1,
  },
  {
    scenario: "A customer tried a sample but says: 'I'll think about it.' What do you do?",
    options: [
      "Walk away immediately.",
      "Offer them the scent DNA card to take home and share your referral QR code — this keeps the connection warm.",
      "Tell them they're making a mistake.",
      "Offer a 90% discount.",
    ],
    correct: 1,
  },
  {
    scenario: "A shop owner asks about returns. What's the policy?",
    options: [
      "No returns ever.",
      "14-day buyback guarantee — we take back unsold stock, no risk to the shop.",
      "Returns after 90 days only.",
      "I don't know.",
    ],
    correct: 1,
  },
];
