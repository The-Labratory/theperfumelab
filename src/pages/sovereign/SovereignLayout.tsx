import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  SidebarProvider, SidebarTrigger, Sidebar, SidebarContent,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Crown, Users, Vault, MapPin, GitBranch, Brain, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sovereignNav = [
  { title: "Command Center", url: "/sovereign", icon: Crown },
  { title: "Growth Vault", url: "/sovereign/vault", icon: Vault },
  { title: "Scent Stations", url: "/sovereign/stations", icon: MapPin },
  { title: "Network Tree", url: "/sovereign/tree", icon: GitBranch },
  { title: "AI Consigliere", url: "/sovereign/ai", icon: Brain },
];

export default function SovereignLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out");
  };

  useEffect(() => {
    if (!user || loading) return;
    const checkAccess = async () => {
      const { data } = await supabase
        .from("affiliate_partners")
        .select("id, tier")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!data) {
        navigate("/affiliate-signup", { replace: true });
        return;
      }
      setAuthorized(true);
    };
    checkAccess();
  }, [user, loading, navigate]);

  if (loading || authorized === null) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Sovereign Manager</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sovereignNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/sovereign"}
                          className="hover:bg-[hsl(var(--muted)/0.5)]"
                          activeClassName="bg-[hsl(var(--muted))] text-[hsl(var(--primary))] font-medium"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <div className="mt-auto p-4 space-y-1">
              <div className="flex items-center gap-1.5 px-2">
                <Crown className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-amber-500 font-medium">SOVEREIGN</span>
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] truncate px-2">{user.email}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-[hsl(var(--border)/0.3)] px-4 bg-[hsl(var(--card))]">
            <SidebarTrigger className="mr-4" />
            <Link to="/" className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              ← Back to Site
            </Link>
            <Link to="/my-business" className="ml-4 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              → Business Portal
            </Link>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
