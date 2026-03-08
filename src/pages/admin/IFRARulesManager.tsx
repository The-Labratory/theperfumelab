import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Upload, ShieldCheck } from "lucide-react";
import { ifraRules } from "@/data/molecularData";

const productCategories = ["fine_fragrance", "body_lotion", "candle", "soap", "shampoo", "deodorant"];

export default function IFRARulesManager() {
  const [rules, setRules] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    const [rulesRes, ingRes] = await Promise.all([
      supabase.from("ifra_restrictions").select("*, ingredient:ingredients(name)").order("created_at", { ascending: false }),
      supabase.from("ingredients").select("id, name").order("name"),
    ]);
    if (rulesRes.data) setRules(rulesRes.data);
    if (ingRes.data) setIngredients(ingRes.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const seedRules = async () => {
    setSeeding(true);
    try {
      const { data: allIngs } = await supabase.from("ingredients").select("id, name");
      if (!allIngs?.length) { toast.error("Seed ingredients first"); setSeeding(false); return; }

      const rows = [];
      for (const rule of ifraRules) {
        const ing = allIngs.find((i: any) => i.name.toLowerCase().includes(rule.ingredientId.replace(/-/g, " ").toLowerCase()));
        if (ing) {
          rows.push({
            ingredient_id: ing.id,
            product_category: rule.productCategory,
            max_concentration: rule.maxConcentration,
            amendment_number: rule.amendment + " Amendment",
          });
        }
      }

      if (rows.length > 0) {
        const { error } = await supabase.from("ifra_restrictions").upsert(rows, { onConflict: "ingredient_id,product_category" });
        if (error) throw error;
        toast.success(`Seeded ${rows.length} rules`);
        load();
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSeeding(false);
    }
  };

  const save = async () => {
    if (!editItem?.ingredient_id || !editItem?.max_concentration) { toast.error("Fill required fields"); return; }
    try {
      const payload = {
        ingredient_id: editItem.ingredient_id,
        product_category: editItem.product_category || "fine_fragrance",
        max_concentration: editItem.max_concentration,
        amendment_number: editItem.amendment_number || null,
        notes: editItem.notes || null,
      };
      if (editItem.id) {
        await supabase.from("ifra_restrictions").update(payload).eq("id", editItem.id);
      } else {
        await supabase.from("ifra_restrictions").insert(payload);
      }
      toast.success("Saved");
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("ifra_restrictions").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-500" /> IFRA Compliance Rules
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedRules} disabled={seeding} className="gap-2">
            <Upload className="w-4 h-4" /> {seeding ? "Seeding..." : "Seed Rules"}
          </Button>
          <Button onClick={() => { setEditItem({ product_category: "fine_fragrance", max_concentration: 100 }); setDialogOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Rule
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-xl border border-border/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/20">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ingredient</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Max %</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Amendment</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.filter((r) => !search || r.ingredient?.name?.toLowerCase().includes(search.toLowerCase())).map((r) => (
              <tr key={r.id} className="border-b border-border/10 hover:bg-muted/10">
                <td className="px-4 py-3 text-foreground">{r.ingredient?.name}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{r.product_category}</Badge></td>
                <td className="px-4 py-3 font-mono text-primary">{r.max_concentration}%</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.amendment_number || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem(r); setDialogOpen(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRule(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">{editItem?.id ? "Edit" : "New"} IFRA Rule</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Ingredient</Label>
                <Select value={editItem.ingredient_id || ""} onValueChange={(v) => setEditItem({ ...editItem, ingredient_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{ingredients.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Product Category</Label>
                <Select value={editItem.product_category} onValueChange={(v) => setEditItem({ ...editItem, product_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{productCategories.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Max Concentration (%)</Label><Input type="number" value={editItem.max_concentration} onChange={(e) => setEditItem({ ...editItem, max_concentration: Number(e.target.value) })} /></div>
              <div><Label>Amendment</Label><Input value={editItem.amendment_number || ""} onChange={(e) => setEditItem({ ...editItem, amendment_number: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
