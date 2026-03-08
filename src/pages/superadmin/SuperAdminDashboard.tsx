import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingCart, Shield, ScrollText, TrendingUp, Crown } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalSecurityEvents: number;
  recentSecurityEvents: any[];
  recentAuditLogs: any[];
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalSecurityEvents: 0,
    recentSecurityEvents: [], recentAuditLogs: [],
  });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const [users, orders, security, audit] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total"),
      supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(5),
    ]);

    const orderData = orders.data || [];
    const revenue = orderData.reduce((sum, o) => sum + (o.total || 0), 0);

    setStats({
      totalUsers: users.count || 0,
      totalOrders: orderData.length,
      totalRevenue: revenue,
      totalSecurityEvents: security.data?.length || 0,
      recentSecurityEvents: security.data || [],
      recentAuditLogs: audit.data || [],
    });
  };

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Orders", value: stats.totalOrders, icon: ShoppingCart, color: "text-secondary" },
    { label: "Revenue", value: `€${stats.totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-green-500" },
    { label: "Security Events", value: stats.totalSecurityEvents, icon: Shield, color: "text-amber-500" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-amber-500" />
        <h1 className="text-2xl font-display font-bold text-foreground">Super Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-surface rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                <p className={`text-3xl font-display font-bold ${c.color}`}>{c.value}</p>
              </div>
              <c.icon className={`w-8 h-8 ${c.color} opacity-50`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-surface rounded-xl p-5">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" /> Recent Security Events
          </h2>
          {stats.recentSecurityEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No security events</p>
          ) : (
            <div className="space-y-2">
              {stats.recentSecurityEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                  <div>
                    <span className="text-sm font-medium text-foreground">{e.event_type}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${e.severity === 'high' ? 'bg-destructive/10 text-destructive' : e.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground'}`}>
                      {e.severity}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-surface rounded-xl p-5">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-primary" /> Recent Audit Logs
          </h2>
          {stats.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit logs</p>
          ) : (
            <div className="space-y-2">
              {stats.recentAuditLogs.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                  <div>
                    <span className="text-sm font-medium text-foreground">{l.action}</span>
                    <span className="text-xs text-muted-foreground ml-2">{l.entity_type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
