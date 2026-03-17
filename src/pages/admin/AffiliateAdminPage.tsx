import { useState, useEffect, useMemo } from "react";
import AdminOnboardingMetrics from "@/components/admin/AdminOnboardingMetrics";
import { motion } from "framer-motion";
import {
  Users, Search, Filter, Download, Mail, Crown, Award,
  TrendingUp, DollarSign, ArrowUpDown, CheckCircle, Gift,
  BarChart3, Eye, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AffiliateRow {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  referral_code: string;
  tier: string;
  status: string;
  commission_rate: number;
  total_earnings: number;
  total_referrals: number;
  total_sales: number;
  created_at: string;
  company_name: string | null;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "text-amber-500",
  silver: "text-gray-400",
  gold: "text-yellow-400",
  platinum: "text-cyan-400",
  high_achiever: "text-purple-400",
};

const TIER_LABELS: Record<string, string> = {
  bronze: "Standard",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  high_achiever: "Diamond",
};

export default function AffiliateAdminPage() {
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"created_at" | "total_sales" | "total_referrals" | "total_earnings">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("affiliate_partners")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAffiliates(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let list = [...affiliates];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.display_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.referral_code.toLowerCase().includes(q)
      );
    }
    if (filterTier !== "all") list = list.filter(a => a.tier === filterTier);
    if (filterStatus !== "all") list = list.filter(a => a.status === filterStatus);
    list.sort((a, b) => {
      const va = a[sortBy] ?? 0;
      const vb = b[sortBy] ?? 0;
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [affiliates, search, filterTier, filterStatus, sortBy, sortDir]);

  const totalSales = affiliates.reduce((s, a) => s + (a.total_sales || 0), 0);
  const totalEarnings = affiliates.reduce((s, a) => s + (a.total_earnings || 0), 0);
  const totalReferrals = affiliates.reduce((s, a) => s + (a.total_referrals || 0), 0);

  const handleTierChange = async (id: string, newTier: string) => {
    const { error } = await supabase
      .from("affiliate_partners")
      .update({ tier: newTier })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update tier");
    } else {
      toast.success(`Tier updated to ${TIER_LABELS[newTier] || newTier}`);
      fetchAffiliates();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "active") updates.approved_at = new Date().toISOString();
    const { error } = await supabase
      .from("affiliate_partners")
      .update(updates)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Status updated to ${newStatus}`);
      fetchAffiliates();
    }
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Referral Code", "Tier", "Status", "Sales", "Referrals", "Earnings", "Joined"];
    const rows = filtered.map(a => [
      a.display_name, a.email, a.referral_code,
      TIER_LABELS[a.tier] || a.tier, a.status,
      a.total_sales, a.total_referrals, a.total_earnings,
      new Date(a.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `affiliates-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-wider text-foreground">Affiliate Management</h1>
        <Button onClick={exportCSV} variant="outline" size="sm" className="font-display text-xs tracking-wider">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Affiliates", value: affiliates.length, icon: Users, color: "text-primary" },
          { label: "Total Sales", value: `€${totalSales.toFixed(0)}`, icon: DollarSign, color: "text-accent" },
          { label: "Total Referrals", value: totalReferrals, icon: TrendingUp, color: "text-secondary" },
          { label: "Pending Commissions", value: `€${totalEarnings.toFixed(0)}`, icon: BarChart3, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="glass-surface rounded-xl p-4 border border-border/50">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="font-display text-lg font-bold text-foreground">{s.value}</p>
            <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or code..."
            className="pl-10 bg-card/50 border-border/50 font-body text-sm" />
        </div>
        <Select value={filterTier} onValueChange={setFilterTier}>
          <SelectTrigger className="w-[140px] bg-card/50 border-border/50 font-body text-sm">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="bronze">Standard</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
            <SelectItem value="high_achiever">Diamond</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] bg-card/50 border-border/50 font-body text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-surface rounded-xl border border-border/50 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/50">
              {[
                { key: "display_name" as const, label: "Name" },
                { key: "email" as const, label: "Email" },
                { key: "tier" as const, label: "Rank" },
                { key: "status" as const, label: "Status" },
              ].map(col => (
                <th key={col.key} className="px-4 py-3 font-display text-[10px] tracking-widest text-muted-foreground">
                  {col.label}
                </th>
              ))}
              {([
                { key: "total_sales" as const, label: "Sales" },
                { key: "total_referrals" as const, label: "Referrals" },
                { key: "total_earnings" as const, label: "Earnings" },
              ] as const).map(col => (
                <th key={col.key} className="px-4 py-3 font-display text-[10px] tracking-widest text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort(col.key)}>
                  <span className="flex items-center gap-1">
                    {col.label} <ArrowUpDown className="w-3 h-3" />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 font-display text-[10px] tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground font-body text-sm">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground font-body text-sm">No affiliates found</td></tr>
            ) : filtered.map(a => (
              <tr key={a.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-display text-xs font-semibold text-foreground">{a.display_name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{a.referral_code}</p>
                </td>
                <td className="px-4 py-3 font-body text-xs text-muted-foreground">{a.email}</td>
                <td className="px-4 py-3">
                  <Select value={a.tier} onValueChange={v => handleTierChange(a.id, v)}>
                    <SelectTrigger className="h-7 w-[110px] text-xs border-border/30 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Standard</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="high_achiever">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Select value={a.status} onValueChange={v => handleStatusChange(a.id, v)}>
                    <SelectTrigger className="h-7 w-[100px] text-xs border-border/30 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 font-display text-xs text-foreground">€{(a.total_sales || 0).toFixed(0)}</td>
                <td className="px-4 py-3 font-display text-xs text-foreground">{a.total_referrals || 0}</td>
                <td className="px-4 py-3 font-display text-xs text-accent font-bold">€{(a.total_earnings || 0).toFixed(0)}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" className="h-7 text-xs font-display"
                    onClick={() => toast.info(`Reward email placeholder for ${a.display_name}`)}>
                    <Send className="w-3 h-3 mr-1" /> Reward
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
