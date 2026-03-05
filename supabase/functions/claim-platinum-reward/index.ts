import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_RULE_ID = 1824548553042;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if already claimed
    const { data: existing } = await supabase
      .from("platinum_rewards")
      .select("discount_code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ discount_code: existing.discount_code, already_claimed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has Platinum Nez rank (2100+ XP)
    const { data: gameProgress } = await supabase
      .from("game_progress")
      .select("xp")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!gameProgress || gameProgress.xp < 2100) {
      return new Response(
        JSON.stringify({ error: "You must reach Platinum Nez rank (2100 XP) to claim this reward" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique discount code
    const code = `PLATINUM-${user.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    // Create discount code on Shopify
    const shopifyToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN")!;
    const shopifyRes = await fetch(
      `https://lenzo-hariri-2.myshopify.com/admin/api/2025-01/price_rules/${PRICE_RULE_ID}/discount_codes.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": shopifyToken,
        },
        body: JSON.stringify({
          discount_code: { code, usage_count: 0 },
        }),
      }
    );

    if (!shopifyRes.ok) {
      const errText = await shopifyRes.text();
      console.error("Shopify error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to generate discount code. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to DB
    const { error: insertError } = await supabase
      .from("platinum_rewards")
      .insert({ user_id: user.id, discount_code: code });

    if (insertError) {
      console.error("Insert error:", insertError);
      // If duplicate, fetch existing
      if (insertError.code === "23505") {
        const { data: dup } = await supabase
          .from("platinum_rewards")
          .select("discount_code")
          .eq("user_id", user.id)
          .maybeSingle();
        return new Response(
          JSON.stringify({ discount_code: dup?.discount_code, already_claimed: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to save reward" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ discount_code: code, already_claimed: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
