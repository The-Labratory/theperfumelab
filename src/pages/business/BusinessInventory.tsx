import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Plus, AlertTriangle, Edit2, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface InventoryItem {
  id: string;
  product_name: string;
  sku: string | null;
  quantity_in_stock: number;
  quantity_sold: number;
  unit_price: number;
  cost_price: number;
  low_stock_threshold: number;
  notes: string | null;
}

export default function BusinessInventory() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ product_name: "", sku: "", quantity_in_stock: "0", unit_price: "0", cost_price: "0", low_stock_threshold: "5" });

  useEffect(() => { loadItems(); }, [affiliate]);

  const loadItems = async () => {
    if (!affiliate) return;
    setLoading(true);
    const { data } = await supabase
      .from("partner_inventory")
      .select("*")
      .eq("user_id", affiliate.user_id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_name.trim()) return;
    const payload = {
      product_name: form.product_name.trim(),
      sku: form.sku.trim() || null,
      quantity_in_stock: parseInt(form.quantity_in_stock) || 0,
      unit_price: parseFloat(form.unit_price) || 0,
      cost_price: parseFloat(form.cost_price) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
    };

    if (editId) {
      await supabase.from("partner_inventory").update(payload).eq("id", editId);
      toast.success("Product updated!");
    } else {
      await supabase.from("partner_inventory").insert({
        ...payload,
        affiliate_partner_id: affiliate.id,
        user_id: affiliate.user_id,
      });
      toast.success("Product added!");
    }
    resetForm();
    loadItems();
  };

  const resetForm = () => {
    setForm({ product_name: "", sku: "", quantity_in_stock: "0", unit_price: "0", cost_price: "0", low_stock_threshold: "5" });
    setShowForm(false);
    setEditId(null);
  };

  const startEdit = (item: InventoryItem) => {
    setForm({
      product_name: item.product_name,
      sku: item.sku || "",
      quantity_in_stock: String(item.quantity_in_stock),
      unit_price: String(item.unit_price),
      cost_price: String(item.cost_price),
      low_stock_threshold: String(item.low_stock_threshold),
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("partner_inventory").delete().eq("id", id);
    toast.success("Product removed");
    loadItems();
  };

  const lowStockCount = items.filter(i => i.quantity_in_stock <= i.low_stock_threshold).length;
  const totalValue = items.reduce((s, i) => s + i.quantity_in_stock * i.unit_price, 0);
  const totalItems = items.reduce((s, i) => s + i.quantity_in_stock, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black tracking-wider text-foreground">Inventory</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">Track your product stock levels</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: items.length, color: "text-primary" },
          { label: "Total Stock Value", value: `€${totalValue.toFixed(0)}`, color: "text-accent" },
          { label: "Low Stock Alerts", value: lowStockCount, color: lowStockCount > 0 ? "text-destructive" : "text-green-500" },
        ].map(s => (
          <div key={s.label} className="glass-surface rounded-xl p-4 border border-border/30 text-center">
            <p className={`font-display text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[9px] font-display tracking-widest text-muted-foreground mt-1">{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit}
          className="glass-surface rounded-xl p-6 border border-primary/20 space-y-4">
          <h3 className="font-display text-sm font-bold tracking-wider text-foreground">{editId ? "Edit Product" : "Add Product"}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input placeholder="Product name *" value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} required maxLength={200} />
            <Input placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} maxLength={50} />
            <Input placeholder="Quantity" type="number" value={form.quantity_in_stock} onChange={e => setForm({...form, quantity_in_stock: e.target.value})} />
            <Input placeholder="Unit price (€)" type="number" step="0.01" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} />
            <Input placeholder="Cost price (€)" type="number" step="0.01" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} />
            <Input placeholder="Low stock alert at" type="number" value={form.low_stock_threshold} onChange={e => setForm({...form, low_stock_threshold: e.target.value})} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm"><Save className="w-3 h-3 mr-1" /> {editId ? "Update" : "Add"}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}><X className="w-3 h-3 mr-1" /> Cancel</Button>
          </div>
        </motion.form>
      )}

      {/* Table */}
      <div className="glass-surface rounded-xl border border-border/30 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/30">
              {["Product", "SKU", "Stock", "Price", "Value", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-display tracking-widest text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">No products yet. Add your first!</td></tr>
            ) : items.map(item => {
              const isLow = item.quantity_in_stock <= item.low_stock_threshold;
              return (
                <tr key={item.id} className="border-b border-border/20 hover:bg-muted/10">
                  <td className="px-4 py-3 text-xs font-display font-semibold text-foreground">{item.product_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-body">{item.sku || "—"}</td>
                  <td className="px-4 py-3 text-xs font-display font-bold text-foreground">{item.quantity_in_stock}</td>
                  <td className="px-4 py-3 text-xs text-foreground">€{item.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs font-display font-bold text-primary">€{(item.quantity_in_stock * item.unit_price).toFixed(0)}</td>
                  <td className="px-4 py-3">
                    {isLow ? (
                      <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="w-3 h-3" /> Low</Badge>
                    ) : (
                      <Badge variant="default" className="text-[10px]">In Stock</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(item)}><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
