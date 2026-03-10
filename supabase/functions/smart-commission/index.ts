import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case "calculate_commission": {
        const { order_id } = params;
        const { data: order } = await supabase.from("orders").select("*").eq("id", order_id).single();
        if (!order) throw new Error("Order not found");

        // Find client connection
        const { data: connection } = await supabase
          .from("client_connections")
          .select("*, affiliate_partners!client_connections_original_affiliate_id_fkey(user_id, commission_rate, tier)")
          .eq("client_email", order.customer_email?.toLowerCase())
          .maybeSingle();

        if (!connection) {
          return new Response(JSON.stringify({ commission: 0, reason: "No affiliate attribution" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        let commissionPct: number;
        if (connection.account_type === "B2B_Corporate") {
          // B2B: 10-20% based on deal size
          commissionPct = order.total >= 500 ? 20 : order.total >= 200 ? 15 : 10;
        } else {
          // B2C: flat 50%
          commissionPct = 50;
        }

        const commissionAmount = (order.total * commissionPct) / 100;

        return new Response(JSON.stringify({
          commission_pct: commissionPct,
          commission_amount: commissionAmount,
          account_type: connection.account_type,
          affiliate_id: connection.original_affiliate_id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_portfolio_stats": {
        // Get affiliate partner for this user
        const { data: partner } = await supabase
          .from("affiliate_partners")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (!partner) throw new Error("Not an affiliate");

        const { data: clients } = await supabase
          .from("client_connections")
          .select("*")
          .eq("original_affiliate_id", partner.id);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const stats = {
          total_clients: clients?.length || 0,
          active: clients?.filter(c => c.last_order_at && new Date(c.last_order_at) >= thirtyDaysAgo).length || 0,
          at_risk: clients?.filter(c => c.last_order_at && new Date(c.last_order_at) < thirtyDaysAgo && new Date(c.last_order_at) >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)).length || 0,
          inactive: clients?.filter(c => !c.last_order_at || new Date(c.last_order_at) < new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)).length || 0,
          total_revenue: clients?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0,
          b2b_count: clients?.filter(c => c.account_type === "B2B_Corporate").length || 0,
          b2c_count: clients?.filter(c => c.account_type === "B2C").length || 0,
        };

        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
