import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, AlertTriangle, CheckCircle, XCircle, FlaskConical, Sparkles, TrendingUp, ShieldCheck, Clock, ChevronDown, Search, Plus, Minus, Info, Save } from "lucide-react";
import { molecularIngredients, type MolecularIngredient } from "@/data/molecularData";
import { calculateCompatibility, generateStabilityReport, type FormulaIngredient, type StabilityReport, type EvaporationPoint } from "@/lib/formulationEngine";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as ReTooltip, LineChart, Line } from "recharts";

const concentrationTypes = ["Cologne", "EDT", "EDP", "Parfum"] as const;

const FormulationLabPage = () => {
  const [formulaName, setFormulaName] = useState("Untitled Formula");
  const [concType, setConcType] = useState<string>("EDP");
  const [selectedIngredients, setSelectedIngredients] = useState<FormulaIngredient[]>([]);
  const [search, setSearch] = useState("");
  const [layerFilter, setLayerFilter] = useState<string>("all");
  const [report, setReport] = useState<StabilityReport | null>(null);
  const [aiEvolution, setAiEvolution] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const filteredIngredients = useMemo(() => {
    return molecularIngredients.filter((ing) => {
      const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase()) || ing.functionalGroup.toLowerCase().includes(search.toLowerCase());
      const matchesLayer = layerFilter === "all" || ing.defaultLayer === layerFilter;
      return matchesSearch && matchesLayer;
    });
  }, [search, layerFilter]);

  const addIngredient = useCallback((ing: MolecularIngredient) => {
    if (selectedIngredients.find((si) => si.ingredient.id === ing.id)) {
      toast.error("Already in formula");
      return;
    }
    setSelectedIngredients((prev) => [...prev, { ingredient: ing, concentrationPct: 5 }]);
    setReport(null);
  }, [selectedIngredients]);

  const removeIngredient = (id: string) => {
    setSelectedIngredients((prev) => prev.filter((si) => si.ingredient.id !== id));
    setReport(null);
  };

  const updateConcentration = (id: string, pct: number) => {
    setSelectedIngredients((prev) => prev.map((si) => si.ingredient.id === id ? { ...si, concentrationPct: pct } : si));
    setReport(null);
  };

  const runAnalysis = () => {
    if (selectedIngredients.length < 2) {
      toast.error("Add at least 2 ingredients");
      return;
    }
    const r = generateStabilityReport(selectedIngredients, concType);
    setReport(r);
    toast.success("Analysis complete");
  };

  const [saving, setSaving] = useState(false);

  const saveFormula = async () => {
    if (selectedIngredients.length < 2) {
      toast.error("Add at least 2 ingredients to save");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save your creation");
        setSaving(false);
        return;
      }

      const scentNotes = selectedIngredients.map((si) => ({
        name: si.ingredient.name,
        layer: si.ingredient.defaultLayer,
        concentration: si.concentrationPct,
        functionalGroup: si.ingredient.functionalGroup,
        casNumber: si.ingredient.casNumber,
      }));

      const totalConc = selectedIngredients.reduce((sum, si) => sum + si.concentrationPct, 0);

      const { error } = await supabase.from("saved_blends").insert({
        user_id: user.id,
        name: formulaName || "Untitled Formula",
        scent_notes: scentNotes,
        concentration: concType,
        volume: 50,
        harmony_score: report?.harmonyScore ?? null,
        total_price: null,
        story_text: aiEvolution || null,
        is_public: false,
      });

      if (error) throw error;
      toast.success("Formula saved to your collection!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to save formula");
    } finally {
      setSaving(false);
    }
  };

  const requestAiEvolution = async () => {
    if (!report || selectedIngredients.length < 2) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("perfumer-ai", {
        body: {
          mode: "analyze",
          notes: selectedIngredients.map((si) => ({
            name: si.ingredient.name,
            layer: si.ingredient.defaultLayer,
            intensity: si.ingredient.odorIntensity,
            warmth: si.ingredient.warmth,
          })),
          concentration: concType,
        },
      });
      // Handle specific error codes
      if (data?.error || error) {
        const status = data?.status || error?.status;
        if (status === 401 || data?.error?.includes?.("Authentication")) {
          toast.error("Please sign in to use AI predictions");
          return;
        }
        if (status === 429) {
          toast.error("Too many requests — please wait a moment");
          return;
        }
        if (status === 402) {
          toast.error("AI credits exhausted. Please add credits.");
          return;
        }
        if (error) throw error;
      }
      setAiEvolution(data?.content || "No prediction available.");
    } catch {
      toast.error("AI prediction failed");
    } finally {
      setAiLoading(false);
    }
  };

  const getLayerColor = (layer: string) => {
    if (layer === "top") return "hsl(var(--primary))";
    if (layer === "heart") return "hsl(var(--secondary))";
    return "hsl(var(--accent))";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FlaskConical className="w-8 h-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text">Formulation Laboratory</h1>
          </div>
          <p className="text-muted-foreground font-body">Molecular-level fragrance engineering with real chemical data</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Ingredient Picker */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-surface rounded-xl p-4">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">Ingredient Database</h2>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search molecules..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted/50 border-border/50" />
                </div>
                <Select value={layerFilter} onValueChange={setLayerFilter}>
                  <SelectTrigger className="w-24 bg-muted/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="heart">Heart</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-1.5 pr-1">
                {filteredIngredients.map((ing) => {
                  const isAdded = selectedIngredients.some((si) => si.ingredient.id === ing.id);
                  return (
                    <motion.button
                      key={ing.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => !isAdded && addIngredient(ing)}
                      disabled={isAdded}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${isAdded ? "border-primary/30 bg-primary/5 opacity-60" : "border-border/30 hover:border-primary/50 bg-muted/30 hover:bg-muted/50"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-foreground">{ing.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: getLayerColor(ing.defaultLayer), color: getLayerColor(ing.defaultLayer) }}>{ing.defaultLayer}</Badge>
                            <span className="text-[10px] text-muted-foreground">{ing.functionalGroup}</span>
                            <span className="text-[10px] text-muted-foreground">{ing.molecularWeight} g/mol</span>
                          </div>
                        </div>
                        {isAdded ? <CheckCircle className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center: Formula Builder */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-surface rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <Input value={formulaName} onChange={(e) => setFormulaName(e.target.value)} className="text-lg font-display font-semibold bg-transparent border-none px-0 focus-visible:ring-0" />
                <Select value={concType} onValueChange={setConcType}>
                  <SelectTrigger className="w-28 bg-muted/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {concentrationTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {selectedIngredients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Beaker className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Add ingredients from the database</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedIngredients.map((fi) => (
                    <motion.div key={fi.ingredient.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-3 rounded-lg border border-border/30 bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLayerColor(fi.ingredient.defaultLayer) }} />
                          <span className="text-sm font-medium text-foreground">{fi.ingredient.name}</span>
                        </div>
                        <button onClick={() => removeIngredient(fi.ingredient.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Slider value={[fi.concentrationPct]} onValueChange={([v]) => updateConcentration(fi.ingredient.id, v)} min={0.5} max={40} step={0.5} className="flex-1" />
                        <span className="text-xs font-mono text-primary w-12 text-right">{fi.concentrationPct}%</span>
                      </div>
                      <div className="flex gap-2 mt-2 text-[10px] text-muted-foreground">
                        <span>VP: {fi.ingredient.vaporPressure} mmHg</span>
                        <span>BP: {fi.ingredient.boilingPoint}°C</span>
                        <span>MW: {fi.ingredient.molecularWeight}</span>
                        {fi.ingredient.ifraCat === "restricted" && <Badge variant="outline" className="text-[10px] px-1 py-0 border-accent text-accent">IFRA ⚠</Badge>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button onClick={runAnalysis} disabled={selectedIngredients.length < 2} className="flex-1 gap-2">
                  <Beaker className="w-4 h-4" /> Analyze Formula
                </Button>
                {report && (
                  <Button variant="outline" onClick={requestAiEvolution} disabled={aiLoading} className="gap-2">
                    <Sparkles className="w-4 h-4" /> {aiLoading ? "Predicting..." : "AI Predict"}
                  </Button>
                )}
              </div>
            </div>

            {/* Compatibility Matrix Preview */}
            {selectedIngredients.length >= 2 && (
              <div className="glass-surface rounded-xl p-4">
                <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Pairwise Compatibility
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedIngredients.map((a, i) =>
                    selectedIngredients.slice(i + 1).map((b) => {
                      const c = calculateCompatibility(a.ingredient, b.ingredient);
                      return (
                        <div key={`${a.ingredient.id}-${b.ingredient.id}`} className="flex items-center justify-between text-xs p-2 rounded bg-muted/20">
                          <span className="text-foreground truncate flex-1">{a.ingredient.name} × {b.ingredient.name}</span>
                          <Badge variant={c.score >= 70 ? "default" : c.score >= 40 ? "secondary" : "destructive"} className="text-[10px] ml-2">
                            {c.score}/100
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Analysis Results */}
          <div className="lg:col-span-1 space-y-4">
            <AnimatePresence mode="wait">
              {report ? (
                <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Scores */}
                  <div className="glass-surface rounded-xl p-4">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4">Formula Report</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <ScoreCard label="Stability" value={report.overallScore} icon={<ShieldCheck className="w-4 h-4" />} />
                      <ScoreCard label="Harmony" value={report.harmonyScore} icon={<Sparkles className="w-4 h-4" />} />
                      <ScoreCard label="Fixative" value={report.fixativePresence} icon={<Clock className="w-4 h-4" />} />
                      <div className={`rounded-lg p-3 border ${report.complianceStatus === "compliant" ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          {report.complianceStatus === "compliant" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
                          <span className="text-xs text-muted-foreground">EU/IFRA</span>
                        </div>
                        <span className={`text-sm font-semibold ${report.complianceStatus === "compliant" ? "text-green-500" : "text-destructive"}`}>
                          {report.complianceStatus === "compliant" ? "Compliant" : "Violation"}
                        </span>
                      </div>
                    </div>

                    {/* Layer Balance */}
                    <div className="mt-4">
                      <span className="text-xs text-muted-foreground">Layer Balance</span>
                      <div className="flex h-4 rounded-full overflow-hidden mt-1.5 bg-muted/30">
                        <div className="transition-all" style={{ width: `${report.layerBalance.top}%`, backgroundColor: "hsl(var(--primary))" }} />
                        <div className="transition-all" style={{ width: `${report.layerBalance.heart}%`, backgroundColor: "hsl(var(--secondary))" }} />
                        <div className="transition-all" style={{ width: `${report.layerBalance.base}%`, backgroundColor: "hsl(var(--accent))" }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                        <span>Top {report.layerBalance.top}%</span>
                        <span>Heart {report.layerBalance.heart}%</span>
                        <span>Base {report.layerBalance.base}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaporation Curve */}
                  <div className="glass-surface rounded-xl p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> Evaporation Curve (8h)
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={report.evaporationCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis dataKey="timeMinutes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v / 60}h`} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <ReTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11, color: "hsl(var(--foreground))" }} labelFormatter={(v) => `${Number(v) / 60}h`} />
                        <Area type="monotone" dataKey="topIntensity" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" name="Top" />
                        <Area type="monotone" dataKey="heartIntensity" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary) / 0.3)" name="Heart" />
                        <Area type="monotone" dataKey="baseIntensity" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.3)" name="Base" />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Projection Timeline */}
                  <div className="glass-surface rounded-xl p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3">Projection Intensity</h3>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={report.evaporationCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
                        <XAxis dataKey="timeMinutes" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v / 60}h`} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Line type="monotone" dataKey="totalProjection" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Warnings & Violations */}
                  {(report.warnings.length > 0 || report.complianceViolations.length > 0) && (
                    <div className="glass-surface rounded-xl p-4">
                      <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-accent" /> Warnings
                      </h3>
                      <div className="space-y-1.5">
                        {report.complianceViolations.map((v, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-destructive/10 text-destructive">
                            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{v}</span>
                          </div>
                        ))}
                        {report.warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-accent/10 text-accent">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Concentration Breakdown */}
                  <div className="glass-surface rounded-xl p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-3">Concentration Breakdown</h3>
                    <div className="space-y-1">
                      {report.concentrationBreakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLayerColor(item.layer) }} />
                            <span className="text-foreground">{item.name}</span>
                          </div>
                          <span className="font-mono text-primary">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Evolution */}
                  {aiEvolution && (
                    <div className="glass-surface rounded-xl p-4">
                      <h3 className="font-display text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary" /> AI Evolution Prediction
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{aiEvolution}</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-surface rounded-xl p-8 text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Add ingredients and run analysis to see the formula report</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Score Card Component ────────────────────────────────
function ScoreCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = value >= 70 ? "text-green-500" : value >= 40 ? "text-accent" : "text-destructive";
  return (
    <div className="rounded-lg p-3 border border-border/30 bg-muted/10">
      <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">{icon}<span className="text-xs">{label}</span></div>
      <span className={`text-xl font-display font-bold ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground">/100</span>
    </div>
  );
}

export default FormulationLabPage;
