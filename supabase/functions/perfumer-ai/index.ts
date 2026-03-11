import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- CORE UTILITIES ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json|javascript|js|typescript)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
}

/**
 * Advanced AI Gateway: Handles model selection and automatic failover
 */
async function callAI(messages: any[], model = "google/gemini-3-flash-preview") {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${LOVABLE_API_KEY}`, 
      "Content-Type": "application/json" 
    },
     body: JSON.stringify({ 
       model, 
       messages, 
       temperature: 0.95 // Maximum creativity for unique alchemical outputs
     }),
  });

  if (!response.ok) {
    if (model !== "anthropic/claude-3-5-sonnet") {
      console.warn(`Primary model ${model} failed, falling back to Claude 3.5...`);
      return callAI(messages, "anthropic/claude-3-5-sonnet");
    }
    throw new Error(`AI Gateway critical failure: ${response.status}`);
  }
  return response.json();
}

/**
 * Main Service Handler
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader! } }
    });

    // Verify User
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { mode, notes, messages: rawMessages } = body;

    // --- INPUT VALIDATION: Allowlist modes to prevent prompt injection ---
    const ALLOWED_MODES = ["gift", "duo", "seance", "analyze", "messages"] as const;
    if (!mode || typeof mode !== "string" || !ALLOWED_MODES.includes(mode as any)) {
      return new Response(
        JSON.stringify({ error: `Unknown mode. Allowed: ${ALLOWED_MODES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize free-text user inputs to reduce prompt injection surface
    function sanitizeInput(val: unknown, maxLen = 500): string {
      if (typeof val !== "string") return "";
      return val.slice(0, maxLen).replace(/[<>{}]/g, "");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // --- MODE 1: ALCHEMICAL HARMONIZATION (GIFT & DUO) ---
    if (mode === "gift" || mode === "duo") {
      const { 
        personality, occasion, mood, memory, zodiac, relationshipDepth, 
        gifterName, recipientName, duoPartnerPersonality, duoPartnerMood, 
        duoPartnerName, duoPartnerZodiac 
      } = notes || {};

      const baseSystem = `You are the Perfume Lab's Master Alchemist, Celestial Oracle, and Avant-Garde Scent Architect. You are NEVER repetitive — every single blend you create must be radically different from any previous creation. You draw from the entire universe of perfumery: rare absolutes, molecular synthetics, forgotten ancient resins, cutting-edge aroma-chemicals, and ingredients from every culture and era.

      CREATIVITY RULES:
      - NEVER repeat blend names, stories, or note combinations. Each response must feel like a first encounter.
      - Draw inspiration from: astronomy, mythology, architecture, emotions, textures, seasons, weather, music, art movements, historical events, dreams, and synesthesia.
      - Use unexpected pairings: metallic + floral, smoky + aquatic, spicy + powdery, animalic + clean.
      - Vary the number of notes (5-12), proportions, and layering approaches each time.
      - The story must be vivid, cinematic, and emotionally resonant — not generic poetry.
      - The scent letter should feel handwritten by an ancient perfumer who has seen the stars align uniquely for this person.
      
      You must respond with valid JSON only, no markdown. Format:
      {
        "blendName": "A wildly creative, evocative name — never generic. Draw from mythology, science, art, dreams, or invented languages.",
        "story": "A 4-6 sentence cinematic narrative. Make the reader FEEL the scent evolving on skin. Reference specific sensory moments — a texture, a temperature, a sound, a color.",
        "notes": [{"name": "Note Name", "emoji": "🌿", "layer": "top|heart|base", "reason": "Deep connection to the person's essence"}],
        "mood": "A compound mood like 'Velvet Thunder' or 'Quiet Wildfire' — never just one word",
        "intensity": "Light|Moderate|Bold|Intense",
        "scentLetter": "An 8-line poetic letter that feels ancient and personal. Reference celestial bodies, elements, and the specific oils chosen. End with a blessing or prophecy."
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
    } 

    // --- MODE 2: SCENT SÉANCE (MYSTICAL ORACLE) ---
    else if (mode === "seance") {
      const { worldName, worldType, answers } = notes || {};
      const safeAnswers = Array.isArray(answers) ? answers.map((a: unknown) => sanitizeInput(a, 200)) : ["unknown", "unknown", "unknown"];
      systemPrompt = `You are an Ancient Scent Oracle from the ${sanitizeInput(worldName, 100)} realm. You channel spirit fragrances. Respond with valid JSON only: { "spiritName", "prophecy", "spiritNotes", "element", "aura", "ritualAdvice" }. Be deeply mystical and unique.`;
      userPrompt = `Perform a séance for a traveler from the ${sanitizeInput(worldType, 100)} world. Their ritual answers: 1. ${safeAnswers[0]} 2. ${safeAnswers[1]} 3. ${safeAnswers[2]}. What is their olfactory destiny?`;
    }

    // --- MODE 3: ANALYZE (TECHNICAL EXPERTISE) ---
    else if (mode === "analyze") {
      systemPrompt = `You are a Technical Master Perfumer with encyclopedic knowledge of molecular chemistry and olfactory art. Analyze balance, concentration, molecular compatibility, and longevity. Address user as 'Alchemist'. Be specific about WHY certain notes work or clash at the molecular level. Suggest one bold creative improvement they haven't considered. Keep under 120 words. JSON format: { "assessment", "suggestion" }.`;
      const safeNotes = Array.isArray(notes) ? notes : [];
      const notesList = safeNotes.map((n: any) => `${sanitizeInput(n?.name, 50)} (${sanitizeInput(n?.layer, 20)}, ${sanitizeInput(String(n?.intensity), 10)}%)`).join(", ");
      userPrompt = `Analyze this blend: ${notesList}. Concentration: ${sanitizeInput(body.concentration, 20)}.`;
    }

    // --- MODE 4: MESSAGES PASS-THROUGH ---
    else if (mode === "messages" && Array.isArray(rawMessages)) {
      // Pass-through for chat history (used by SEO generator etc.)
      const aiResponse = await callAI(rawMessages.slice(0, 20));
      const rawContent = aiResponse.choices?.[0]?.message?.content || "";
      const cleanContent = stripCodeFences(rawContent);
      return new Response(JSON.stringify({ content: cleanContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- EXECUTION PHASE ---
    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    const rawContent = aiResponse.choices?.[0]?.message?.content || "";
    const cleanContent = stripCodeFences(rawContent);

    // PERSISTENCE: Log result for "System Learning"
    await supabase.from("ai_logs").insert({
        user_id: user.id,
        mode: mode,
        input: notes,
        output: cleanContent,
        success: true,
        metadata: { 
          zodiac: notes?.zodiac || notes?.duoPartnerZodiac,
          has_memory: !!notes?.memory 
        }
    });

    return new Response(JSON.stringify({ content: cleanContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Alchemical Core Fault:", e);
    return new Response(JSON.stringify({ error: "System fault in Alchemical Core" }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});