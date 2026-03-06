import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Triangle, Plus, Trash2, Save, Eye, Upload, RotateCcw, History, Palette, Database } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PyramidLevel {
  label: string;
  value: number;
  color: string;
}

interface PyramidConfig {
  id?: string;
  name: string;
  description: string;
  data_source_mode: "manual" | "data_driven";
  config: { levels: PyramidLevel[] };
  colors: { background: string; text: string; accent: string };
  visibility_rules: { roles: string[] };
  is_active: boolean;
}

interface ConfigVersion {
  id: string;
  version: number;
  config_snapshot: any;
  published_at: string;
  notes: string | null;
}

const DEFAULT_CONFIG: PyramidConfig = {
  name: "",
  description: "",
  data_source_mode: "manual",
  config: {
    levels: [
      { label: "Diamond Legend", value: 1, color: "#a855f7" },
      { label: "High Achiever", value: 5, color: "#f59e0b" },
      { label: "Platinum", value: 15, color: "#06b6d4" },
      { label: "Gold", value: 50, color: "#eab308" },
      { label: "Silver", value: 150, color: "#9ca3af" },
      { label: "Bronze", value: 500, color: "#b45309" },
    ],
  },
  colors: { background: "#0a0a0f", text: "#ffffff", accent: "#14b8a6" },
  visibility_rules: { roles: ["super_admin", "admin"] },
  is_active: false,
};

