import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("authorization");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });
    const { data: { user } } = await userClient.auth.getUser();

    const { action, formula_id, batch_size_ml } = await req.json();

    switch (action) {
      case "validate": {
        const { data, error } = await supabase.rpc("validate_formula", {
          _formula_id: formula_id,
        });
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "calculate_cost": {
        const { data, error } = await supabase.rpc("calculate_formula_cost", {
          _formula_id: formula_id,
          _batch_size_ml: batch_size_ml || 100,
        });
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "lock_version": {
        if (!user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const { data, error } = await supabase.rpc("lock_formula_version", {
          _formula_id: formula_id,
        });
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "simulate_evolution": {
        // Server-side scent evolution simulation over 8 hours
        const { data: ingredients, error: ingError } = await supabase
          .from("formula_ingredients")
          .select(`
            concentration_pct,
            layer_override,
            ingredient:ingredients (
              name, molecular_weight, vapor_pressure, boiling_point,
              volatility_index, warmth, sweetness, freshness,
              odor_intensity, default_layer, is_fixative, functional_group
            )
          `)
          .eq("formula_id", formula_id);

        if (ingError) throw ingError;
        if (!ingredients || ingredients.length === 0) {
          return new Response(
            JSON.stringify({ error: "No ingredients found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const timePoints = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8]; // hours
        const evolution = timePoints.map((t) => {
          const notes = ingredients.map((fi: any) => {
            const ing = fi.ingredient as any;
            const layer = fi.layer_override || ing.default_layer;

            // Volatility decay: higher volatility = faster decay
            const decayRate = (ing.volatility_index / 100) * 0.5;
            const fixativeBoost = ing.is_fixative ? 0.3 : 0;
            const persistence = Math.exp(-(decayRate - fixativeBoost) * t);

            // Molecular weight affects evaporation speed
            const mwFactor = Math.min(ing.molecular_weight / 300, 1.5);
            const evaporation = persistence * (1 / mwFactor);

            // Vapor pressure contribution
            const vpContribution = Math.max(0, 1 - (ing.vapor_pressure * t * 0.1));

            const intensity = fi.concentration_pct * evaporation * vpContribution * (ing.odor_intensity / 100);

            return {
              name: ing.name,
              layer,
              intensity: Math.round(intensity * 100) / 100,
              persistence: Math.round(persistence * 100) / 100,
              warmth: ing.warmth * persistence,
              sweetness: ing.sweetness * persistence,
              freshness: ing.freshness * evaporation,
            };
          });

          // Sort by intensity to find dominant notes
          const sorted = [...notes].sort((a, b) => b.intensity - a.intensity);
          const dominantNote = sorted[0]?.name || "none";
          const totalProjection = notes.reduce((sum, n) => sum + n.intensity, 0);

          // Aggregate character
          const totalWeight = notes.reduce((sum, n) => sum + n.intensity, 0) || 1;
          const avgWarmth = notes.reduce((s, n) => s + n.warmth * n.intensity, 0) / totalWeight;
          const avgSweetness = notes.reduce((s, n) => s + n.sweetness * n.intensity, 0) / totalWeight;
          const avgFreshness = notes.reduce((s, n) => s + n.freshness * n.intensity, 0) / totalWeight;

          // Detect collapse: if projection drops below 10% of initial
          const collapseWarning = t > 0 && totalProjection < 5;

          return {
            time_hours: t,
            dominant_note: dominantNote,
            total_projection: Math.round(totalProjection * 100) / 100,
            collapse_warning: collapseWarning,
            character: {
              warmth: Math.round(avgWarmth),
              sweetness: Math.round(avgSweetness),
              freshness: Math.round(avgFreshness),
            },
            notes: sorted.slice(0, 5).map((n) => ({
              name: n.name,
              layer: n.layer,
              intensity: n.intensity,
            })),
          };
        });

        // Stability assessment
        const initialProjection = evolution[0].total_projection;
        const fourHourProjection = evolution.find((e) => e.time_hours === 4)?.total_projection || 0;
        const eightHourProjection = evolution[evolution.length - 1].total_projection;

        const longevityScore = Math.round((eightHourProjection / Math.max(initialProjection, 1)) * 100);
        const stabilityScore = Math.round((fourHourProjection / Math.max(initialProjection, 1)) * 100);

        // Update formula with evolution summary
        const dominantPhases = evolution.reduce((acc: any, e) => {
          if (!acc[e.dominant_note]) acc[e.dominant_note] = [];
          acc[e.dominant_note].push(e.time_hours);
          return acc;
        }, {});

        const evolutionSummary = Object.entries(dominantPhases)
          .map(([note, times]: [string, any]) => `${note}: ${times[0]}–${times[times.length - 1]}h`)
          .join(" → ");

        await supabase
          .from("formulas")
          .update({
            evolution_summary: evolutionSummary,
            stability_score: stabilityScore,
          })
          .eq("id", formula_id);

        return new Response(
          JSON.stringify({
            evolution,
            longevity_score: longevityScore,
            stability_score: stabilityScore,
            evolution_summary: evolutionSummary,
            collapse_detected: evolution.some((e) => e.collapse_warning),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
