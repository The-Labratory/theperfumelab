import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BusinessReports() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!affiliate) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("partner_sales_reports")
        .select("*")
        .eq("user_id", affiliate.user_id)
        .order("sale_date", { ascending: false });
      setSalesData(data || []);
      setLoading(false);
    };
    load();
  }, [affiliate]);

  const now = new Date();
  const thisMonth = salesData.filter(s => new Date(s.sale_date).getMonth() === now.getMonth() && new Date(s.sale_date).getFullYear() === now.getFullYear());
  const lastMonth = salesData.filter(s => {
    const d = new Date(s.sale_date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const thisMonthRevenue = thisMonth.reduce((s, r) => s + (r.sale_amount || 0), 0);
  const lastMonthRevenue = lastMonth.reduce((s, r) => s + (r.sale_amount || 0), 0);
  const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

  const exportFullReport = () => {
    const headers = ["Date", "Product", "Amount", "Qty", "Customer", "Status"];
    const rows = salesData.map(s => [
      new Date(s.sale_date).toLocaleDateString(), s.product_name,
      s.sale_amount, s.quantity, s.customer_name || "", s.status,
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `full-report-${now.toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Full report exported!");
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Monthly breakdown for current year
  const monthlyBreakdown = months.map((m, i) => {
    const monthSales = salesData.filter(s => {
      const d = new Date(s.sale_date);
      return d.getMonth() === i && d.getFullYear() === now.getFullYear();
    });
    return { month: m, revenue: monthSales.reduce((s, r) => s + (r.sale_amount || 0), 0), count: monthSales.length };
  });

  const maxRevenue = Math.max(...monthlyBreakdown.map(m => m.revenue), 1);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black tracking-wider text-foreground">Reports</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">Performance summaries and export capabilities</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportFullReport}>
          <Download className="w-4 h-4 mr-1" /> Export Full Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month", value: `€${thisMonthRevenue.toFixed(0)}`, icon: Calendar, color: "text-primary" },
          { label: "Last Month", value: `€${lastMonthRevenue.toFixed(0)}`, icon: DollarSign, color: "text-accent" },
          { label: "Growth", value: `${growth >= 0 ? "+" : ""}${growth.toFixed(0)}%`, icon: TrendingUp, color: growth >= 0 ? "text-green-500" : "text-destructive" },
          { label: "Total Sales", value: salesData.length, icon: Package, color: "text-primary" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-surface rounded-xl p-4 border border-border/30">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <p className={`font-display text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-display tracking-widest text-muted-foreground mt-1">{s.label.toUpperCase()}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Chart */}
      <div className="glass-surface rounded-xl p-6 border border-border/30">
        <h3 className="font-display text-sm font-bold tracking-wider text-foreground mb-6">Monthly Revenue ({now.getFullYear()})</h3>
        <div className="flex items-end gap-2 h-40">
          {monthlyBreakdown.map((m, i) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-display text-primary font-bold">
                {m.revenue > 0 ? `€${m.revenue.toFixed(0)}` : ""}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(4, (m.revenue / maxRevenue) * 100)}%` }}
                transition={{ delay: i * 0.05 }}
                className={`w-full rounded-t-md ${i === now.getMonth() ? "bg-primary" : "bg-primary/30"}`}
              />
              <span className={`text-[9px] font-display tracking-wider ${i === now.getMonth() ? "text-primary font-bold" : "text-muted-foreground"}`}>
                {m.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance summary */}
      <div className="glass-surface rounded-xl p-6 border border-border/30">
        <h3 className="font-display text-sm font-bold tracking-wider text-foreground mb-4">📊 Your Performance Summary</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="font-display text-2xl font-black text-primary">{affiliate?.total_referrals || 0}</p>
            <p className="text-[9px] font-display tracking-widest text-muted-foreground">TOTAL REFERRALS</p>
          </div>
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
            <p className="font-display text-2xl font-black text-accent">€{(affiliate?.total_earnings || 0).toFixed(0)}</p>
            <p className="text-[9px] font-display tracking-widest text-muted-foreground">LIFETIME EARNINGS</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
            <p className="font-display text-2xl font-black text-foreground">{affiliate?.commission_rate || 0}%</p>
            <p className="text-[9px] font-display tracking-widest text-muted-foreground">COMMISSION RATE</p>
          </div>
        </div>
      </div>
    </div>
  );
}