export default function PyramidBuilderPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [current, setCurrent] = useState<PyramidConfig>(DEFAULT_CONFIG);
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [publishNotes, setPublishNotes] = useState("");
  const [dbStats, setDbStats] = useState<{ customers: number; agents: number; revenue: number } | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    const { data } = await supabase.from("pyramid_chart_configs").select("*").order("created_at", { ascending: false });
    setConfigs(data || []);
    if (data && data.length > 0) {
      const active = data.find((c: any) => c.is_active) || data[0];
      setCurrent({
        ...active,
        data_source_mode: active.data_source_mode as "manual" | "data_driven",
        config: active.config as any,
        colors: active.colors as any,
        visibility_rules: active.visibility_rules as any,
      });
      loadVersions(active.id);
    }
    setLoading(false);
  };

  const loadVersions = async (configId: string) => {
    const { data } = await supabase
      .from("pyramid_chart_config_versions")
      .select("*")
      .eq("config_id", configId)
      .order("version", { ascending: false });
    setVersions((data as ConfigVersion[]) || []);
  };

  const loadDbStats = async () => {
    const [profiles, affiliates, orders] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("affiliate_partners").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total"),
    ]);
    const revenue = (orders.data || []).reduce((s, o) => s + (o.total || 0), 0);
    setDbStats({ customers: profiles.count || 0, agents: affiliates.count || 0, revenue });
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      if (current.id) {
        const { error } = await supabase
          .from("pyramid_chart_configs")
          .update({
            name: current.name,
            description: current.description,
            data_source_mode: current.data_source_mode,
            config: current.config as any,
            colors: current.colors as any,
            visibility_rules: current.visibility_rules as any,
          })
          .eq("id", current.id);
        if (error) throw error;
        toast.success("Config saved");
      } else {
        const { data, error } = await supabase
          .from("pyramid_chart_configs")
          .insert({
            name: current.name || "Untitled Pyramid",
            description: current.description,
            data_source_mode: current.data_source_mode,
            config: current.config as any,
            colors: current.colors as any,
            visibility_rules: current.visibility_rules as any,
          })
          .select()
          .single();
        if (error) throw error;
        setCurrent({ ...current, id: data.id });
        toast.success("Config created");
      }
      loadConfigs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const publishConfig = async () => {
    if (!current.id) return toast.error("Save the config first");
    const nextVersion = versions.length > 0 ? versions[0].version + 1 : 1;
    try {
      // Deactivate all others
      await supabase.from("pyramid_chart_configs").update({ is_active: false }).neq("id", current.id);
      // Activate this one
      await supabase.from("pyramid_chart_configs").update({ is_active: true }).eq("id", current.id);
      // Create version
      const { error } = await supabase.from("pyramid_chart_config_versions").insert({
        config_id: current.id,
        version: nextVersion,
        config_snapshot: { ...current.config, colors: current.colors, visibility_rules: current.visibility_rules } as any,
        notes: publishNotes || null,
      });
      if (error) throw error;
      setCurrent({ ...current, is_active: true });
      setPublishNotes("");
      toast.success(`Published as v${nextVersion}`);
      loadVersions(current.id);
      loadConfigs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const rollbackToVersion = async (v: ConfigVersion) => {
    if (!current.id) return;
    const snapshot = v.config_snapshot as any;
    const updated: PyramidConfig = {
      ...current,
      config: { levels: snapshot.levels || [] },
      colors: snapshot.colors || current.colors,
      visibility_rules: snapshot.visibility_rules || current.visibility_rules,
    };
    setCurrent(updated);
    await supabase
      .from("pyramid_chart_configs")
      .update({
        config: updated.config as any,
        colors: updated.colors as any,
        visibility_rules: updated.visibility_rules as any,
      })
      .eq("id", current.id);
    toast.success(`Rolled back to v${v.version}`);
  };

  const addLevel = () => {
    setCurrent({
      ...current,
      config: {
        ...current.config,
        levels: [...current.config.levels, { label: "New Level", value: 0, color: "#6366f1" }],
      },
    });
  };

  const removeLevel = (idx: number) => {
    setCurrent({
      ...current,
      config: {
        ...current.config,
        levels: current.config.levels.filter((_, i) => i !== idx),
      },
    });
  };

  const updateLevel = (idx: number, field: keyof PyramidLevel, value: string | number) => {
    const levels = [...current.config.levels];
    levels[idx] = { ...levels[idx], [field]: value };
    setCurrent({ ...current, config: { ...current.config, levels } });
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Triangle className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Network Builder</h1>
          {current.is_active && <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Active</Badge>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowVersions(!showVersions)} className="gap-1">
            <History className="w-4 h-4" /> Versions ({versions.length})
          </Button>
          <Button variant="outline" size="sm" onClick={saveConfig} disabled={saving} className="gap-1">
            <Save className="w-4 h-4" /> Save
          </Button>
          <Button size="sm" onClick={publishConfig} className="gap-1">
            <Upload className="w-4 h-4" /> Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config Editor */}
        <div className="space-y-4">
          <div className="glass-surface rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">General</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={current.name} onChange={e => setCurrent({ ...current, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Data Source</Label>
                <Select
                  value={current.data_source_mode}
                  onValueChange={(v) => {
                    setCurrent({ ...current, data_source_mode: v as any });
                    if (v === "data_driven") loadDbStats();
                  }}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="data_driven">Data-Driven</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={current.description} onChange={e => setCurrent({ ...current, description: e.target.value })} className="mt-1 min-h-[60px]" />
            </div>
          </div>

          {current.data_source_mode === "data_driven" && dbStats && (
            <div className="glass-surface rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Live Data
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-2xl font-bold text-foreground">{dbStats.customers}</p>
                  <p className="text-[10px] text-muted-foreground">Customers</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-2xl font-bold text-foreground">{dbStats.agents}</p>
                  <p className="text-[10px] text-muted-foreground">Agents</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <p className="text-2xl font-bold text-foreground">€{dbStats.revenue.toFixed(0)}</p>
                  <p className="text-[10px] text-muted-foreground">Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* Levels Editor */}
          <div className="glass-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Levels ({current.config.levels.length})</h3>
              <Button variant="outline" size="sm" onClick={addLevel} className="gap-1"><Plus className="w-3 h-3" /> Add</Button>
            </div>
            <div className="space-y-2">
              {current.config.levels.map((level, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/20">
                  <input
                    type="color"
                    value={level.color}
                    onChange={e => updateLevel(idx, "color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={level.label}
                    onChange={e => updateLevel(idx, "label", e.target.value)}
                    className="flex-1 text-sm h-8"
                    placeholder="Level name"
                  />
                  <Input
                    type="number"
                    value={level.value}
                    onChange={e => updateLevel(idx, "value", Number(e.target.value))}
                    className="w-20 text-sm h-8"
                    placeholder="Value"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeLevel(idx)} className="text-destructive h-8 w-8 p-0">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="glass-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Theme Colors
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(["background", "text", "accent"] as const).map(key => (
                <div key={key}>
                  <Label className="text-xs text-muted-foreground capitalize">{key}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={current.colors[key] || "#000000"}
                      onChange={e => setCurrent({ ...current, colors: { ...current.colors, [key]: e.target.value } })}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <Input
                      value={current.colors[key] || ""}
                      onChange={e => setCurrent({ ...current, colors: { ...current.colors, [key]: e.target.value } })}
                      className="text-xs h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Publish Notes */}
          <div className="glass-surface rounded-xl p-5">
            <Label className="text-xs text-muted-foreground">Publish Notes (optional)</Label>
            <Input
              value={publishNotes}
              onChange={e => setPublishNotes(e.target.value)}
              placeholder="What changed in this version?"
              className="mt-1"
            />
          </div>
        </div>

        {/* Preview + Versions */}
        <div className="space-y-4">
          <div className="glass-surface rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
            </div>
            <div
              className="rounded-xl p-6 min-h-[400px] flex flex-col items-center justify-center"
              style={{ background: current.colors.background }}
            >
              {current.config.levels.length === 0 ? (
                <p style={{ color: current.colors.text }} className="text-sm opacity-50">Add levels to see preview</p>
              ) : (
                <div className="w-full max-w-md space-y-1">
                  {current.config.levels.map((level, idx) => {
                    const totalLevels = current.config.levels.length;
                    const widthPct = 30 + ((idx / Math.max(totalLevels - 1, 1)) * 70);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="mx-auto flex items-center justify-between px-4 py-2.5 rounded-lg"
                        style={{
                          width: `${widthPct}%`,
                          background: level.color,
                          color: current.colors.text,
                        }}
                      >
                        <span className="text-xs font-medium truncate">{level.label}</span>
                        <span className="text-xs font-bold">{level.value}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Versions History */}
          {showVersions && (
            <div className="glass-surface rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <History className="w-4 h-4" /> Version History
              </h3>
              {versions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No published versions yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-auto">
                  {versions.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/20">
                      <div>
                        <span className="text-sm font-medium text-foreground">v{v.version}</span>
                        <span className="text-xs text-muted-foreground ml-2">{new Date(v.published_at).toLocaleString()}</span>
                        {v.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{v.notes}</p>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => rollbackToVersion(v)} className="gap-1 text-xs">
                        <RotateCcw className="w-3 h-3" /> Rollback
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Existing Configs */}
          {configs.length > 1 && (
            <div className="glass-surface rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Saved Configs</h3>
              <div className="space-y-1">
                {configs.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCurrent({ ...c, config: c.config as any, colors: c.colors as any, visibility_rules: c.visibility_rules as any });
                      loadVersions(c.id);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${c.id === current.id ? "bg-primary/10 text-primary" : "hover:bg-muted/20 text-muted-foreground"}`}
                  >
                    {c.name || "Untitled"} {c.is_active && <Badge className="ml-2 text-[10px] bg-green-500/10 text-green-500">Active</Badge>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
