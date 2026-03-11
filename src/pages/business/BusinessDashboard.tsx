import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Users, Package, ArrowRight,
  ShoppingBag, BarChart3, Share2, Percent, Network
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DealCalculator } from "@/components/deals/DealCalculator";

const QUICK_ACTIONS = [
  { label: "Report a Sale", icon: ShoppingBag, path: "/my-business/sales", color: "from-primary to-accent" },
  { label: "Add Customer", icon: Users, path: "/my-business/customers", color: "from-accent to-primary" },
  { label: "Check Stock", icon: Package, path: "/my-business/inventory", color: "from-primary/80 to-primary" },
  { label: "Share Link", icon: Share2, path: "/my-business/marketing", color: "from-accent/80 to-accent" },
];

export default function BusinessDashboard() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [stats, setStats] = useState({ customers: 0, inventory: 0, lowStock: 0, goals: 0 });
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      const [custRes, invRes, goalRes, salesRes] = await Promise.all([
        supabase.from("partner_customers").select("id", { count: "exact", head: true }).eq("user_id", affiliate.user_id),
        supabase.from("partner_inventory").select("id, quantity_in_stock, low_stock_threshold").eq("user_id", affiliate.user_id),
        supabase.from("partner_goals").select("id", { count: "exact", head: true }).eq("user_id", affiliate.user_id),
        supabase.from("partner_sales_reports").select("*").eq("user_id", affiliate.user_id).order("created_at", { ascending: false }).limit(5),
      ]);
      const inv = invRes.data || [];
      setStats({
        customers: custRes.count || 0,
        inventory: inv.length,
        lowStock: inv.filter(i => i.quantity_in_stock <= i.low_stock_threshold).length,
        goals: goalRes.count || 0,
      });
      setRecentSales(salesRes.data || []);
    };
    load();
  }, [affiliate]);

  const kpis = [
    { label: "Total Sales", value: `€${(affiliate?.total_sales || 0).toFixed(0)}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Earnings", value: `€${(affiliate?.total_earnings || 0).toFixed(0)}`, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "Referrals", value: affiliate?.total_referrals || 0, icon: Users, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Customers", value: stats.customers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="font-display text-2xl font-black tracking-wider text-foreground">
          Welcome back, {affiliate?.display_name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground font-body mt-1">Here's your business overview for today.</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-surface rounded-xl p-5 border border-border/30"
          >
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="font-display text-2xl font-black text-foreground">{kpi.value}</p>
            <p className="text-[10px] font-display tracking-widest text-muted-foreground mt-1">{kpi.label.toUpperCase()}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-display text-xs tracking-[0.2em] text-muted-foreground mb-4">QUICK ACTIONS</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={action.label} to={action.path}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="glass-surface rounded-xl p-4 border border-border/30 cursor-pointer group text-center"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} mx-auto mb-3 flex items-center justify-center group-hover:shadow-lg transition-shadow`}>
                  <action.icon className="w-5 h-5 text-background" />
                </div>
                <p className="font-display text-xs font-semibold tracking-wider text-foreground">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="glass-surface rounded-xl p-5 border border-border/30">
          <h3 className="font-display text-sm font-bold tracking-wider text-foreground mb-4">⚡ Alerts</h3>
          <div className="space-y-3">
            {stats.lowStock > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <Package className="w-4 h-4 text-destructive" />
                <p className="text-xs font-body text-foreground">{stats.lowStock} product(s) running low on stock</p>
                <Link to="/my-business/inventory" className="ml-auto"><ArrowRight className="w-4 h-4 text-muted-foreground" /></Link>
              </div>
            )}
            {affiliate?.status === "pending" && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-body text-foreground">Your account is pending approval</p>
              </div>
            )}
            {stats.lowStock === 0 && affiliate?.status !== "pending" && (
              <p className="text-sm text-muted-foreground font-body text-center py-4">All clear! No alerts right now 🎉</p>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="glass-surface rounded-xl p-5 border border-border/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold tracking-wider text-foreground">📈 Recent Sales</h3>
            <Link to="/my-business/sales" className="text-xs text-primary font-display tracking-wider hover:underline">View All</Link>
          </div>
          {recentSales.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-4">No sales reported yet. Start selling!</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20">
                  <div>
                    <p className="text-xs font-display font-semibold text-foreground">{sale.product_name}</p>
                    <p className="text-[10px] text-muted-foreground font-body">{new Date(sale.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-display text-sm font-bold text-primary">€{(sale.sale_amount || 0).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Command Center: B2C 50% Margin View ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-display text-xs tracking-[0.2em] text-muted-foreground mb-4">
          COMMAND CENTER — B2C 50% MARGIN
        </h3>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* B2C Margin Overview */}
          <div className="glass-surface rounded-xl p-5 border border-border/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Percent className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm font-bold tracking-wider text-foreground">
                  B2C Retail Commission
                </p>
                <p className="text-[10px] text-muted-foreground font-body">
                  Flat 50% on every retail order — Scent-Lock attributed
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Commission Rate",
                  value: "50%",
                  sub: "Static — B2C",
                  accent: true,
                },
                {
                  label: "Your Earnings",
                  value: `€${((affiliate?.total_earnings || 0)).toFixed(0)}`,
                  sub: "All time",
                  accent: false,
                },
                {
                  label: "B2B Commission",
                  value: "10–20%",
                  sub: "After 40% wholesale",
                  accent: false,
                },
                {
                  label: "Tier 2 Override",
                  value: "5%",
                  sub: "Parent referrer (1 level)",
                  accent: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg bg-muted/20 p-3 border border-border/20"
                >
                  <p
                    className={`font-display text-lg font-black ${
                      item.accent ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {item.value}
                  </p>
                  <p className="text-[10px] font-display tracking-widest text-muted-foreground">
                    {item.label.toUpperCase()}
                  </p>
                  <p className="text-[9px] text-muted-foreground/70 mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>

            <Link to="/my-business/crm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-primary" />
                  <span className="text-xs font-display font-semibold text-foreground">
                    Manage Scent-Lock Portfolio
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </Link>
          </div>

          {/* Live B2B Deal Calculator */}
          <DealCalculator />
        </div>
      </motion.div>
    </div>
  );
}
