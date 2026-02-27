import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Plus, Search, Edit, Trash2, Beaker, Upload } from "lucide-react";
import { molecularIngredients } from "@/data/molecularData";
import { motion } from "framer-motion";

const functionalGroups = ["aldehyde", "ester", "ketone", "alcohol", "terpene", "musk", "phenol", "lactone", "other"];
const categories = ["natural", "synthetic", "isolate"];
const layers = ["top", "heart", "base"];
const ifraCats = ["unrestricted", "restricted", "prohibited"];

interface Ingredient {
  id: string;
  name: string;
  cas_number: string | null;
  category: string;
  functional_group: string;
  molecular_weight: number;
  vapor_pressure: number;
  boiling_point: number;
  volatility_index: number;
  ifra_category: string;
  ifra_max_concentration: number | null;
  odor_profile: string | null;
  odor_intensity: number;
  default_layer: string;
  is_fixative: boolean;
  warmth: number;
  sweetness: number;
  freshness: number;
  is_active: boolean;
}

const defaultIng: Partial<Ingredient> = {
  name: "", cas_number: "", category: "synthetic", functional_group: "other",
  molecular_weight: 0, vapor_pressure: 0, boiling_point: 0, volatility_index: 50,
  ifra_category: "unrestricted", ifra_max_concentration: 100, odor_profile: "",
  odor_intensity: 50, default_layer: "heart", is_fixative: false,
  warmth: 50, sweetness: 50, freshness: 50, is_active: true,
};

