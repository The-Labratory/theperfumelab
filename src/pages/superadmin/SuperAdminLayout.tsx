import { Outlet, useNavigate, Link } from "react-router-dom";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Users, UserCheck, Shield, ScrollText, AlertTriangle, Settings, LogOut, Lock, Crown, Triangle, Database, HardDrive, KeyRound, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useState } from "react";

const superAdminNav = [
  { title: "Dashboard", url: "/superadmin", icon: LayoutDashboard },
  { title: "Employee Requests", url: "/superadmin/employee-requests", icon: UserCheck },
  { title: "Customers", url: "/superadmin/customers", icon: Users },
  { title: "Agents", url: "/superadmin/agents", icon: UserCheck },
  { title: "Permissions", url: "/superadmin/permissions", icon: KeyRound },
  { title: "Inactivity Auction", url: "/superadmin/auction", icon: Triangle },
  { title: "Database Explorer", url: "/superadmin/database", icon: Database },
  { title: "Storage Manager", url: "/superadmin/storage", icon: HardDrive },
  { title: "Audit Logs", url: "/superadmin/audit-logs", icon: ScrollText },
  { title: "Security Events", url: "/superadmin/security-events", icon: AlertTriangle },
  { title: "System Settings", url: "/superadmin/system-settings", icon: Settings },
  { title: "Referral Network", url: "/superadmin/referrals", icon: GitBranch },
  { title: "Network Builder", url: "/superadmin/analytics/pyramid-builder", icon: Triangle },
];

export default function SuperAdminLayout() {
  const { user, isSuperAdmin, loading, logSecurityEvent } = useSuperAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Signed in");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-surface rounded-2xl p-8 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-display font-bold text-foreground">Super Admin</h1>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="sa-email" className="text-muted-foreground text-xs">Email</Label>
              <Input id="sa-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="sa-password" className="text-muted-foreground text-xs">Password</Label>
              <Input id="sa-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="mt-1" />
            </div>
            <Button type="submit" disabled={authLoading} className="w-full">
              {authLoading ? "Please wait…" : "Sign In"}
            </Button>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>
          <Button variant="outline" className="w-full gap-2 text-xs" onClick={async () => {
            const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
            if (error) toast.error(error.message);
          }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="w-full mt-4 text-muted-foreground text-xs">← Back to Site</Button>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    logSecurityEvent("forbidden_access_attempt", { path: "/superadmin", email: user.email });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-surface rounded-2xl p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-display font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-2">Super Admin privileges required.</p>
          <p className="text-xs text-muted-foreground mb-6">Signed in as {user.email}. This attempt has been logged.</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleSignOut} className="gap-2"><LogOut className="w-4 h-4" /> Sign Out</Button>
            <Button variant="outline" onClick={() => navigate("/")}>Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Super Admin</span>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {superAdminNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.url} end={item.url === "/superadmin"} className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
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
                <span className="text-[10px] text-amber-500 font-medium">SUPER ADMIN</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate px-2">{user.email}</p>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border/30 px-4 glass-surface">
            <SidebarTrigger className="mr-4" />
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to Site</Link>
            <Link to="/admin" className="ml-4 text-xs text-muted-foreground hover:text-foreground transition-colors">→ Admin Panel</Link>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
