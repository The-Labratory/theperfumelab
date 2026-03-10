// Translation Agent edge function

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  de: "German",
  ar: "Arabic",
  tr: "Turkish",
  es: "Spanish",
  fr: "French",
};

// In-memory cache to avoid re-translating the same keys within the function's lifecycle
const translationCache = new Map<string, string>();

async function callAI(messages: any[]) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages,
      temperature: 0.1,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI call failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

function stripCodeFences(text: string): string {
  return text.replace(/^```(?:json|javascript|js|typescript)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keys, targetLang, defaultValues } = await req.json();

    // Validate inputs
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return new Response(JSON.stringify({ error: "keys array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!targetLang || !LANGUAGE_NAMES[targetLang]) {
      return new Response(JSON.stringify({ error: "Invalid target language" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (targetLang === "en") {
      // English is the source language — just return the default values
      const result: Record<string, string> = {};
      keys.forEach((key: string, i: number) => {
        result[key] = defaultValues?.[i] || key;
      });
      return new Response(JSON.stringify({ translations: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache for already-translated keys
    const uncachedKeys: string[] = [];
    const uncachedDefaults: string[] = [];
    const result: Record<string, string> = {};

    keys.forEach((key: string, i: number) => {
      const cacheKey = `${targetLang}:${key}`;
      if (translationCache.has(cacheKey)) {
        result[key] = translationCache.get(cacheKey)!;
      } else {
        uncachedKeys.push(key);
        uncachedDefaults.push(defaultValues?.[i] || key);
      }
    });

    if (uncachedKeys.length === 0) {
      return new Response(JSON.stringify({ translations: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the translation payload
    const toTranslate: Record<string, string> = {};
    uncachedKeys.forEach((key, i) => {
      toTranslate[key] = uncachedDefaults[i];
    });

    const langName = LANGUAGE_NAMES[targetLang];
    const isRTL = targetLang === "ar";

    const systemPrompt = `You are a professional translator for a luxury perfumery brand called "The Perfume Lab". 
Translate the following JSON object values from English to ${langName}.
${isRTL ? "This is a Right-to-Left language. Ensure proper RTL text formatting." : ""}

Rules:
- Only translate the VALUES, keep the keys exactly as they are
- Maintain the same tone: luxurious, exclusive, sophisticated
- Keep brand names like "The Perfume Lab", "IFRA", "Google" untranslated
- Keep technical terms (DNA, AI, SSL) in their original form
- Preserve any HTML entities, placeholders like {{variable}}, or special characters
- Return ONLY a valid JSON object with the translated values, no explanation

Input JSON:`;

    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(toTranslate, null, 2) },
    ]);

    const cleaned = stripCodeFences(aiResponse);
    let translated: Record<string, string>;

    try {
      translated = JSON.parse(cleaned);
    } catch {
      // If AI returns invalid JSON, fall back to defaults
      console.error("Failed to parse AI translation response:", cleaned);
      translated = toTranslate;
    }

    // Merge translated results and cache them
    for (const key of uncachedKeys) {
      const value = translated[key] || toTranslate[key];
      result[key] = value;
      translationCache.set(`${targetLang}:${key}`, value);
    }

    return new Response(JSON.stringify({ translations: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    console.error("Translation agent error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
