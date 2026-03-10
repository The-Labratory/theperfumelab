import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: corsHeaders });
    }

    // Fetch affiliate profile
    const { data: affiliate, error: affErr } = await supabase
      .from("affiliate_partners")
      .select("id, slug, display_name, referral_code, commission_rate, tier")
      .eq("user_id", user.id)
      .maybeSingle();

    if (affErr || !affiliate) {
      return new Response(JSON.stringify({ error: "Affiliate not found" }), { status: 404, headers: corsHeaders });
    }

    // Generate marketing kit content
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "https://theperfumelab.lovable.app";
    const referralLink = `${baseUrl}/r/${affiliate.slug}`;
    
    const kit = {
      affiliate: {
        name: affiliate.display_name,
        slug: affiliate.slug,
        referralCode: affiliate.referral_code,
        tier: affiliate.tier,
        commissionRate: affiliate.commission_rate,
      },
      links: {
        landing: `${baseUrl}/affiliate/${affiliate.slug}`,
        referral: referralLink,
        store: `${baseUrl}/store?ref=${affiliate.referral_code}`,
      },
      templates: {
        instagram: `🌹 Create your own luxury fragrance! Use my link for an exclusive experience: ${referralLink} #ThePerfumeLab #CustomFragrance`,
        tiktok: `POV: You just created your own luxury perfume 🔥 Link in bio: ${referralLink}`,
        email_subject: `Your Personal Invitation to The Perfume Lab`,
        email_body: `Hi there!\n\nI wanted to share something special with you — The Perfume Lab lets you create your own custom luxury fragrance.\n\nUse my personal link to get started: ${referralLink}\n\nBest,\n${affiliate.display_name}`,
        whatsapp: `Hey! 👋 Check out The Perfume Lab — you can create your own custom perfume! Use my link: ${referralLink}`,
      },
      guidelines: [
        "Always use your unique referral link when promoting",
        "Don't make income claims or guarantees",
        "Be authentic — share your genuine experience",
        "Tag @ThePerfumeLab in social media posts",
        "Disclose your affiliate relationship (#ad #partner)",
      ],
    };

    return new Response(JSON.stringify(kit), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: corsHeaders });
  }
});