export default function IngredientsManager() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [search, setSearch] = useState("");
  const [filterLayer, setFilterLayer] = useState("all");
  const [editIng, setEditIng] = useState<Partial<Ingredient> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("ingredients").select("*").order("name");
    if (data) setIngredients(data as Ingredient[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = ingredients.filter((i) => {
    const match = i.name.toLowerCase().includes(search.toLowerCase());
    const layerMatch = filterLayer === "all" || i.default_layer === filterLayer;
    return match && layerMatch;
  });

  const seedData = async () => {
    setSeeding(true);
    try {
      const rows = molecularIngredients.map((m) => ({
        name: m.name,
        cas_number: m.casNumber,
        category: m.category,
        functional_group: m.functionalGroup,
        molecular_weight: m.molecularWeight,
        vapor_pressure: m.vaporPressure,
        boiling_point: m.boilingPoint,
        volatility_index: m.volatilityIndex,
        ifra_category: m.ifraCat,
        ifra_max_concentration: m.ifraMaxConc,
        odor_profile: m.odorProfile,
        odor_intensity: m.odorIntensity,
        default_layer: m.defaultLayer,
        is_fixative: m.isFixative,
        warmth: m.warmth,
        sweetness: m.sweetness,
        freshness: m.freshness,
      }));
      const { error } = await supabase.from("ingredients").upsert(rows, { onConflict: "name" });
      if (error) throw error;
      toast.success(`Seeded ${rows.length} ingredients`);
      load();
    } catch (e: any) {
      toast.error(e.message || "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  const saveIngredient = async () => {
    if (!editIng?.name) { toast.error("Name required"); return; }
    try {
      if (editIng.id) {
        const { error } = await supabase.from("ingredients").update(editIng as any).eq("id", editIng.id);
        if (error) throw error;
        toast.success("Updated");
      } else {
        const { error } = await supabase.from("ingredients").insert(editIng as any);
        if (error) throw error;
        toast.success("Created");
      }
      setDialogOpen(false);
      setEditIng(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  const deleteIngredient = async (id: string) => {
    if (!confirm("Delete this ingredient?")) return;
    const { error } = await supabase.from("ingredients").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); load(); }
  };

  const openEdit = (ing?: Ingredient) => {
    setEditIng(ing ? { ...ing } : { ...defaultIng });
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Ingredients</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={seedData} disabled={seeding} className="gap-2">
            <Upload className="w-4 h-4" /> {seeding ? "Seeding..." : "Seed Data"}
          </Button>
          <Button onClick={() => openEdit()} className="gap-2">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterLayer} onValueChange={setFilterLayer}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Layers</SelectItem>
            {layers.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border/20">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Layer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Group</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">MW</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">VP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">IFRA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ing) => (
                <tr key={ing.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium text-foreground">{ing.name}</span>
                      {ing.cas_number && <span className="text-xs text-muted-foreground ml-2">{ing.cas_number}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{ing.default_layer}</Badge></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{ing.functional_group}</td>
                  <td className="px-4 py-3 text-xs font-mono">{ing.molecular_weight}</td>
                  <td className="px-4 py-3 text-xs font-mono">{ing.vapor_pressure}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ing.ifra_category === "unrestricted" ? "outline" : ing.ifra_category === "restricted" ? "secondary" : "destructive"} className="text-xs">
                      {ing.ifra_category}
                    </Badge>
                  </td>
                  <td className="px-4 py-3"><div className={`w-2 h-2 rounded-full ${ing.is_active ? "bg-green-500" : "bg-destructive"}`} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ing)}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteIngredient(ing.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">No ingredients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editIng?.id ? "Edit Ingredient" : "New Ingredient"}</DialogTitle>
          </DialogHeader>
          {editIng && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Name</Label>
                <Input value={editIng.name || ""} onChange={(e) => setEditIng({ ...editIng, name: e.target.value })} />
              </div>
              <div>
                <Label>CAS Number</Label>
                <Input value={editIng.cas_number || ""} onChange={(e) => setEditIng({ ...editIng, cas_number: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={editIng.category} onValueChange={(v) => setEditIng({ ...editIng, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Functional Group</Label>
                <Select value={editIng.functional_group} onValueChange={(v) => setEditIng({ ...editIng, functional_group: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{functionalGroups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default Layer</Label>
                <Select value={editIng.default_layer} onValueChange={(v) => setEditIng({ ...editIng, default_layer: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{layers.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Molecular Weight (g/mol)</Label>
                <Input type="number" value={editIng.molecular_weight || 0} onChange={(e) => setEditIng({ ...editIng, molecular_weight: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Vapor Pressure (mmHg)</Label>
                <Input type="number" step="0.001" value={editIng.vapor_pressure || 0} onChange={(e) => setEditIng({ ...editIng, vapor_pressure: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Boiling Point (°C)</Label>
                <Input type="number" value={editIng.boiling_point || 0} onChange={(e) => setEditIng({ ...editIng, boiling_point: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Volatility Index (0-100)</Label>
                <Slider value={[editIng.volatility_index || 50]} onValueChange={([v]) => setEditIng({ ...editIng, volatility_index: v })} min={0} max={100} />
              </div>
              <div>
                <Label>Odor Intensity (0-100)</Label>
                <Slider value={[editIng.odor_intensity || 50]} onValueChange={([v]) => setEditIng({ ...editIng, odor_intensity: v })} min={0} max={100} />
              </div>
              <div>
                <Label>IFRA Category</Label>
                <Select value={editIng.ifra_category} onValueChange={(v) => setEditIng({ ...editIng, ifra_category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ifraCats.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>IFRA Max Concentration (%)</Label>
                <Input type="number" value={editIng.ifra_max_concentration || 100} onChange={(e) => setEditIng({ ...editIng, ifra_max_concentration: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <Label>Odor Profile</Label>
                <Input value={editIng.odor_profile || ""} onChange={(e) => setEditIng({ ...editIng, odor_profile: e.target.value })} />
              </div>
              <div>
                <Label>Warmth</Label>
                <Slider value={[editIng.warmth || 50]} onValueChange={([v]) => setEditIng({ ...editIng, warmth: v })} min={0} max={100} />
              </div>
              <div>
                <Label>Sweetness</Label>
                <Slider value={[editIng.sweetness || 50]} onValueChange={([v]) => setEditIng({ ...editIng, sweetness: v })} min={0} max={100} />
              </div>
              <div>
                <Label>Freshness</Label>
                <Slider value={[editIng.freshness || 50]} onValueChange={([v]) => setEditIng({ ...editIng, freshness: v })} min={0} max={100} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editIng.is_fixative || false} onCheckedChange={(v) => setEditIng({ ...editIng, is_fixative: v })} />
                <Label>Fixative</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editIng.is_active !== false} onCheckedChange={(v) => setEditIng({ ...editIng, is_active: v })} />
                <Label>Active</Label>
              </div>
              <div className="col-span-2 flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={saveIngredient}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
