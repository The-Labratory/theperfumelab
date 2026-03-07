import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Upload } from "lucide-react";
import { knownInteractions } from "@/data/molecularData";

const interactionTypes = ["synergistic", "antagonistic", "enhancing", "neutral"];

export default function InteractionsManager() {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    const [intRes, ingRes] = await Promise.all([
      supabase.from("ingredient_interactions").select("*, ingredient_a:ingredients!ingredient_a_id(name), ingredient_b:ingredients!ingredient_b_id(name)").order("created_at", { ascending: false }),
      supabase.from("ingredients").select("id, name").order("name"),
    ]);
    if (intRes.data) setInteractions(intRes.data);
    if (ingRes.data) setIngredients(ingRes.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const seedInteractions = async () => {
    setSeeding(true);
    try {
      const ingMap: Record<string, string> = {};
      for (const ing of ingredients) ingMap[ing.name.toLowerCase()] = ing.id;

      const { data: allIngs } = await supabase.from("ingredients").select("id, name");
      if (allIngs) for (const ing of allIngs) ingMap[ing.name.toLowerCase()] = ing.id;

      const rows = [];
      for (const ki of knownInteractions) {
        // Try to find ingredients by matching the molecular data id to ingredient names
        const ingA = allIngs?.find((i: any) => i.name.toLowerCase().includes(ki.ingredientA.replace(/-/g, " ").toLowerCase()));
        const ingB = allIngs?.find((i: any) => i.name.toLowerCase().includes(ki.ingredientB.replace(/-/g, " ").toLowerCase()));
        if (ingA && ingB) {
          rows.push({
            ingredient_a_id: ingA.id,
            ingredient_b_id: ingB.id,
            interaction_type: ki.type,
            interaction_strength: ki.strength,
            accord_name: ki.accordName || null,
            notes: ki.notes || null,
          });
        }
      }

      if (rows.length > 0) {
        const { error } = await supabase.from("ingredient_interactions").upsert(rows, { onConflict: "ingredient_a_id,ingredient_b_id" });
        if (error) throw error;
        toast.success(`Seeded ${rows.length} interactions`);
        load();
      } else {
        toast.error("Seed ingredients first");
      }
    } catch (e: any) {
      toast.error(e.message || "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const save = async () => {
    if (!editItem?.ingredient_a_id || !editItem?.ingredient_b_id) { toast.error("Select both ingredients"); return; }
    try {
      const payload = {
        ingredient_a_id: editItem.ingredient_a_id,
        ingredient_b_id: editItem.ingredient_b_id,
        interaction_type: editItem.interaction_type || "neutral",
        interaction_strength: editItem.interaction_strength || 50,
        accord_name: editItem.accord_name || null,
        notes: editItem.notes || null,
      };
      if (editItem.id) {
        const { error } = await supabase.from("ingredient_interactions").update(payload).eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ingredient_interactions").insert(payload);
        if (error) throw error;
      }
      toast.success("Saved");
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("ingredient_interactions").delete().eq("id", id);
    toast.success("Deleted");
    load();
  };

  const typeColor = (t: string) => {
    if (t === "synergistic") return "default";
    if (t === "antagonistic") return "destructive";
    if (t === "enhancing") return "secondary";
    return "outline";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Interactions</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedInteractions} disabled={seeding} className="gap-2">
            <Upload className="w-4 h-4" /> {seeding ? "Seeding..." : "Seed Data"}
          </Button>
          <Button onClick={() => { setEditItem({ interaction_type: "neutral", interaction_strength: 50 }); setDialogOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add
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
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ingredient A</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Ingredient B</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Strength</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Accord</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {interactions.filter((i) => !search || i.ingredient_a?.name?.toLowerCase().includes(search.toLowerCase()) || i.ingredient_b?.name?.toLowerCase().includes(search.toLowerCase())).map((item) => (
              <tr key={item.id} className="border-b border-border/10 hover:bg-muted/10">
                <td className="px-4 py-3 text-foreground">{item.ingredient_a?.name}</td>
                <td className="px-4 py-3 text-foreground">{item.ingredient_b?.name}</td>
                <td className="px-4 py-3"><Badge variant={typeColor(item.interaction_type) as any} className="text-xs">{item.interaction_type}</Badge></td>
                <td className="px-4 py-3 font-mono text-xs">{item.interaction_strength}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{item.accord_name || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditItem(item); setDialogOpen(true); }}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display">{editItem?.id ? "Edit" : "New"} Interaction</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div>
                <Label>Ingredient A</Label>
                <Select value={editItem.ingredient_a_id || ""} onValueChange={(v) => setEditItem({ ...editItem, ingredient_a_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{ingredients.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ingredient B</Label>
                <Select value={editItem.ingredient_b_id || ""} onValueChange={(v) => setEditItem({ ...editItem, ingredient_b_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{ingredients.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={editItem.interaction_type} onValueChange={(v) => setEditItem({ ...editItem, interaction_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{interactionTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Strength: {editItem.interaction_strength}</Label>
                <Slider value={[editItem.interaction_strength || 50]} onValueChange={([v]) => setEditItem({ ...editItem, interaction_strength: v })} min={0} max={100} />
              </div>
              <div><Label>Accord Name</Label><Input value={editItem.accord_name || ""} onChange={(e) => setEditItem({ ...editItem, accord_name: e.target.value })} /></div>
              <div><Label>Notes</Label><Input value={editItem.notes || ""} onChange={(e) => setEditItem({ ...editItem, notes: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
