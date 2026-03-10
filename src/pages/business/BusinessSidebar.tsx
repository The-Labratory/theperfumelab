import {
  LayoutDashboard, TrendingUp, Package, Users, Share2,
  Target, FileText, Network, ChevronRight, Briefcase, BookUser
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/my-business", icon: LayoutDashboard, end: true },
  { title: "Client CRM", url: "/my-business/crm", icon: BookUser },
  { title: "Sales", url: "/my-business/sales", icon: TrendingUp },
  { title: "Inventory", url: "/my-business/inventory", icon: Package },
  { title: "Customers", url: "/my-business/customers", icon: Users },
  { title: "My Network", url: "/my-business/network", icon: Network },
  { title: "Marketing", url: "/my-business/marketing", icon: Share2 },
  { title: "Goals", url: "/my-business/goals", icon: Target },
  { title: "Reports", url: "/my-business/reports", icon: FileText },
];

export function BusinessSidebar({ affiliate }: { affiliate: any }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const tierEmoji: Record<string, string> = {
    bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎", high_achiever: "👑",
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarContent>
        {/* Profile card */}
        {!collapsed && (
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-display font-bold text-sm">
                {affiliate?.display_name?.charAt(0) || "P"}
              </div>
              <div className="min-w-0">
                <p className="font-display text-sm font-bold text-foreground truncate">{affiliate?.display_name}</p>
                <p className="text-[10px] font-display tracking-wider text-muted-foreground">
                  {tierEmoji[affiliate?.tier] || "🥉"} {affiliate?.tier?.toUpperCase()} · {affiliate?.commission_rate}%
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-primary/10 p-2 text-center">
                <p className="font-display text-lg font-black text-primary">€{(affiliate?.total_earnings || 0).toFixed(0)}</p>
                <p className="text-[8px] font-display tracking-widest text-muted-foreground">EARNED</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-2 text-center">
                <p className="font-display text-lg font-black text-accent">€{(affiliate?.total_sales || 0).toFixed(0)}</p>
                <p className="text-[8px] font-display tracking-widest text-muted-foreground">SALES</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-[10px] tracking-[0.2em]">
            {!collapsed && "MANAGEMENT"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-muted/50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
