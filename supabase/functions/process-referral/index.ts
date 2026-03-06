import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { action, user_id, referral_code, invite_code } = await req.json();

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!).auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "process_signup_referral") {
      // Called after signup to process referral code
      if (!referral_code) {
        return new Response(JSON.stringify({ error: "No referral code" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.rpc("process_referral_signup", {
        _new_user_id: user.id,
        _referral_code: referral_code,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "accept_invite") {
      if (!invite_code) {
        return new Response(JSON.stringify({ error: "No invite code" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find the invite
      const { data: invite } = await supabase
        .from("referral_invites")
        .select("*")
        .eq("invite_code", invite_code)
        .eq("status", "pending")
        .maybeSingle();

      if (!invite) {
        return new Response(JSON.stringify({ error: "Invalid or expired invite" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Prevent self-invite
      if (invite.inviter_user_id === user.id) {
        await supabase.from("fraud_flags").insert([{
          user_id: user.id,
          flag_type: "self_invite_accept",
          severity: "high",
          details: { invite_code },
        }]);
        return new Response(JSON.stringify({ error: "Cannot accept own invite" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get inviter's referral code and process
      const { data: inviterProfile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("user_id", invite.inviter_user_id)
        .maybeSingle();

      if (!inviterProfile?.referral_code) {
        return new Response(JSON.stringify({ error: "Inviter profile not found" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.rpc("process_referral_signup", {
        _new_user_id: user.id,
        _referral_code: inviterProfile.referral_code,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark invite as accepted
      await supabase
        .from("referral_invites")
        .update({ status: "accepted", invited_user_id: user.id, accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
