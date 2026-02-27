import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Eye, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FormulasManager() {
  const [formulas, setFormulas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFormula, setSelectedFormula] = useState<any>(null);
  const [formulaIngredients, setFormulaIngredients] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("formulas").select("*").order("created_at", { ascending: false });
    if (data) setFormulas(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewFormula = async (formula: any) => {
    setSelectedFormula(formula);
    const { data } = await supabase.from("formula_ingredients").select("*, ingredient:ingredients(name, default_layer, functional_group)").eq("formula_id", formula.id);
    setFormulaIngredients(data || []);
    setDetailOpen(true);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("formulas").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Status → ${status}`); load(); }
  };

  const deleteFormula = async (id: string) => {
    if (!confirm("Delete this formula and all its ingredients?")) return;
    const { error } = await supabase.from("formulas").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  const filtered = formulas.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusIcon = (s: string) => {
    if (s === "approved") return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    if (s === "validated") return <CheckCircle className="w-3.5 h-3.5 text-primary" />;
    if (s === "draft") return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
    return <XCircle className="w-3.5 h-3.5 text-destructive" />;
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Formulas</h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="validated">Validated</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="production">Production</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/20">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Harmony</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Compliance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b border-border/10 hover:bg-muted/10">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{f.formula_number}</td>
                <td className="px-4 py-3 font-medium text-foreground">{f.name}</td>
                <td className="px-4 py-3 text-xs">{f.concentration_type}</td>
                <td className="px-4 py-3"><div className="flex items-center gap-1.5">{statusIcon(f.status)}<span className="text-xs">{f.status}</span></div></td>
                <td className="px-4 py-3 font-mono text-xs">{f.harmony_score || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={f.compliance_status === "compliant" ? "default" : f.compliance_status === "non_compliant" ? "destructive" : "outline"} className="text-xs">
                    {f.compliance_status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewFormula(f)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteFormula(f.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No formulas found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display">Formula: {selectedFormula?.name}</DialogTitle></DialogHeader>
          {selectedFormula && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/20"><span className="text-xs text-muted-foreground block">Stability</span><span className="text-lg font-bold text-foreground">{selectedFormula.stability_score || 0}</span></div>
                <div className="p-3 rounded-lg bg-muted/20"><span className="text-xs text-muted-foreground block">Harmony</span><span className="text-lg font-bold text-foreground">{selectedFormula.harmony_score || 0}</span></div>
                <div className="p-3 rounded-lg bg-muted/20"><span className="text-xs text-muted-foreground block">Concentration</span><span className="text-lg font-bold text-foreground">{selectedFormula.total_concentration}%</span></div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 text-foreground">Ingredients</h3>
                {formulaIngredients.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No ingredients</p>
                ) : (
                  <div className="space-y-1">
                    {formulaIngredients.map((fi: any) => (
                      <div key={fi.id} className="flex items-center justify-between p-2 rounded bg-muted/10 text-xs">
                        <span className="text-foreground">{fi.ingredient?.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{fi.layer_override || fi.ingredient?.default_layer}</Badge>
                          <span className="font-mono text-primary">{fi.concentration_pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(selectedFormula.id, "validated")}>Validate</Button>
                <Button size="sm" onClick={() => updateStatus(selectedFormula.id, "approved")}>Approve</Button>
                <Button size="sm" variant="secondary" onClick={() => updateStatus(selectedFormula.id, "production")}>→ Production</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
