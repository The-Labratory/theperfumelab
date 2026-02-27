// ═══════════════════════════════════════════════════════════
// CLIENT-SIDE FORMULATION ENGINE
// Molecular compatibility, evaporation curves, stability scoring
// ═══════════════════════════════════════════════════════════

import { type MolecularIngredient, knownInteractions } from "@/data/molecularData";

// ─── Types ───────────────────────────────────────────────
export interface FormulaIngredient {
  ingredient: MolecularIngredient;
  concentrationPct: number;
  layerOverride?: "top" | "heart" | "base";
}

export interface CompatibilityResult {
  score: number; // 0-100
  factors: {
    volatilityAlignment: number;
    functionalGroupInteraction: number;
    evaporationSync: number;
    knownInteraction: number;
  };
  warnings: string[];
  isStable: boolean;
}

export interface EvaporationPoint {
  timeMinutes: number;
  topIntensity: number;
  heartIntensity: number;
  baseIntensity: number;
  totalProjection: number;
  dominantNote: string;
  dominantLayer: "top" | "heart" | "base";
}

export interface StabilityReport {
  overallScore: number; // 0-100
  harmonyScore: number;
  complianceStatus: "compliant" | "non_compliant";
  complianceViolations: string[];
  layerBalance: { top: number; heart: number; base: number };
  fixativePresence: number;
  evaporationCurve: EvaporationPoint[];
  warnings: string[];
  concentrationBreakdown: { name: string; pct: number; layer: string }[];
}

// ─── Functional Group Compatibility Matrix ───────────────
const FG_COMPAT: Record<string, Record<string, number>> = {
  aldehyde: { aldehyde: 40, ester: 85, ketone: 70, alcohol: 75, terpene: 60, musk: 50, phenol: 30, lactone: 65, other: 55 },
  ester:    { aldehyde: 85, ester: 80, ketone: 75, alcohol: 90, terpene: 70, musk: 75, phenol: 55, lactone: 80, other: 65 },
  ketone:   { aldehyde: 70, ester: 75, ketone: 65, alcohol: 80, terpene: 60, musk: 70, phenol: 50, lactone: 75, other: 60 },
  alcohol:  { aldehyde: 75, ester: 90, ketone: 80, alcohol: 85, terpene: 75, musk: 80, phenol: 60, lactone: 85, other: 70 },
  terpene:  { aldehyde: 60, ester: 70, ketone: 60, alcohol: 75, terpene: 70, musk: 55, phenol: 45, lactone: 60, other: 60 },
  musk:     { aldehyde: 50, ester: 75, ketone: 70, alcohol: 80, terpene: 55, musk: 85, phenol: 40, lactone: 70, other: 65 },
  phenol:   { aldehyde: 30, ester: 55, ketone: 50, alcohol: 60, terpene: 45, musk: 40, phenol: 35, lactone: 45, other: 40 },
  lactone:  { aldehyde: 65, ester: 80, ketone: 75, alcohol: 85, terpene: 60, musk: 70, phenol: 45, lactone: 75, other: 60 },
  other:    { aldehyde: 55, ester: 65, ketone: 60, alcohol: 70, terpene: 60, musk: 65, phenol: 40, lactone: 60, other: 55 },
};

