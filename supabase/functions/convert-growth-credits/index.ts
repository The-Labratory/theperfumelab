import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const userId = claimsData.claims.sub;
    const { action, amount } = await req.json();

    if (action !== "convert" && action !== "spend") {
      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
    }

    if (typeof amount !== "number" || amount <= 0 || amount > 100000) {
      return new Response(JSON.stringify({ error: "Invalid amount" }), { status: 400, headers: corsHeaders });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "convert") {
      // Convert cash to growth credits at 1.2x
      const creditAmount = amount * 1.2;
      const { error } = await adminClient.from("growth_credits").insert({
        user_id: userId,
        amount: creditAmount,
        cash_amount: amount,
        credit_type: "conversion",
        multiplier: 1.2,
        notes: `Converted €${amount} to ${creditAmount} credits`,
      });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, credits: creditAmount }), { headers: corsHeaders });
    }

    if (action === "spend") {
      // Check balance first
      const { data: credits } = await adminClient
        .from("growth_credits")
        .select("amount")
        .eq("user_id", userId);

      const balance = (credits || []).reduce((sum: number, c: any) => sum + c.amount, 0);
      if (balance < amount) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 400, headers: corsHeaders });
      }

      const { error } = await adminClient.from("growth_credits").insert({
        user_id: userId,
        amount: -amount,
        cash_amount: 0,
        credit_type: "spend",
        multiplier: 1,
        notes: `Spent ${amount} credits`,
      });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, spent: amount }), { headers: corsHeaders });
    }
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders });
  }
});
