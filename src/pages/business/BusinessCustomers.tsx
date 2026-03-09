import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Plus, Edit2, Trash2, Save, X, Mail, Phone, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function BusinessCustomers() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", customer_type: "b2c", notes: "" });

  useEffect(() => { loadCustomers(); }, [affiliate]);

  const loadCustomers = async () => {
    if (!affiliate) return;
    setLoading(true);
    const { data } = await supabase
      .from("partner_customers")
      .select("*")
      .eq("user_id", affiliate.user_id)
      .order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) return;
    const payload = {
      customer_name: form.customer_name.trim(),
      customer_email: form.customer_email.trim() || null,
      customer_phone: form.customer_phone.trim() || null,
      customer_type: form.customer_type,
      notes: form.notes.trim() || null,
    };
    if (editId) {
      await supabase.from("partner_customers").update(payload).eq("id", editId);
      toast.success("Customer updated!");
    } else {
      await supabase.from("partner_customers").insert({
        ...payload,
        affiliate_partner_id: affiliate.id,
        user_id: affiliate.user_id,
      });
      toast.success("Customer added!");
    }
    resetForm();
    loadCustomers();
  };

  const resetForm = () => {
    setForm({ customer_name: "", customer_email: "", customer_phone: "", customer_type: "b2c", notes: "" });
    setShowForm(false);
    setEditId(null);
  };

  const startEdit = (c: any) => {
    setForm({
      customer_name: c.customer_name,
      customer_email: c.customer_email || "",
      customer_phone: c.customer_phone || "",
      customer_type: c.customer_type,
      notes: c.notes || "",
    });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("partner_customers").delete().eq("id", id);
    toast.success("Customer removed");
    loadCustomers();
  };

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.customer_name.toLowerCase().includes(search.toLowerCase()) || (c.customer_email || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || c.customer_type === filterType;
    return matchSearch && matchType;
  });

  const b2cCount = customers.filter(c => c.customer_type === "b2c").length;
  const b2bCount = customers.filter(c => c.customer_type === "b2b").length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black tracking-wider text-foreground">Customers</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">Manage your B2B and B2C customer relationships</p>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add Customer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: customers.length, color: "text-primary" },
          { label: "B2C Customers", value: b2cCount, color: "text-accent" },
          { label: "B2B Customers", value: b2bCount, color: "text-secondary" },
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
          <h3 className="font-display text-sm font-bold tracking-wider">{editId ? "Edit Customer" : "Add Customer"}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input placeholder="Customer name *" value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} required maxLength={200} />
            <Input placeholder="Email" type="email" value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} maxLength={255} />
            <Input placeholder="Phone" value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} maxLength={20} />
            <Select value={form.customer_type} onValueChange={v => setForm({...form, customer_type: v})}>
              <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="b2c">B2C (Consumer)</SelectItem>
                <SelectItem value="b2b">B2B (Business)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} maxLength={500} />
          <div className="flex gap-2">
            <Button type="submit" size="sm"><Save className="w-3 h-3 mr-1" /> {editId ? "Update" : "Add"}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}><X className="w-3 h-3 mr-1" /> Cancel</Button>
          </div>
        </motion.form>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="b2c">B2C</SelectItem>
            <SelectItem value="b2b">B2B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Cards */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No customers yet. Add your first!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-surface rounded-xl p-5 border border-border/30 hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-display font-bold text-foreground">
                    {c.customer_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground">{c.customer_name}</p>
                    <Badge variant="secondary" className="text-[9px] mt-0.5">{c.customer_type.toUpperCase()}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(c)}><Edit2 className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              {c.customer_email && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Mail className="w-3 h-3" /> {c.customer_email}</p>
              )}
              {c.customer_phone && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Phone className="w-3 h-3" /> {c.customer_phone}</p>
              )}
              {c.notes && <p className="text-[10px] text-muted-foreground/70 mt-2 italic">{c.notes}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
