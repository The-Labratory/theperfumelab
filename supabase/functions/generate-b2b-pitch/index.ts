import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_LEN = 200;
const sanitize = (v: string | undefined, fallback = "") =>
  (v ?? fallback).slice(0, MAX_LEN).replace(/[<>]/g, "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth check ──────────────────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Input validation ────────────────────────────────────────────────
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json();
    const businessName = sanitize(body.businessName);
    const businessType = sanitize(body.businessType);
    const affiliateName = sanitize(body.affiliateName);
    const discount = sanitize(body.discount, "40");
    const expectedVolume = sanitize(body.expectedVolume);
    // Support the legacy "prompt" field from BusinessPitchBuilder
    const rawPrompt: string | undefined = body.prompt;

    if (!rawPrompt && (!businessName || !businessType || !affiliateName)) {
      return new Response(
        JSON.stringify({ error: "businessName, businessType, and affiliateName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Build messages ──────────────────────────────────────────────────
    let messages: Array<{ role: string; content: string }>;

    if (rawPrompt) {
      // BusinessPitchBuilder sends a full prompt
      const safePrompt = rawPrompt.slice(0, 3000);
      messages = [{ role: "user", content: safePrompt }];
    } else {
      const systemPrompt = `You are a luxury perfume brand's B2B partnership specialist for "The Perfume Laboratory by Louis Hariri". 
You craft elegant, persuasive partnership proposals in Markdown format.

Brand positioning:
- Niche artisan perfumery with molecular-precision formulation
- Handcrafted in small batches, IFRA-compliant
- Premium pricing with strong margins for partners
- Unique "Scent-Lock" attribution system for long-term partner revenue

Always include these sections:
1. **Executive Summary** — A compelling 2-3 sentence hook tailored to their industry
2. **Why [Business Name]?** — Industry-specific analysis of why scent enhances their customer experience
3. **Partnership Structure** — Discount tiers, volume pricing, exclusivity options
4. **Revenue Projection** — Simple table with conservative/moderate/aggressive scenarios
5. **Implementation Plan** — 30/60/90 day rollout timeline
6. **Next Steps** — Clear CTA with the affiliate's name

Keep it professional yet warm. Use € for currency. Format beautifully in Markdown.`;

      const userPrompt = `Generate a B2B partnership pitch for:
- Business: ${businessName}
- Industry: ${businessType}
- Partner/Affiliate: ${affiliateName}
- Pre-negotiated discount: ${discount}%
${expectedVolume ? `- Expected volume: ${expectedVolume}` : ""}

Make the pitch specific to the ${businessType} industry and explain how luxury scent products enhance their business.`;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ];
    }

    // ── AI call ─────────────────────────────────────────────────────────
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "Failed to generate pitch" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const pitch = result.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ pitch, businessName, businessType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-b2b-pitch error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
