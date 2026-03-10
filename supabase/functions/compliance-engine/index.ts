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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // 1. Get all active affiliates
    const { data: affiliates } = await supabase
      .from("affiliate_partners")
      .select("id, user_id, display_name, email, total_sales, last_active_at")
      .eq("status", "active");

    if (!affiliates || affiliates.length === 0) {
      return new Response(JSON.stringify({ message: "No active affiliates", processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let compliantCount = 0;
    let voidedCount = 0;
    let orphanedCount = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const affiliate of affiliates) {
      // Count sales this week from partner_sales_reports
      const { count: salesCount } = await supabase
        .from("partner_sales_reports")
        .select("*", { count: "exact", head: true })
        .eq("affiliate_partner_id", affiliate.id)
        .gte("sale_date", weekStart.toISOString().split("T")[0])
        .lte("sale_date", weekEnd.toISOString().split("T")[0])
        .eq("status", "approved");

      const weekSales = salesCount || 0;
      const isCompliant = weekSales >= 5;

      // Upsert compliance record
      await supabase.from("affiliate_compliance").upsert(
        {
          affiliate_id: affiliate.id,
          user_id: affiliate.user_id,
          week_start: weekStart.toISOString().split("T")[0],
          week_end: weekEnd.toISOString().split("T")[0],
          sales_count: weekSales,
          is_compliant: isCompliant,
          commission_voided: !isCompliant,
          checked_at: now.toISOString(),
        },
        { onConflict: "affiliate_id,week_start" }
      );

      if (isCompliant) {
        compliantCount++;
        // Update compliance streak
        await supabase
          .from("affiliate_partners")
          .update({
            is_compliant: true,
            compliance_streak_days: affiliate.compliance_streak_days
              ? affiliate.compliance_streak_days + 7
              : 7,
            last_active_at: now.toISOString(),
          })
          .eq("id", affiliate.id);
      } else {
        voidedCount++;
        await supabase
          .from("affiliate_partners")
          .update({ is_compliant: false, compliance_streak_days: 0 })
          .eq("id", affiliate.id);

        // Void pending commissions for this week
        await supabase
          .from("commission_ledger")
          .update({ status: "voided" })
          .eq("user_id", affiliate.user_id)
          .eq("status", "pending")
          .gte("created_at", weekStart.toISOString());
      }

      // 2. Orphaning Logic: 30 days inactive
      if (affiliate.last_active_at && new Date(affiliate.last_active_at) < thirtyDaysAgo) {
        // Reassign all client_connections to company house
        await supabase
          .from("client_connections")
          .update({
            original_affiliate_id: null,
            notes: `Auto-orphaned: ${affiliate.display_name} inactive 30+ days`,
          })
          .eq("original_affiliate_id", affiliate.id);

        // Mark affiliate as suspended
        await supabase
          .from("affiliate_partners")
          .update({ status: "suspended", is_compliant: false })
          .eq("id", affiliate.id);

        orphanedCount++;

        // Log security event
        await supabase.rpc("log_security_event", {
          _event_type: "affiliate_orphaned",
          _severity: "medium",
          _user_id: affiliate.user_id,
          _details: {
            affiliate_id: affiliate.id,
            last_active: affiliate.last_active_at,
            reason: "30_day_inactivity",
          },
        });
      }
    }

    // 3. Session Fingerprinting Check — flag suspicious logins
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { data: suspiciousSessions } = await supabase
      .from("session_fingerprints")
      .select("user_id, ip_address")
      .gte("created_at", oneHourAgo.toISOString());

    if (suspiciousSessions) {
      const userIpMap = new Map<string, Set<string>>();
      for (const s of suspiciousSessions) {
        if (!userIpMap.has(s.user_id)) userIpMap.set(s.user_id, new Set());
        if (s.ip_address) userIpMap.get(s.user_id)!.add(s.ip_address);
      }

      for (const [userId, ips] of userIpMap) {
        if (ips.size >= 5) {
          // Lock withdrawals
          await supabase
            .from("affiliate_partners")
            .update({ withdrawals_locked: true })
            .eq("user_id", userId);

          // Log security event
          await supabase.rpc("log_security_event", {
            _event_type: "suspicious_session_activity",
            _severity: "high",
            _user_id: userId,
            _details: {
              unique_ips: ips.size,
              ips: Array.from(ips),
              action: "withdrawals_locked",
            },
          });
        }
      }
    }

    const result = {
      processed: affiliates.length,
      compliant: compliantCount,
      voided: voidedCount,
      orphaned: orphanedCount,
      timestamp: now.toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
