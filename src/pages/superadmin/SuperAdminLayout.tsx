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
