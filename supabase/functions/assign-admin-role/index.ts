import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAILS = [
  "hariri@lenzohariri.com",
  "loranshariri@gmail.com",
];

// Only this email gets super_admin
const SUPER_ADMIN_EMAIL = "hariri@lenzohariri.com";

Deno.serve(async (req) => {
  // This function is triggered by auth webhook on user signup
  // It checks if the new user's email is in the admin list and assigns the admin role
  
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

    if (!ADMIN_EMAILS.includes(userEmail)) {
      return new Response(JSON.stringify({ message: "Not an admin email" }), { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if role already exists
    const { data: existing } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ message: "Already admin" }), { status: 200 });
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (error) throw error;

    console.log(`Admin role assigned to ${userEmail}`);
    return new Response(JSON.stringify({ message: "Admin role assigned" }), { status: 200 });
  } catch (err) {
    console.error("Error assigning admin role:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
});
