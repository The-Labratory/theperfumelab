import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Download, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function BusinessSales() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ product_name: "", sale_amount: "", quantity: "1", customer_name: "", customer_email: "", notes: "" });

  useEffect(() => {
    loadSales();
  }, [affiliate]);

  const loadSales = async () => {
    if (!affiliate) return;
    setLoading(true);
    const { data } = await supabase
      .from("partner_sales_reports")
      .select("*")
      .eq("affiliate_partner_id", affiliate.id)
      .order("created_at", { ascending: false });
    setSales(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_name.trim() || !form.sale_amount) return;
    const { error } = await supabase.from("partner_sales_reports").insert({
      affiliate_partner_id: affiliate.id,
      user_id: affiliate.user_id,
      product_name: form.product_name.trim(),
      sale_amount: parseFloat(form.sale_amount),
      quantity: parseInt(form.quantity) || 1,
      customer_name: form.customer_name.trim() || null,
      customer_email: form.customer_email.trim() || null,
      notes: form.notes.trim() || null,
    });
    if (error) { toast.error("Failed to report sale"); return; }
    toast.success("Sale reported successfully! 🎉");
    setForm({ product_name: "", sale_amount: "", quantity: "1", customer_name: "", customer_email: "", notes: "" });
    setShowForm(false);
    loadSales();
  };

  const filtered = filter === "all" ? sales : sales.filter(s => s.status === filter);
  const totalSales = sales.reduce((sum, s) => sum + (s.sale_amount || 0), 0);
  const pendingSales = sales.filter(s => s.status === "pending").length;
  const approvedSales = sales.filter(s => s.status === "approved").length;

  const exportCSV = () => {
    const headers = ["Date", "Product", "Amount", "Qty", "Customer", "Status"];
    const rows = filtered.map(s => [new Date(s.sale_date).toLocaleDateString(), s.product_name, s.sale_amount, s.quantity, s.customer_name || "", s.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Sales exported!");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black tracking-wider text-foreground">Sales</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">Report and track all your B2B & B2C sales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> Report Sale
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `€${totalSales.toFixed(0)}`, color: "text-primary" },
          { label: "Pending Review", value: pendingSales, color: "text-amber-500" },
          { label: "Approved", value: approvedSales, color: "text-green-500" },
        ].map((s) => (
          <div key={s.label} className="glass-surface rounded-xl p-4 border border-border/30 text-center">
            <p className={`font-display text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-display tracking-widest text-muted-foreground mt-1">{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Report Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="glass-surface rounded-xl p-6 border border-primary/20 space-y-4"
        >
          <h3 className="font-display text-sm font-bold tracking-wider text-foreground">New Sale Report</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Product name *" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} required maxLength={200} />
            <Input placeholder="Sale amount (€) *" type="number" step="0.01" value={form.sale_amount} onChange={e => setForm({...form, sale_amount: e.target.value})} required />
            <Input placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
            <Input placeholder="Customer name" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} maxLength={200} />
            <Input placeholder="Customer email" type="email" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} maxLength={255} />
            <Input placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} maxLength={500} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">Submit</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.form>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sales</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Table */}
      <div className="glass-surface rounded-xl border border-border/30 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/30">
              {["Date", "Product", "Amount", "Qty", "Customer", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-display tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground font-body text-sm">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground font-body text-sm">No sales yet. Report your first sale!</td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 text-xs font-body text-muted-foreground">{new Date(s.sale_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-xs font-display font-semibold text-foreground">{s.product_name}</td>
                <td className="px-4 py-3 text-xs font-display font-bold text-primary">€{(s.sale_amount || 0).toFixed(0)}</td>
                <td className="px-4 py-3 text-xs font-body text-foreground">{s.quantity}</td>
                <td className="px-4 py-3 text-xs font-body text-muted-foreground">{s.customer_name || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={s.status === "approved" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
