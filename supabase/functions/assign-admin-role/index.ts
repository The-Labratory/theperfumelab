import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  // This function is triggered by auth webhook on user signup
  // It checks the admin_whitelist table to determine if the new user should get admin/super_admin roles

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    const userEmail = (payload?.record?.email || payload?.email || "").toLowerCase().trim();
    const userId = payload?.record?.id || payload?.user_id;

    if (!userId || !userEmail) {
      return new Response(JSON.stringify({ message: "No user data" }), { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check the admin_whitelist table instead of hardcoded emails
    const { data: whitelistEntry } = await supabaseAdmin
      .from("admin_whitelist")
      .select("email, grants_super_admin")
      .eq("email", userEmail)
      .maybeSingle();

    if (!whitelistEntry) {
      return new Response(JSON.stringify({ message: "Not an admin email" }), { status: 200 });
    }

    // Assign admin role
    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (error) throw error;
    }

    // Assign super_admin if whitelisted for it
    if (whitelistEntry.grants_super_admin) {
      const { data: existingSA } = await supabaseAdmin
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", "super_admin")
        .maybeSingle();

      if (!existingSA) {
        const { error } = await supabaseAdmin
          .from("user_roles")
          .insert({ user_id: userId, role: "super_admin" });
        if (error) throw error;
      }
    }

    console.log(`Admin role assigned to ${userEmail}`);
    return new Response(JSON.stringify({ message: "Admin role assigned" }), { status: 200 });
  } catch (err) {
    console.error("Error assigning admin role:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
});
