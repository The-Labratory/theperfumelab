import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BusinessSidebar } from "./BusinessSidebar";

export default function BusinessLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<any>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      const { data } = await supabase
        .from("affiliate_partners")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!data) { navigate("/affiliate-signup"); return; }
      setAffiliate(data);
      setLoading(false);
    };
    check();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <BusinessSidebar affiliate={affiliate} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/30 px-4 glass-surface sticky top-0 z-40">
            <SidebarTrigger className="mr-3" />
            <h1 className="font-display text-sm tracking-[0.2em] text-foreground font-bold">MY BUSINESS</h1>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <Outlet context={{ affiliate }} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
