import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW_MS = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 120_000);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { notes, concentration, mode } = body;

    // Input validation
    if (!mode || !["analyze", "gift", "duo", "seance"].includes(mode)) {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "analyze") {
      if (!Array.isArray(notes) || notes.length < 1 || notes.length > 20) {
        return new Response(JSON.stringify({ error: "Invalid notes" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (typeof concentration !== "string" || concentration.length > 50) {
        return new Response(JSON.stringify({ error: "Invalid concentration" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (mode === "gift" || mode === "duo") {
      if (!notes || typeof notes !== "object" || !notes.personality || !notes.occasion || !notes.mood) {
        return new Response(JSON.stringify({ error: "Invalid gift parameters" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (mode === "seance") {
      if (!notes || typeof notes !== "object" || !notes.worldName || !notes.answers) {
        return new Response(JSON.stringify({ error: "Invalid séance parameters" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "seance") {
      const { worldName, worldType, answers } = notes;
      systemPrompt = `You are an ancient Scent Oracle who channels spirit fragrances from mystical realms. You perform Scent Séances — one-time-only fragrance readings that are deeply personal and never repeated.

You must respond with valid JSON only, no markdown. Format:
{
  "spiritName": "A mystical, evocative name for this spirit fragrance",
  "prophecy": "A 3-4 sentence poetic prophecy about the user's olfactory destiny, written like an ancient oracle speaking",
  "spiritNotes": [
    {"name": "Note Name", "emoji": "🌹", "layer": "top|heart|base", "whisper": "A short mystical reason this note appeared"}
  ],
  "element": "Fire|Water|Earth|Air|Ether",
  "aura": "A single evocative color word (e.g. 'Obsidian', 'Gilded', 'Cerulean')",
  "ritualAdvice": "One sentence of mystical advice about when/how to wear this spirit scent"
}
Suggest 5-7 notes across all three layers. Be deeply mystical, poetic, and unique. This fragrance has NEVER existed before and will NEVER exist again.`;

      userPrompt = `Perform a Scent Séance for the ${worldName} realm (${worldType}).

The seeker's responses to the ritual questions:
1. "What emotion does this world awaken in you?" — "${answers[0]}"
2. "If this world had a sound, what would it be?" — "${answers[1]}"
3. "What memory does this world remind you of?" — "${answers[2]}"

Channel a spirit fragrance that has never existed and will never exist again. Make it deeply personal to these specific answers.`;
    } else if (mode === "duo") {
      const { personality, occasion, mood, memory, zodiac, relationshipDepth,
              gifterName, recipientName, duoPartnerPersonality, duoPartnerMood, duoPartnerName } = notes;

      systemPrompt = `You are The Perfume Lab's Master Perfumer AI. You create harmonized "Duo Blends" — a single fragrance that represents the merging of two people's scent identities.

You must respond with valid JSON only, no markdown. Format:
{
  "blendName": "A name reflecting the union of two souls",
  "story": "3-4 sentence story about how these two scent identities merge into one, weaving in any shared memory provided",
  "notes": [
    {"name": "Note Name", "emoji": "🌹", "layer": "top|heart|base", "reason": "Why this note represents their union"}
  ],
  "mood": "One word mood",
  "intensity": "Light|Moderate|Bold|Intense",
  "scentLetter": "A poetic 4-6 line letter addressed to both people, explaining why each note was chosen for THEM specifically, written as if the perfume itself is speaking to them. Reference the shared memory if provided."
}
Suggest 6-8 notes. For each person's personality, choose notes that represent them, then find notes that harmonize both into unity.`;

      let prompt = `Create a Duo Blend harmonizing two people:
Person 1: ${gifterName || "Creator"} — ${personality} personality, wants a ${mood} mood
Person 2: ${duoPartnerName || "Partner"} — ${duoPartnerPersonality} personality, wants a ${duoPartnerMood} mood
Occasion: ${occasion}. Relationship: ${relationshipDepth || "friends"}.`;
      if (memory) prompt += `\nShared memory: "${memory}"`;
      if (zodiac) prompt += `\nZodiac alignment: ${zodiac}`;
      userPrompt = prompt;
    } else if (mode === "gift") {
      const { personality, occasion, mood, memory, zodiac, relationshipDepth, gifterName, recipientName } = notes;

      systemPrompt = `You are The Perfume Lab's Master Perfumer AI. You suggest custom fragrance blends for gifts.
You must respond with valid JSON only, no markdown. Format:
{
  "blendName": "Creative Name",
  "story": "3-4 sentence poetic story about this blend${memory ? ", weaving in the shared memory provided" : ""}",
  "notes": [
    {"name": "Note Name", "emoji": "🌹", "layer": "top|heart|base", "reason": "Why this note fits"}
  ],
  "mood": "One word mood",
  "intensity": "Light|Moderate|Bold|Intense",
  "scentLetter": "A poetic 4-6 line letter addressed to the recipient, explaining why each note was chosen for THEM specifically. Written as if the perfume itself is speaking. ${memory ? "Reference the shared memory." : ""}"
}
Suggest 5-7 notes across all three layers. Be creative and luxurious.${zodiac ? " Consider their zodiac energy." : ""}`;

      let prompt = `Create a gift fragrance for someone who is ${personality}, for a ${occasion} occasion, with a ${mood} mood.`;
      if (relationshipDepth) prompt += ` The bond between gifter and recipient: ${relationshipDepth}.`;
      if (gifterName) prompt += ` From: ${gifterName}.`;
      if (recipientName) prompt += ` To: ${recipientName}.`;
      if (memory) prompt += `\nA cherished shared memory: "${memory}"`;
      if (zodiac) prompt += `\nRecipient's zodiac: ${zodiac}`;
      userPrompt = prompt;
    } else {
      systemPrompt = `You are The Perfume Lab's Master Perfumer AI assistant. You analyze fragrance blends and give expert advice.
Keep responses under 80 words. Be poetic but precise. Use fragrance terminology.
If the blend is unbalanced, suggest specific fixes. If it's good, praise it.
Always address the user as "Alchemist".`;

      const notesList = notes.map((n: any) => `${n.name} (${n.layer}, intensity: ${n.intensity}%, warmth: ${n.warmth}%)`).join(", ");
      userPrompt = `Analyze this blend: ${notesList}. Concentration: ${concentration}. 
Provide: 1) Brief assessment of balance 2) One specific suggestion to improve it.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("perfumer-ai error:", e);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
