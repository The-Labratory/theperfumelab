import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, RefreshCw, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SecurityEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(200);
    setEvents(data || []);
    setLoading(false);
  };

  const filtered = events.filter(e =>
    e.event_type.toLowerCase().includes(search.toLowerCase()) ||
    (e.endpoint || "").toLowerCase().includes(search.toLowerCase())
  );

  const severityColor = (s: string) => {
    switch (s) {
      case "critical": return "bg-red-600/10 text-red-600";
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-amber-500/10 text-amber-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const exportCSV = () => {
    const headers = ["Timestamp", "Event Type", "Severity", "User ID", "Endpoint", "IP", "Details"];
    const rows = filtered.map(e => [e.created_at, e.event_type, e.severity, e.user_id || "", e.endpoint || "", e.ip_address || "", JSON.stringify(e.details)]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "security-events.csv"; a.click();
    toast.success("Exported security events");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-display font-bold text-foreground">Security Events</h1>
          <Badge variant="secondary">{events.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadEvents}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No security events</TableCell></TableRow>
            ) : filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-sm font-medium">{e.event_type}</TableCell>
                <TableCell><span className={`text-xs px-2 py-0.5 rounded-full ${severityColor(e.severity)}`}>{e.severity}</span></TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{e.user_id?.slice(0, 8) || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{e.endpoint || "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{JSON.stringify(e.details)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