// ─── Molecular Compatibility Engine ──────────────────────
export function calculateCompatibility(a: MolecularIngredient, b: MolecularIngredient): CompatibilityResult {
  const warnings: string[] = [];

  // 1. Volatility alignment (closer = better)
  const volDiff = Math.abs(a.volatilityIndex - b.volatilityIndex);
  const volatilityAlignment = Math.max(0, 100 - volDiff * 1.2);

  // 2. Functional group interaction
  const fgScore = FG_COMPAT[a.functionalGroup]?.[b.functionalGroup] ?? 50;

  // 3. Evaporation curve synchronization (based on vapor pressure ratio)
  const vpRatio = Math.min(a.vaporPressure, b.vaporPressure) / Math.max(a.vaporPressure, b.vaporPressure || 0.0001);
  const evaporationSync = vpRatio * 100;

  // 4. Known interaction lookup
  let knownScore = 50; // neutral default
  const interaction = knownInteractions.find(
    (i) =>
      (i.ingredientA === a.id && i.ingredientB === b.id) ||
      (i.ingredientA === b.id && i.ingredientB === a.id)
  );
  if (interaction) {
    if (interaction.type === "synergistic" || interaction.type === "enhancing") {
      knownScore = 50 + interaction.strength * 0.5;
    } else if (interaction.type === "antagonistic") {
      knownScore = Math.max(0, 50 - interaction.strength * 0.5);
      warnings.push(`Known clash: ${interaction.notes || "Antagonistic interaction detected"}`);
    }
  }

  // Weighted final score
  const score = Math.round(
    volatilityAlignment * 0.25 +
    fgScore * 0.25 +
    evaporationSync * 0.25 +
    knownScore * 0.25
  );

  if (a.odorIntensity > 75 && b.odorIntensity > 75) {
    warnings.push("Both ingredients have high odor intensity — risk of masking");
  }
  if (a.defaultLayer === b.defaultLayer && a.defaultLayer === "top" && volDiff < 5) {
    warnings.push("Very similar volatility in top layer — may merge indistinguishably");
  }

  return {
    score,
    factors: { volatilityAlignment, functionalGroupInteraction: fgScore, evaporationSync, knownInteraction: knownScore },
    warnings,
    isStable: score >= 40 && !warnings.some((w) => w.includes("Known clash")),
  };
}

// ─── Evaporation Curve Modeling ──────────────────────────
export function modelEvaporationCurve(ingredients: FormulaIngredient[]): EvaporationPoint[] {
  const points: EvaporationPoint[] = [];
  const totalMinutes = 480; // 8 hours
  const step = 30;

  for (let t = 0; t <= totalMinutes; t += step) {
    let topI = 0, heartI = 0, baseI = 0;
    let bestNote = "", bestIntensity = 0;

    for (const fi of ingredients) {
      const ing = fi.ingredient;
      const layer = fi.layerOverride || ing.defaultLayer;
      
      // Exponential decay based on vapor pressure and volatility
      const decayRate = (ing.vaporPressure * ing.volatilityIndex) / 500;
      const fixativeBonus = ing.isFixative ? 0.6 : 1.0;
      const intensity = fi.concentrationPct * ing.odorIntensity * Math.exp(-decayRate * fixativeBonus * (t / 60));
      
      const currentIntensity = Math.max(0, intensity);
      
      if (layer === "top") topI += currentIntensity;
      else if (layer === "heart") heartI += currentIntensity;
      else baseI += currentIntensity;

      if (currentIntensity > bestIntensity) {
        bestIntensity = currentIntensity;
        bestNote = ing.name;
      }
    }

    // Normalize to 0-100 scale
    const maxPossible = ingredients.reduce((s, fi) => s + fi.concentrationPct * fi.ingredient.odorIntensity, 0) || 1;
    const norm = (v: number) => Math.min(100, Math.round((v / maxPossible) * 100));

    const normTop = norm(topI);
    const normHeart = norm(heartI);
    const normBase = norm(baseI);

    points.push({
      timeMinutes: t,
      topIntensity: normTop,
      heartIntensity: normHeart,
      baseIntensity: normBase,
      totalProjection: Math.min(100, normTop + normHeart + normBase),
      dominantNote: bestNote || "None",
      dominantLayer: normTop >= normHeart && normTop >= normBase ? "top" : normHeart >= normBase ? "heart" : "base",
    });
  }

  return points;
}

