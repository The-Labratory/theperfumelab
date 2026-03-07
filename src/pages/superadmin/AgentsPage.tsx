import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Search, RefreshCw, Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface AffiliatePartner {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  status: string;
  tier: string;
  total_sales: number;
  total_referrals: number;
  total_earnings: number;
  commission_rate: number;
  created_at: string;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AffiliatePartner[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAgents(); }, []);

  const loadAgents = async () => {
    setLoading(true);
    const { data } = await supabase.from("affiliate_partners").select("*").order("created_at", { ascending: false });
    setAgents(data || []);
    setLoading(false);
  };

  const filtered = agents.filter(a =>
    a.display_name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "active") updates.approved_at = new Date().toISOString();
    await supabase.from("affiliate_partners").update(updates).eq("id", id);
    toast.success(`Agent ${status}`);
    loadAgents();
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Status", "Tier", "Sales", "Referrals", "Earnings", "Commission %"];
    const rows = filtered.map(a => [a.display_name, a.email, a.status, a.tier, a.total_sales, a.total_referrals, a.total_earnings, a.commission_rate]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "agents.csv"; a.click();
    toast.success("Exported agents CSV");
  };

  const tierColor = (tier: string) => {
    switch (tier) {
      case "platinum": return "bg-purple-500/10 text-purple-500";
      case "gold": return "bg-amber-500/10 text-amber-500";
      case "silver": return "bg-gray-400/10 text-gray-400";
      default: return "bg-orange-500/10 text-orange-500";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCheck className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Agents / Affiliates</h1>
          <Badge variant="secondary">{agents.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadAgents}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No agents found</TableCell></TableRow>
            ) : filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={a.status === "active" ? "default" : a.status === "pending" ? "secondary" : "destructive"} className="text-xs">
                    {a.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${tierColor(a.tier)}`}>{a.tier}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-sm">€{Number(a.total_sales).toFixed(0)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">€{Number(a.total_earnings).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {a.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(a.id, "active")} className="text-xs">Approve</Button>
                    )}
                    {a.status === "active" && (
                      <Button variant="ghost" size="sm" onClick={() => updateStatus(a.id, "suspended")} className="text-xs text-destructive">Suspend</Button>
                    )}
                    {a.status === "suspended" && (
                      <Button variant="outline" size="sm" onClick={() => updateStatus(a.id, "active")} className="text-xs">Restore</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
