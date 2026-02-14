import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { notes, concentration, mode } = body;

    // Input validation
    if (!mode || (mode !== "analyze" && mode !== "gift")) {
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
    if (mode === "gift") {
      if (!notes || typeof notes !== "object" || !notes.personality || !notes.occasion || !notes.mood) {
        return new Response(JSON.stringify({ error: "Invalid gift parameters" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt: string;
    let userPrompt: string;

    if (mode === "gift") {
      // Gifting mode: generate blend suggestion
      const { personality, occasion, mood } = notes; // reusing notes field for gift data
      systemPrompt = `You are The Perfume Lab's Master Perfumer AI. You suggest custom fragrance blends for gifts.
You must respond with valid JSON only, no markdown. Format:
{
  "blendName": "Creative Name",
  "story": "2-3 sentence poetic story about this blend",
  "notes": [
    {"name": "Note Name", "emoji": "🌹", "layer": "top|heart|base", "reason": "Why this note fits"}
  ],
  "mood": "One word mood",
  "intensity": "Light|Moderate|Bold|Intense"
}
Suggest 5-7 notes across all three layers. Be creative and luxurious.`;
      userPrompt = `Create a gift fragrance for someone with a ${personality} personality, for a ${occasion} occasion, with a ${mood} mood.`;
    } else {
      // Perfumer assistant mode: analyze blend
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
