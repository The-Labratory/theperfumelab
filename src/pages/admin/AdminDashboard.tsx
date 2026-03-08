import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Beaker, FlaskConical, ArrowLeftRight, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  ingredients: number;
  formulas: number;
  interactions: number;
  ifraRules: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ ingredients: 0, formulas: 0, interactions: 0, ifraRules: 0 });
  const [recentFormulas, setRecentFormulas] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [ing, form, inter, ifra, recent] = await Promise.all([
      supabase.from("ingredients").select("id", { count: "exact", head: true }),
      supabase.from("formulas").select("id", { count: "exact", head: true }),
      supabase.from("ingredient_interactions").select("id", { count: "exact", head: true }),
      supabase.from("ifra_restrictions").select("id", { count: "exact", head: true }),
      supabase.from("formulas").select("*").order("created_at", { ascending: false }).limit(5),
    ]);
    setStats({
      ingredients: ing.count || 0,
      formulas: form.count || 0,
      interactions: inter.count || 0,
      ifraRules: ifra.count || 0,
    });
    setRecentFormulas(recent.data || []);
  };

  const cards = [
    { label: "Ingredients", value: stats.ingredients, icon: Beaker, color: "text-primary" },
    { label: "Formulas", value: stats.formulas, icon: FlaskConical, color: "text-secondary" },
    { label: "Interactions", value: stats.interactions, icon: ArrowLeftRight, color: "text-accent" },
    { label: "IFRA Rules", value: stats.ifraRules, icon: ShieldCheck, color: "text-green-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-surface rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                <p className={`text-3xl font-display font-bold ${c.color}`}>{c.value}</p>
              </div>
              <c.icon className={`w-8 h-8 ${c.color} opacity-50`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-surface rounded-xl p-5">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Recent Formulas</h2>
        {recentFormulas.length === 0 ? (
          <p className="text-sm text-muted-foreground">No formulas yet</p>
        ) : (
          <div className="space-y-2">
            {recentFormulas.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                <div>
                  <span className="text-sm font-medium text-foreground">{f.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">#{f.formula_number}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${f.compliance_status === "compliant" ? "bg-green-500/10 text-green-500" : f.compliance_status === "non_compliant" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>
                    {f.compliance_status}
                  </span>
                  <span className="text-xs text-muted-foreground">{f.concentration_type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