// ─── Full Stability & Compliance Report ──────────────────
export function generateStabilityReport(
  ingredients: FormulaIngredient[],
  concentrationType: string = "EDP"
): StabilityReport {
  const warnings: string[] = [];
  const violations: string[] = [];

  // Concentration multiplier for final product
  const concMultiplier = concentrationType === "Parfum" ? 0.5 : concentrationType === "EDP" ? 0.3 : concentrationType === "EDT" ? 0.15 : 0.08;

  // Layer balance
  const layerTotals = { top: 0, heart: 0, base: 0 };
  let totalConc = 0;
  let fixativeConc = 0;

  const breakdown: { name: string; pct: number; layer: string }[] = [];

  for (const fi of ingredients) {
    const layer = fi.layerOverride || fi.ingredient.defaultLayer;
    layerTotals[layer] += fi.concentrationPct;
    totalConc += fi.concentrationPct;
    if (fi.ingredient.isFixative) fixativeConc += fi.concentrationPct;
    breakdown.push({ name: fi.ingredient.name, pct: fi.concentrationPct, layer });

    // IFRA compliance check
    const actualConc = fi.concentrationPct * concMultiplier;
    if (fi.ingredient.ifraCat === "restricted" && actualConc > fi.ingredient.ifraMaxConc) {
      violations.push(`${fi.ingredient.name}: ${actualConc.toFixed(2)}% exceeds IFRA limit of ${fi.ingredient.ifraMaxConc}%`);
    }
    if (fi.ingredient.ifraCat === "prohibited") {
      violations.push(`${fi.ingredient.name} is IFRA prohibited`);
    }
  }

  // Layer balance scoring
  const idealRatio = { top: 0.25, heart: 0.40, base: 0.35 };
  const topRatio = totalConc > 0 ? layerTotals.top / totalConc : 0;
  const heartRatio = totalConc > 0 ? layerTotals.heart / totalConc : 0;
  const baseRatio = totalConc > 0 ? layerTotals.base / totalConc : 0;

  const balanceScore = Math.round(100 - (
    Math.abs(topRatio - idealRatio.top) * 100 +
    Math.abs(heartRatio - idealRatio.heart) * 100 +
    Math.abs(baseRatio - idealRatio.base) * 100
  ));

  if (topRatio > 0.5) warnings.push("Top-heavy formula — may lack longevity");
  if (baseRatio > 0.6) warnings.push("Base-heavy formula — may lack initial projection");
  if (fixativeConc === 0 && ingredients.length > 0) warnings.push("No fixative detected — fragrance may fade quickly");
  if (topRatio === 0 && ingredients.length > 2) warnings.push("Missing top notes — no initial burst");

  // Harmony scoring (pairwise compatibility average)
  let harmonyTotal = 0, pairCount = 0;
  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      const compat = calculateCompatibility(ingredients[i].ingredient, ingredients[j].ingredient);
      harmonyTotal += compat.score;
      pairCount++;
      if (!compat.isStable) {
        warnings.push(`Instability between ${ingredients[i].ingredient.name} and ${ingredients[j].ingredient.name}`);
      }
    }
  }
  const harmonyScore = pairCount > 0 ? Math.round(harmonyTotal / pairCount) : 0;

  // Fixative presence score
  const fixativePresence = totalConc > 0 ? Math.min(100, Math.round((fixativeConc / totalConc) * 200)) : 0;

  // Overall stability = weighted combination
  const overallScore = Math.round(
    balanceScore * 0.3 +
    harmonyScore * 0.35 +
    fixativePresence * 0.15 +
    (violations.length === 0 ? 100 : 20) * 0.2
  );

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    harmonyScore,
    complianceStatus: violations.length === 0 ? "compliant" : "non_compliant",
    complianceViolations: violations,
    layerBalance: {
      top: Math.round(topRatio * 100),
      heart: Math.round(heartRatio * 100),
      base: Math.round(baseRatio * 100),
    },
    fixativePresence,
    evaporationCurve: modelEvaporationCurve(ingredients),
    warnings,
    concentrationBreakdown: breakdown,
  };
}
