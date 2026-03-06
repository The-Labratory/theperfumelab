import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database, Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BROWSABLE_TABLES = [
  "profiles", "employees", "departments", "orders", "production_orders",
  "formulas", "formula_ingredients", "formula_costs", "formula_snapshots",
  "ingredients", "ingredient_interactions", "ifra_restrictions",
  "affiliate_partners", "affiliate_pyramid", "affiliate_referrals", "affiliate_payouts", "affiliate_sales",
  "partner_applications", "partner_sales_reports",
  "notifications", "gifts", "saved_blends", "blend_likes", "blend_comments",
  "user_roles", "system_permissions", "system_settings",
  "admin_audit_logs", "security_events", "user_activity_logs",
  "employee_requests", "platinum_rewards", "waitlist",
  "game_progress", "user_follows", "teams",
  "pyramid_chart_configs", "pyramid_chart_config_versions",
] as const;

type BrowsableTable = typeof BROWSABLE_TABLES[number];

const PAGE_SIZE = 25;

export default function DatabaseExplorerPage() {
  const [selectedTable, setSelectedTable] = useState<BrowsableTable>("profiles");
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Edit/Create dialog
  const [editRow, setEditRow] = useState<any | null>(null);
  const [editMode, setEditMode] = useState<"edit" | "create">("edit");
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete dialog
  const [deleteRow, setDeleteRow] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const countRes = await (supabase.from(selectedTable as any) as any).select("*", { count: "exact", head: true });
      setTotalCount(countRes.count || 0);

      const query = (supabase.from(selectedTable as any) as any)
        .select("*")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      const tableData = data || [];
      setRows(tableData);
      if (tableData.length > 0) {
        setColumns(Object.keys(tableData[0]));
      } else {
        setColumns([]);
      }
    } catch (err: any) {
      toast.error(`Failed to load ${selectedTable}: ${err.message}`);
      setRows([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTable, page]);

  useEffect(() => { setPage(0); }, [selectedTable]);
  useEffect(() => { loadData(); }, [loadData]);

  const filteredRows = searchQuery
    ? rows.filter(row => JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase()))
    : rows;

  const handleEdit = (row: any) => {
    setEditMode("edit");
    setEditRow(row);
    const values: Record<string, string> = {};
    for (const key of columns) {
      values[key] = typeof row[key] === "object" ? JSON.stringify(row[key], null, 2) : String(row[key] ?? "");
    }
    setEditValues(values);
  };

  const handleCreate = () => {
    setEditMode("create");
    setEditRow({});
    const values: Record<string, string> = {};
    for (const key of columns) {
      values[key] = "";
    }
    setEditValues(values);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const [key, val] of Object.entries(editValues)) {
        if (key === "id" && editMode === "edit") continue;
        if (val === "" || val === "null") { payload[key] = null; continue; }
        try { payload[key] = JSON.parse(val); } catch { payload[key] = val; }
      }

      if (editMode === "create") {
        delete payload.id;
        const { error } = await (supabase.from(selectedTable as any) as any).insert([payload]);
        if (error) throw error;
        toast.success("Record created");
      } else {
        const { error } = await (supabase.from(selectedTable as any) as any)
          .update(payload)
          .eq("id", editRow.id);
        if (error) throw error;
        toast.success("Record updated");
      }

      // Log the action
      await supabase.from("admin_audit_logs").insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id || "",
        action: editMode === "create" ? "db_explorer_create" : "db_explorer_update",
        entity_type: selectedTable,
        entity_id: editMode === "edit" ? editRow.id : null,
        new_values: payload,
      }]);

      setEditRow(null);
      loadData();
    } catch (err: any) {
      toast.error(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      const { error } = await (supabase.from(selectedTable as any) as any)
        .delete()
        .eq("id", deleteRow.id);
      if (error) throw error;

      await supabase.from("admin_audit_logs").insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id || "",
        action: "db_explorer_delete",
        entity_type: selectedTable,
        entity_id: deleteRow.id,
        old_values: deleteRow,
      }]);

      toast.success("Record deleted");
      setDeleteRow(null);
      loadData();
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const truncateValue = (val: any) => {
    const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "—");
    return str.length > 60 ? str.slice(0, 57) + "…" : str;
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">Database Explorer</h1>
      </div>

      <div className="glass-surface rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-64">
            <Label className="text-xs text-muted-foreground">Table</Label>
            <Select value={selectedTable} onValueChange={(v) => setSelectedTable(v as BrowsableTable)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BROWSABLE_TABLES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs text-muted-foreground">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Filter rows…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
          <Button onClick={handleCreate} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" /> New Record
          </Button>
          <Button onClick={loadData} variant="outline" size="sm">Refresh</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{totalCount} total rows · Page {page + 1} of {totalPages || 1}</p>
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Actions</TableHead>
                {columns.map(col => (
                  <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow><TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
              ) : (
                filteredRows.map((row, idx) => (
                  <TableRow key={row.id || idx}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(row)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteRow(row)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    {columns.map(col => (
                      <TableCell key={col} className="text-xs max-w-[200px] truncate">{truncateValue(row[col])}</TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-border/20">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <span className="text-xs text-muted-foreground">Page {page + 1} / {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editRow} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMode === "create" ? "Create Record" : "Edit Record"}</DialogTitle>
            <DialogDescription>Table: {selectedTable}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {columns.map(col => (
              <div key={col}>
                <Label className="text-xs text-muted-foreground">{col}</Label>
                {editMode === "edit" && col === "id" ? (
                  <Input value={editValues[col] || ""} disabled className="mt-1 text-xs" />
                ) : (editValues[col]?.length || 0) > 100 ? (
                  <Textarea
                    value={editValues[col] || ""}
                    onChange={e => setEditValues(v => ({ ...v, [col]: e.target.value }))}
                    className="mt-1 text-xs font-mono"
                    rows={4}
                  />
                ) : (
                  <Input
                    value={editValues[col] || ""}
                    onChange={e => setEditValues(v => ({ ...v, [col]: e.target.value }))}
                    className="mt-1 text-xs"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              This will permanently delete record <strong>{deleteRow?.id}</strong> from <strong>{selectedTable}</strong>. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRow(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
