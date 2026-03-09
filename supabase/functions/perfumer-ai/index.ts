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
async function callAI(messages: any[], model = "google/gemini-2-flash-preview") {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${LOVABLE_API_KEY}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({ 
      model, 
      messages, 
      temperature: 0.85 // High creativity for alchemical prompts
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

    let systemPrompt = "";
    let userPrompt = "";

    // --- MODE 1: ALCHEMICAL HARMONIZATION (GIFT & DUO) ---
    // Includes Zodiac, Personality, Personality, Memory, and Relationship logic
    if (mode === "gift" || mode === "duo") {
      const { 
        personality, occasion, mood, memory, zodiac, relationshipDepth, 
        gifterName, recipientName, duoPartnerPersonality, duoPartnerMood, 
        duoPartnerName, duoPartnerZodiac 
      } = notes;

      const baseSystem = `You are the Perfume Lab's Master Alchemist and Celestial Oracle. You blend high-end fragrances by merging psychological profiles with zodiac alignments. 
      You must respond with valid JSON only, no markdown. Format:
      {
        "blendName": "A creative name relating to the soul union or the stars",
        "story": "A 3-4 sentence poetic story weaving together components of the user's personality and shared memory",
        "notes": [{"name": "Note Name", "emoji": "🌿", "layer": "top|heart|base", "reason": "Connection to zodiac/mood"}],
        "mood": "One word",
        "intensity": "Light|Moderate|Bold|Intense",
        "scentLetter": "A 6-line poetic letter addressed to the seeker, explaining why their celestial alignment and spirit required these specific oils."
      }`;

      if (mode === "duo") {
        systemPrompt = `${baseSystem} Specifically, you are creating a 'Duo Blend' that merges two distinct individuals into one harmonized scent signature.`;
        userPrompt = `Harmonize these two souls:
        Person 1: ${gifterName || "Initiator"} - Profile: ${personality}, Zodiac: ${zodiac || "None"}, Mood: ${mood}.
        Person 2: ${duoPartnerName || "Partner"} - Profile: ${duoPartnerPersonality}, Zodiac: ${duoPartnerZodiac || "None"}, Mood: ${duoPartnerMood}.
        Relationship: ${relationshipDepth}. Memory to weave in: "${memory || "The silent thread of connection"}".
        Occasion: ${occasion}. Generate the unified scent.`;
      } else {
        systemPrompt = `${baseSystem} Focus on creating a singular masterwork for the recipient based on their zodiac energy and the occasion.`;
        userPrompt = `Gifter: ${gifterName || "Friend"}. Recipient: ${recipientName || "Seeker"} - Profile: ${personality}, Zodiac: ${zodiac}, Mood: ${mood}. Occasion: ${occasion}. Shared Memory: "${memory || "A precious relic of time"}".`;
      }
    } 

    // --- MODE 2: SCENT SÉANCE (MYSTICAL ORACLE) ---
    else if (mode === "seance") {
      const { worldName, worldType, answers } = notes;
      systemPrompt = `You are an Ancient Scent Oracle from the ${worldName} realm. You channel spirit fragrances. Respond with valid JSON only: { "spiritName", "prophecy", "spiritNotes", "element", "aura", "ritualAdvice" }. Be deeply mystical and unique.`;
      userPrompt = `Perform a séance for a traveler from the ${worldType} world. Their ritual answers: 1. ${answers[0]} 2. ${answers[1]} 3. ${answers[2]}. What is their olfactory destiny?`;
    }

    // --- MODE 3: ANALYZE (TECHNICAL EXPERTISE) ---
    else if (mode === "analyze") {
      systemPrompt = `You are a Technical Master Perfumer. Analyze balance and concentration. Address user as 'Alchemist'. Keep under 80 words. JSON format: { "assessment", "suggestion" }.`;
      const notesList = notes.map((n: any) => `${n.name} (${n.layer}, ${n.intensity}%)`).join(", ");
      userPrompt = `Analyze this blend: ${notesList}. Concentration: ${body.concentration}.`;
    }

    // --- MODE 4: DYNAMIC PROTOCOL (SELF-UPDATING) ---
    // Checks DB for any newly injected modes or "Hacker/Horoscope/Daily" modules
    else {
      const { data: protocol } = await supabase.from("ai_protocols").select("*").eq("mode", mode).single();
      
      if (protocol) {
        systemPrompt = protocol.system_prompt;
        userPrompt = JSON.stringify(notes || rawMessages);
      } else {
        // AUTONOMOUS DISCOVERY: If mode is totally unknown, let the AI figure out the best persona
        systemPrompt = `You are an Omniscient Alchemist specializing in Cybersecurity, Astrology, and Perfumery. 
        You have received data for an unknown mode: "${mode}". Use your broad intelligence to provide the best specialized response possible in JSON format.`;
        userPrompt = JSON.stringify(notes || rawMessages || { message: "General query" });
      }
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
```*