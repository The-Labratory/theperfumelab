import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ScrollText } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  const load = useCallback(async () => {
    let query = supabase.from("admin_audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (entityFilter !== "all") query = query.eq("entity_type", entityFilter);
    const { data } = await query;
    if (data) setLogs(data);
  }, [entityFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((l) => !search || l.action.includes(search) || l.entity_type.includes(search));

  const actionColor = (a: string) => {
    if (a === "create") return "default";
    if (a === "update") return "secondary";
    if (a === "delete") return "destructive";
    if (a === "approve") return "default";
    return "outline";
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
        <ScrollText className="w-6 h-6 text-primary" /> Audit Log
      </h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search actions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            <SelectItem value="ingredient">Ingredients</SelectItem>
            <SelectItem value="formula">Formulas</SelectItem>
            <SelectItem value="interaction">Interactions</SelectItem>
            <SelectItem value="ifra_rule">IFRA Rules</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/20">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-border/10 hover:bg-muted/10">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3"><Badge variant={actionColor(log.action) as any} className="text-xs">{log.action}</Badge></td>
                <td className="px-4 py-3 text-xs">{log.entity_type}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{log.user_id?.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">
                  {log.new_values ? JSON.stringify(log.new_values).slice(0, 80) : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
