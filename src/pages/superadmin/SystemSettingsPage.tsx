import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Save, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string | null;
  updated_at: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("system_settings").select("*").order("category").order("key");
    setSettings(data || []);
    setLoading(false);
  };

  const addSetting = async () => {
    if (!newKey.trim()) return toast.error("Key required");
    let parsedValue: any;
    try { parsedValue = JSON.parse(newValue); } catch { parsedValue = newValue; }
    const { error } = await supabase.from("system_settings").insert({
      key: newKey.trim(),
      value: parsedValue,
      category: newCategory,
      description: newDescription || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Setting added");
    setNewKey(""); setNewValue(""); setNewDescription("");
    loadSettings();
  };

  const updateSetting = async (id: string, value: string) => {
    let parsed: any;
    try { parsed = JSON.parse(value); } catch { parsed = value; }
    const { error } = await supabase.from("system_settings").update({ value: parsed }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    loadSettings();
  };

  const deleteSetting = async (id: string) => {
    const { error } = await supabase.from("system_settings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    loadSettings();
  };

  const categories = [...new Set(settings.map(s => s.category))];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">System Settings</h1>
        <Badge variant="outline" className="gap-1 text-amber-500 border-amber-500/30">
          <Shield className="w-3 h-3" /> Super Admin Only
        </Badge>
      </div>

      {/* Add new setting */}
      <div className="glass-surface rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Setting</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Key</Label>
            <Input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="setting_key" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Value (JSON)</Label>
            <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder='{"enabled": true}' className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} className="mt-1" />
          </div>
          <div className="flex items-end">
            <Button onClick={addSetting} className="w-full gap-1"><Plus className="w-4 h-4" /> Add</Button>
          </div>
        </div>
        {newKey && (
          <div className="mt-3">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Input value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="What this setting controls..." className="mt-1" />
          </div>
        )}
      </div>

      {/* Settings list grouped by category */}
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : settings.length === 0 ? (
        <div className="glass-surface rounded-xl p-8 text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No system settings configured</p>
        </div>
      ) : categories.map(cat => (
        <div key={cat} className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h3>
          <div className="space-y-2">
            {settings.filter(s => s.category === cat).map(s => (
              <div key={s.id} className="glass-surface rounded-lg p-4 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-sm font-mono text-foreground">{s.key}</code>
                    {s.description && <span className="text-xs text-muted-foreground">— {s.description}</span>}
                  </div>
                  <Textarea
                    defaultValue={typeof s.value === "string" ? s.value : JSON.stringify(s.value, null, 2)}
                    onBlur={e => updateSetting(s.id, e.target.value)}
                    className="text-xs font-mono min-h-[60px] mt-1"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Updated: {new Date(s.updated_at).toLocaleString()}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteSetting(s.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
