import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Search, RefreshCw, Download, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
    setLogs(data || []);
    setLoading(false);
  };

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.user_id || "").toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["Timestamp", "Action", "Entity Type", "Entity ID", "User ID", "IP"];
    const rows = filtered.map(l => [l.created_at, l.action, l.entity_type, l.entity_id || "", l.user_id, l.ip_address || ""]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-logs.csv"; a.click();
    toast.success("Exported audit logs");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Audit Logs</h1>
          <Badge variant="secondary">{logs.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadLogs}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>IP</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.map(l => (
              <>
                <TableRow key={l.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}>
                  <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{l.action}</Badge></TableCell>
                  <TableCell className="text-sm">{l.entity_type}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{l.user_id?.slice(0, 8)}...</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.ip_address || "—"}</TableCell>
                  <TableCell>{expandedId === l.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</TableCell>
                </TableRow>
                {expandedId === l.id && (
                  <TableRow key={`${l.id}-detail`}>
                    <TableCell colSpan={6} className="bg-muted/20">
                      <div className="grid grid-cols-2 gap-4 p-2 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Old Values</p>
                          <pre className="bg-muted/50 rounded p-2 overflow-auto max-h-40">{JSON.stringify(l.old_values, null, 2) || "—"}</pre>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">New Values</p>
                          <pre className="bg-muted/50 rounded p-2 overflow-auto max-h-40">{JSON.stringify(l.new_values, null, 2) || "—"}</pre>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
