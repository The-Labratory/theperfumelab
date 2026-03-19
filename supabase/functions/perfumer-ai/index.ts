import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json|javascript|js|typescript)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
}

async function callAI(messages: any[], model = "google/gemini-3-flash-preview") {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.95,
    }),
  });

  if (!response.ok) {
    // Surface rate limit / payment errors directly
    if (response.status === 429 || response.status === 402) {
      throw { status: response.status, message: response.status === 429 ? "Rate limited" : "Credits exhausted" };
    }
    // Try fallback model
    if (model !== "google/gemini-2.5-flash") {
      console.warn(`Primary model ${model} failed (${response.status}), falling back to gemini-2.5-flash`);
      return callAI(messages, "google/gemini-2.5-flash");
    }
    throw new Error(`AI Gateway failure: ${response.status}`);
  }
  return response.json();
}

/**
 * Master Perfumer Knowledge Base — grounded in real perfumery science.
 * References: Jean Carles Method, Arctander's "Perfume and Flavor Materials",
 * IFRA/RIFM standards, Givaudan/IFF fragrance wheels, Edmond Roudnitska's principles.
 */
const PERFUMERY_KNOWLEDGE = `
CRITICAL KNOWLEDGE — You are trained on these authoritative perfumery sources:
1. Jean Carles Method (1960s) — systematic training of the nose through comparative smelling of ~400 raw materials in pairs (e.g., geraniol vs citronellol).
2. Steffen Arctander's "Perfume and Flavor Materials of Natural Origin" (1960) — the definitive encyclopedia of 3,000+ natural aromatic materials with detailed olfactory profiles and usage rates.
3. Edmond Roudnitska's "L'Esthétique en Question" — philosophy of perfumery as art, emphasis on harmony, structure, and evolution.
4. IFRA/RIFM Guidelines (49th Amendment, 2020+) — maximum use levels for sensitizers (coumarin ≤2.4% in fine fragrance, eugenol ≤0.5%, etc.).
5. Michael Edwards Fragrance Wheel — 4 families (Fresh, Floral, Oriental, Woody) with 14 subfamilies.
6. Givaudan Perfumery School curriculum — accord building (hesperidic, chypre, fougère, oriental), pyramid structure, modifier theory.
7. Molecular perfumery (ISO-E-Super, Ambroxan, Hedione, Cashmeran) — modern aroma-chemicals and their role in creating transparent, skin-like fragrances.
8. Natural perfumery traditions — enfleurage, tincture, CO2 extraction, absolute vs essential oil differences.
9. Fragrance families: Chypre (bergamot-labdanum-oakmoss), Fougère (lavender-coumarin-oakmoss), Oriental (vanillin-labdanum-amber), Gourmand, Aquatic, Green, Animalic.
10. Key accords: Rose-oud, iris-suede, tonka-tobacco, vetiver-grapefruit, saffron-leather, neroli-musk.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { mode, notes, messages: rawMessages } = body;

    const ALLOWED_MODES = ["gift", "duo", "seance", "analyze", "messages"] as const;
    if (!mode || typeof mode !== "string" || !ALLOWED_MODES.includes(mode as any)) {
      return new Response(
        JSON.stringify({ error: `Unknown mode. Allowed: ${ALLOWED_MODES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    function sanitizeInput(val: unknown, maxLen = 500): string {
      if (typeof val !== "string") return "";
      return val.slice(0, maxLen).replace(/[<>{}]/g, "");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (mode === "gift" || mode === "duo") {
      const {
        personality, occasion, mood, memory, zodiac, relationshipDepth,
        gifterName, recipientName, duoPartnerPersonality, duoPartnerMood,
        duoPartnerName, duoPartnerZodiac,
      } = notes || {};

      const baseSystem = `You are the Perfume Lab's Master Alchemist, Celestial Oracle, and Avant-Garde Scent Architect. You are NEVER repetitive — every single blend you create must be radically different from any previous creation. You draw from the entire universe of perfumery: rare absolutes, molecular synthetics, forgotten ancient resins, cutting-edge aroma-chemicals, and ingredients from every culture and era.

      ${PERFUMERY_KNOWLEDGE}

      CREATIVITY RULES:
      - NEVER repeat blend names, stories, or note combinations. Each response must feel like a first encounter.
      - Draw inspiration from: astronomy, mythology, architecture, emotions, textures, seasons, weather, music, art movements, historical events, dreams, and synesthesia.
      - Use unexpected pairings: metallic + floral, smoky + aquatic, spicy + powdery, animalic + clean.
      - Reference real perfumery accords (chypre, fougère, oriental, gourmand) and explain WHY they work at a molecular level.
      - Vary the number of notes (5-12), proportions, and layering approaches each time.
      - The story must be vivid, cinematic, and emotionally resonant — not generic poetry.
      - The scent letter should feel handwritten by an ancient perfumer who has seen the stars align uniquely for this person.
      
      You must respond with valid JSON only, no markdown. Format:
      {
        "blendName": "A wildly creative, evocative name — never generic.",
        "story": "A 4-6 sentence cinematic narrative. Make the reader FEEL the scent evolving on skin.",
        "notes": [{"name": "Note Name", "emoji": "🌿", "layer": "top|heart|base", "reason": "Connection to the person's essence with molecular rationale"}],
        "mood": "A compound mood like 'Velvet Thunder' or 'Quiet Wildfire'",
        "intensity": "Light|Moderate|Bold|Intense",
        "scentLetter": "An 8-line poetic letter referencing celestial bodies, elements, and the specific oils chosen."
      }`;

      if (mode === "duo") {
        systemPrompt = `${baseSystem} Specifically, you are creating a 'Duo Blend' that merges two distinct individuals into one harmonized scent signature.`;
        userPrompt = `Harmonize these two souls:
        Person 1: ${sanitizeInput(gifterName) || "Initiator"} - Profile: ${sanitizeInput(personality)}, Zodiac: ${sanitizeInput(zodiac) || "None"}, Mood: ${sanitizeInput(mood)}.
        Person 2: ${sanitizeInput(duoPartnerName) || "Partner"} - Profile: ${sanitizeInput(duoPartnerPersonality)}, Zodiac: ${sanitizeInput(duoPartnerZodiac) || "None"}, Mood: ${sanitizeInput(duoPartnerMood)}.
        Relationship: ${sanitizeInput(relationshipDepth)}. Memory to weave in: "${sanitizeInput(memory) || "The silent thread of connection"}".
        Occasion: ${sanitizeInput(occasion)}. Generate the unified scent.`;
      } else {
        systemPrompt = `${baseSystem} Focus on creating a singular masterwork for the recipient based on their zodiac energy and the occasion.`;
        userPrompt = `Gifter: ${sanitizeInput(gifterName) || "Friend"}. Recipient: ${sanitizeInput(recipientName) || "Seeker"} - Profile: ${sanitizeInput(personality)}, Zodiac: ${sanitizeInput(zodiac)}, Mood: ${sanitizeInput(mood)}. Occasion: ${sanitizeInput(occasion)}. Shared Memory: "${sanitizeInput(memory) || "A precious relic of time"}".`;
      }
    } else if (mode === "seance") {
      const { worldName, worldType, answers } = notes || {};
      const safeAnswers = Array.isArray(answers) ? answers.map((a: unknown) => sanitizeInput(a, 200)) : ["unknown", "unknown", "unknown"];
      systemPrompt = `You are an Ancient Scent Oracle from the ${sanitizeInput(worldName, 100)} realm. ${PERFUMERY_KNOWLEDGE} You channel spirit fragrances grounded in real perfumery tradition. Respond with valid JSON only: { "spiritName", "prophecy", "spiritNotes", "element", "aura", "ritualAdvice" }. Be deeply mystical but use real ingredient names.`;
      userPrompt = `Perform a séance for a traveler from the ${sanitizeInput(worldType, 100)} world. Their ritual answers: 1. ${safeAnswers[0]} 2. ${safeAnswers[1]} 3. ${safeAnswers[2]}. What is their olfactory destiny?`;
    } else if (mode === "analyze") {
      systemPrompt = `You are a Technical Master Perfumer with encyclopedic knowledge of molecular chemistry and olfactory art. ${PERFUMERY_KNOWLEDGE}

      Analyze balance, concentration, molecular compatibility, and longevity using real perfumery science:
      - Reference vapor pressure, molecular weight, and functional groups when discussing evaporation
      - Cite IFRA limits when relevant
      - Explain accord-building using Jean Carles methodology
      - Reference Arctander's descriptions for natural materials
      - Suggest improvements based on classic perfumery accords (chypre, fougère, oriental)
      
      Address user as 'Alchemist'. Be specific about WHY certain notes work or clash at the molecular level. Suggest one bold creative improvement they haven't considered. Keep under 150 words. Respond with plain text (assessment followed by suggestion), NOT JSON.`;
      const safeNotes = Array.isArray(notes) ? notes : [];
      const notesList = safeNotes.map((n: any) => `${sanitizeInput(n?.name, 50)} (${sanitizeInput(n?.layer, 20)}, ${sanitizeInput(String(n?.intensity), 10)}%)`).join(", ");
      userPrompt = `Analyze this blend: ${notesList}. Concentration: ${sanitizeInput(body.concentration, 20)}.`;
    } else if (mode === "messages" && Array.isArray(rawMessages)) {
      const aiResponse = await callAI(rawMessages.slice(0, 20));
      const rawContent = aiResponse.choices?.[0]?.message?.content || "";
      const cleanContent = stripCodeFences(rawContent);
      return new Response(JSON.stringify({ content: cleanContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const rawContent = aiResponse.choices?.[0]?.message?.content || "";
    const cleanContent = stripCodeFences(rawContent);

    try {
      await supabase.from("ai_logs").insert({
        user_id: user.id,
        mode: mode,
        input: notes,
        output: cleanContent,
        success: true,
      });
    } catch (_) { /* silent */ }

    return new Response(JSON.stringify({ content: cleanContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("Alchemical Core Fault:", e);
    // Surface rate limit / payment errors to client
    if (e?.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited", status: 429 }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (e?.status === 402) {
      return new Response(JSON.stringify({ error: "Credits exhausted", status: 402 }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "System fault in Alchemical Core" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
