// ═══════════════════════════════════════════════════════════
// MOLECULAR DATA — Real chemical properties for fragrance ingredients
// This serves as the static seed dataset for the formulation engine
// ═══════════════════════════════════════════════════════════

export interface MolecularIngredient {
  id: string;
  name: string;
  casNumber: string;
  category: "natural" | "synthetic" | "isolate";
  functionalGroup: "aldehyde" | "ester" | "ketone" | "alcohol" | "terpene" | "musk" | "phenol" | "lactone" | "other";
  molecularWeight: number; // g/mol
  vaporPressure: number; // mmHg at 25°C
  boilingPoint: number; // °C
  volatilityIndex: number; // 0-100
  ifraCat: "unrestricted" | "restricted" | "prohibited";
  ifraMaxConc: number; // max % in fine fragrance
  odorProfile: string;
  odorIntensity: number; // 0-100
  defaultLayer: "top" | "heart" | "base";
  isFixative: boolean;
  warmth: number;
  sweetness: number;
  freshness: number;
}

export const molecularIngredients: MolecularIngredient[] = [
  // ══════════ TOP NOTES ══════════
  { id: "linalyl-acetate", name: "Linalyl Acetate", casNumber: "115-95-7", category: "isolate", functionalGroup: "ester", molecularWeight: 196.29, vaporPressure: 0.17, boilingPoint: 220, volatilityIndex: 82, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Fresh, fruity-floral, bergamot-like", odorIntensity: 55, defaultLayer: "top", isFixative: false, warmth: 20, sweetness: 40, freshness: 85 },
  { id: "limonene", name: "D-Limonene", casNumber: "5989-27-5", category: "isolate", functionalGroup: "terpene", molecularWeight: 136.23, vaporPressure: 1.98, boilingPoint: 176, volatilityIndex: 92, ifraCat: "restricted", ifraMaxConc: 80, odorProfile: "Bright citrus, orange peel", odorIntensity: 60, defaultLayer: "top", isFixative: false, warmth: 15, sweetness: 30, freshness: 95 },
  { id: "linalool", name: "Linalool", casNumber: "78-70-6", category: "isolate", functionalGroup: "alcohol", molecularWeight: 154.25, vaporPressure: 0.16, boilingPoint: 198, volatilityIndex: 78, ifraCat: "restricted", ifraMaxConc: 25, odorProfile: "Floral, woody, lavender", odorIntensity: 50, defaultLayer: "top", isFixative: false, warmth: 30, sweetness: 35, freshness: 70 },
  { id: "citral", name: "Citral", casNumber: "5392-40-5", category: "isolate", functionalGroup: "aldehyde", molecularWeight: 152.23, vaporPressure: 0.09, boilingPoint: 229, volatilityIndex: 85, ifraCat: "restricted", ifraMaxConc: 5, odorProfile: "Lemon, verbena, sharp citrus", odorIntensity: 75, defaultLayer: "top", isFixative: false, warmth: 10, sweetness: 15, freshness: 95 },
  { id: "citronellol", name: "Citronellol", casNumber: "106-22-9", category: "isolate", functionalGroup: "alcohol", molecularWeight: 156.27, vaporPressure: 0.02, boilingPoint: 225, volatilityIndex: 70, ifraCat: "restricted", ifraMaxConc: 30, odorProfile: "Rose-like, green, citrusy", odorIntensity: 45, defaultLayer: "top", isFixative: false, warmth: 25, sweetness: 40, freshness: 65 },
  { id: "alpha-pinene", name: "α-Pinene", casNumber: "80-56-8", category: "isolate", functionalGroup: "terpene", molecularWeight: 136.23, vaporPressure: 4.75, boilingPoint: 155, volatilityIndex: 95, ifraCat: "restricted", ifraMaxConc: 50, odorProfile: "Pine, resinous, sharp", odorIntensity: 65, defaultLayer: "top", isFixative: false, warmth: 10, sweetness: 5, freshness: 90 },
  { id: "eucalyptol", name: "Eucalyptol (1,8-Cineole)", casNumber: "470-82-6", category: "isolate", functionalGroup: "other", molecularWeight: 154.25, vaporPressure: 1.90, boilingPoint: 176, volatilityIndex: 88, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Camphoraceous, fresh, minty", odorIntensity: 70, defaultLayer: "top", isFixative: false, warmth: 5, sweetness: 5, freshness: 95 },
  { id: "dihydromyrcenol", name: "Dihydromyrcenol", casNumber: "18479-58-8", category: "synthetic", functionalGroup: "alcohol", molecularWeight: 156.27, vaporPressure: 0.40, boilingPoint: 202, volatilityIndex: 80, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Fresh, metallic, citrus-green", odorIntensity: 55, defaultLayer: "top", isFixative: false, warmth: 10, sweetness: 10, freshness: 90 },
  { id: "aldehyde-c11", name: "Aldehyde C-11 (Undecanal)", casNumber: "112-44-7", category: "synthetic", functionalGroup: "aldehyde", molecularWeight: 170.29, vaporPressure: 0.03, boilingPoint: 223, volatilityIndex: 75, ifraCat: "restricted", ifraMaxConc: 3, odorProfile: "Waxy, citrus, fresh aldehydic", odorIntensity: 80, defaultLayer: "top", isFixative: false, warmth: 20, sweetness: 20, freshness: 75 },
  { id: "hedione", name: "Hedione (Methyl dihydrojasmonate)", casNumber: "24851-98-7", category: "synthetic", functionalGroup: "ester", molecularWeight: 226.31, vaporPressure: 0.006, boilingPoint: 282, volatilityIndex: 55, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Jasmine, transparent, radiant", odorIntensity: 30, defaultLayer: "top", isFixative: false, warmth: 30, sweetness: 40, freshness: 65 },

  // ══════════ HEART NOTES ══════════
  { id: "geraniol", name: "Geraniol", casNumber: "106-24-1", category: "isolate", functionalGroup: "alcohol", molecularWeight: 154.25, vaporPressure: 0.03, boilingPoint: 230, volatilityIndex: 58, ifraCat: "restricted", ifraMaxConc: 20, odorProfile: "Rose, geranium, sweet floral", odorIntensity: 55, defaultLayer: "heart", isFixative: false, warmth: 35, sweetness: 55, freshness: 45 },
  { id: "eugenol", name: "Eugenol", casNumber: "97-53-0", category: "isolate", functionalGroup: "phenol", molecularWeight: 164.20, vaporPressure: 0.01, boilingPoint: 254, volatilityIndex: 45, ifraCat: "restricted", ifraMaxConc: 5, odorProfile: "Spicy, clove, warm", odorIntensity: 80, defaultLayer: "heart", isFixative: false, warmth: 85, sweetness: 30, freshness: 10 },
  { id: "phenylethyl-alcohol", name: "Phenylethyl Alcohol", casNumber: "60-12-8", category: "isolate", functionalGroup: "alcohol", molecularWeight: 122.16, vaporPressure: 0.12, boilingPoint: 219, volatilityIndex: 52, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Rose, honey, green", odorIntensity: 40, defaultLayer: "heart", isFixative: false, warmth: 30, sweetness: 50, freshness: 35 },
  { id: "ionone-alpha", name: "α-Isomethyl Ionone", casNumber: "127-51-5", category: "synthetic", functionalGroup: "ketone", molecularWeight: 206.32, vaporPressure: 0.005, boilingPoint: 268, volatilityIndex: 40, ifraCat: "restricted", ifraMaxConc: 10, odorProfile: "Violet, powdery, woody-floral", odorIntensity: 65, defaultLayer: "heart", isFixative: false, warmth: 40, sweetness: 45, freshness: 30 },
  { id: "coumarin", name: "Coumarin", casNumber: "91-64-5", category: "synthetic", functionalGroup: "lactone", molecularWeight: 146.14, vaporPressure: 0.001, boilingPoint: 301, volatilityIndex: 30, ifraCat: "restricted", ifraMaxConc: 2, odorProfile: "Hay, tonka, warm almond", odorIntensity: 70, defaultLayer: "heart", isFixative: true, warmth: 70, sweetness: 75, freshness: 10 },
  { id: "damascenone", name: "β-Damascenone", casNumber: "23696-85-7", category: "isolate", functionalGroup: "ketone", molecularWeight: 190.28, vaporPressure: 0.003, boilingPoint: 275, volatilityIndex: 35, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Rose, fruity, deep floral", odorIntensity: 90, defaultLayer: "heart", isFixative: false, warmth: 45, sweetness: 60, freshness: 25 },
  { id: "benzyl-acetate", name: "Benzyl Acetate", casNumber: "140-11-4", category: "synthetic", functionalGroup: "ester", molecularWeight: 150.17, vaporPressure: 0.16, boilingPoint: 213, volatilityIndex: 60, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Jasmine, fruity, sweet", odorIntensity: 50, defaultLayer: "heart", isFixative: false, warmth: 25, sweetness: 55, freshness: 50 },
  { id: "cinnamaldehyde", name: "Cinnamaldehyde", casNumber: "104-55-2", category: "isolate", functionalGroup: "aldehyde", molecularWeight: 132.16, vaporPressure: 0.03, boilingPoint: 248, volatilityIndex: 48, ifraCat: "restricted", ifraMaxConc: 2, odorProfile: "Cinnamon, spicy, warm", odorIntensity: 85, defaultLayer: "heart", isFixative: false, warmth: 90, sweetness: 40, freshness: 5 },
  { id: "methyl-salicylate", name: "Methyl Salicylate", casNumber: "119-36-8", category: "isolate", functionalGroup: "ester", molecularWeight: 152.15, vaporPressure: 0.04, boilingPoint: 222, volatilityIndex: 50, ifraCat: "restricted", ifraMaxConc: 5, odorProfile: "Wintergreen, sweet, minty", odorIntensity: 75, defaultLayer: "heart", isFixative: false, warmth: 20, sweetness: 50, freshness: 60 },
  { id: "galaxolide", name: "Galaxolide", casNumber: "1222-05-5", category: "synthetic", functionalGroup: "musk", molecularWeight: 258.40, vaporPressure: 0.0007, boilingPoint: 327, volatilityIndex: 18, ifraCat: "restricted", ifraMaxConc: 15, odorProfile: "Clean musk, soft, powdery", odorIntensity: 35, defaultLayer: "heart", isFixative: true, warmth: 40, sweetness: 35, freshness: 50 },

  // ══════════ BASE NOTES ══════════
  { id: "vanillin", name: "Vanillin", casNumber: "121-33-5", category: "synthetic", functionalGroup: "aldehyde", molecularWeight: 152.15, vaporPressure: 0.0002, boilingPoint: 285, volatilityIndex: 15, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Vanilla, sweet, creamy", odorIntensity: 75, defaultLayer: "base", isFixative: true, warmth: 70, sweetness: 95, freshness: 5 },
  { id: "ethyl-vanillin", name: "Ethyl Vanillin", casNumber: "121-32-4", category: "synthetic", functionalGroup: "aldehyde", molecularWeight: 166.17, vaporPressure: 0.0001, boilingPoint: 295, volatilityIndex: 12, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Intense vanilla, powdery", odorIntensity: 85, defaultLayer: "base", isFixative: true, warmth: 75, sweetness: 98, freshness: 3 },
  { id: "santalol", name: "α-Santalol", casNumber: "115-71-9", category: "natural", functionalGroup: "alcohol", molecularWeight: 220.35, vaporPressure: 0.00015, boilingPoint: 301, volatilityIndex: 10, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Creamy, woody, sandalwood", odorIntensity: 50, defaultLayer: "base", isFixative: true, warmth: 60, sweetness: 45, freshness: 15 },
  { id: "iso-e-super", name: "Iso E Super", casNumber: "54464-57-2", category: "synthetic", functionalGroup: "ketone", molecularWeight: 234.38, vaporPressure: 0.003, boilingPoint: 273, volatilityIndex: 22, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Velvety, woody, amber", odorIntensity: 25, defaultLayer: "base", isFixative: true, warmth: 55, sweetness: 30, freshness: 25 },
  { id: "ambroxan", name: "Ambroxan", casNumber: "6790-58-5", category: "synthetic", functionalGroup: "other", molecularWeight: 236.39, vaporPressure: 0.001, boilingPoint: 286, volatilityIndex: 20, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Ambery, warm, skin-like", odorIntensity: 30, defaultLayer: "base", isFixative: true, warmth: 65, sweetness: 35, freshness: 30 },
  { id: "muscone", name: "Muscone", casNumber: "541-91-3", category: "natural", functionalGroup: "musk", molecularWeight: 238.41, vaporPressure: 0.0001, boilingPoint: 327, volatilityIndex: 8, ifraCat: "restricted", ifraMaxConc: 5, odorProfile: "Animalic musk, warm, sensual", odorIntensity: 55, defaultLayer: "base", isFixative: true, warmth: 80, sweetness: 25, freshness: 5 },
  { id: "cashmeran", name: "Cashmeran", casNumber: "33704-61-9", category: "synthetic", functionalGroup: "ketone", molecularWeight: 206.32, vaporPressure: 0.005, boilingPoint: 261, volatilityIndex: 25, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Musky, woody, spicy-warm", odorIntensity: 35, defaultLayer: "base", isFixative: true, warmth: 65, sweetness: 40, freshness: 20 },
  { id: "cedryl-acetate", name: "Cedryl Acetate", casNumber: "77-54-3", category: "isolate", functionalGroup: "ester", molecularWeight: 264.40, vaporPressure: 0.0003, boilingPoint: 310, volatilityIndex: 12, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Woody, cedar, dry", odorIntensity: 40, defaultLayer: "base", isFixative: true, warmth: 45, sweetness: 15, freshness: 20 },
  { id: "vetiverol", name: "Vetiverol", casNumber: "89-88-3", category: "natural", functionalGroup: "alcohol", molecularWeight: 222.37, vaporPressure: 0.0002, boilingPoint: 300, volatilityIndex: 10, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Earthy, smoky, green-woody", odorIntensity: 55, defaultLayer: "base", isFixative: true, warmth: 50, sweetness: 10, freshness: 30 },
  { id: "benzyl-benzoate", name: "Benzyl Benzoate", casNumber: "120-51-4", category: "synthetic", functionalGroup: "ester", molecularWeight: 212.24, vaporPressure: 0.00002, boilingPoint: 323, volatilityIndex: 5, ifraCat: "unrestricted", ifraMaxConc: 100, odorProfile: "Faint balsamic, fixative", odorIntensity: 10, defaultLayer: "base", isFixative: true, warmth: 30, sweetness: 20, freshness: 10 },
];

// ═══════════════════════════════════════════════════════════
// INTERACTION DATASET — Known synergistic & antagonistic pairs
// ═══════════════════════════════════════════════════════════

export interface InteractionPair {
  ingredientA: string;
  ingredientB: string;
  type: "synergistic" | "antagonistic" | "enhancing" | "neutral";
  strength: number; // 0-100
  accordName?: string;
  notes?: string;
}

export const knownInteractions: InteractionPair[] = [
  // Classic accords
  { ingredientA: "linalool", ingredientB: "coumarin", type: "synergistic", strength: 92, accordName: "Fougère", notes: "Classic barbershop accord foundation" },
  { ingredientA: "citronellol", ingredientB: "geraniol", type: "synergistic", strength: 88, accordName: "Rose", notes: "Natural rose reconstruction" },
  { ingredientA: "vanillin", ingredientB: "coumarin", type: "synergistic", strength: 85, accordName: "Oriental", notes: "Warm gourmand base" },
  { ingredientA: "limonene", ingredientB: "linalool", type: "synergistic", strength: 80, accordName: "Cologne", notes: "Bright cologne opening" },
  { ingredientA: "hedione", ingredientB: "phenylethyl-alcohol", type: "synergistic", strength: 90, accordName: "Transparent Floral", notes: "Modern floral radiance" },
  { ingredientA: "iso-e-super", ingredientB: "ambroxan", type: "synergistic", strength: 95, accordName: "Molecular", notes: "Modern skin-scent signature" },
  { ingredientA: "eugenol", ingredientB: "cinnamaldehyde", type: "synergistic", strength: 82, accordName: "Spice", notes: "Warm spice accord" },
  { ingredientA: "santalol", ingredientB: "vanillin", type: "synergistic", strength: 87, accordName: "Creamy Wood", notes: "Rich sandalwood-vanilla base" },
  { ingredientA: "cashmeran", ingredientB: "iso-e-super", type: "synergistic", strength: 88, accordName: "Velvet Wood", notes: "Smooth woody base" },
  { ingredientA: "benzyl-acetate", ingredientB: "hedione", type: "synergistic", strength: 85, accordName: "Jasmine", notes: "White floral jasmine accord" },
  
  // Antagonistic pairs
  { ingredientA: "eucalyptol", ingredientB: "vanillin", type: "antagonistic", strength: 70, notes: "Camphoraceous clashes with sweet gourmand" },
  { ingredientA: "citral", ingredientB: "muscone", type: "antagonistic", strength: 65, notes: "Sharp citrus overwhelms delicate musk" },
  { ingredientA: "alpha-pinene", ingredientB: "ethyl-vanillin", type: "antagonistic", strength: 60, notes: "Resinous pine vs heavy vanilla" },
  { ingredientA: "dihydromyrcenol", ingredientB: "eugenol", type: "antagonistic", strength: 55, notes: "Metallic freshness vs warm spice" },
  { ingredientA: "cinnamaldehyde", ingredientB: "methyl-salicylate", type: "antagonistic", strength: 72, notes: "Both high intensity compete" },
  
  // Enhancing pairs
  { ingredientA: "benzyl-benzoate", ingredientB: "vanillin", type: "enhancing", strength: 78, notes: "Fixative extends vanilla longevity" },
  { ingredientA: "galaxolide", ingredientB: "hedione", type: "enhancing", strength: 75, notes: "Musk lifts floral transparency" },
  { ingredientA: "ambroxan", ingredientB: "linalool", type: "enhancing", strength: 80, notes: "Amber amplifies floral projection" },
  { ingredientA: "iso-e-super", ingredientB: "damascenone", type: "enhancing", strength: 85, notes: "Wood base deepens rose heart" },
  { ingredientA: "cedryl-acetate", ingredientB: "vetiverol", type: "enhancing", strength: 82, notes: "Cedar strengthens vetiver depth" },
];

// ═══════════════════════════════════════════════════════════
// IFRA RESTRICTION REFERENCE DATA (51st Amendment)
// ═══════════════════════════════════════════════════════════

export interface IFRARule {
  ingredientId: string;
  productCategory: string;
  maxConcentration: number;
  amendment: string;
}

export const ifraRules: IFRARule[] = [
  { ingredientId: "citral", productCategory: "fine_fragrance", maxConcentration: 5.0, amendment: "51st" },
  { ingredientId: "citral", productCategory: "body_lotion", maxConcentration: 0.6, amendment: "51st" },
  { ingredientId: "eugenol", productCategory: "fine_fragrance", maxConcentration: 5.0, amendment: "51st" },
  { ingredientId: "eugenol", productCategory: "body_lotion", maxConcentration: 0.5, amendment: "51st" },
  { ingredientId: "coumarin", productCategory: "fine_fragrance", maxConcentration: 2.0, amendment: "51st" },
  { ingredientId: "coumarin", productCategory: "body_lotion", maxConcentration: 0.8, amendment: "51st" },
  { ingredientId: "cinnamaldehyde", productCategory: "fine_fragrance", maxConcentration: 2.0, amendment: "51st" },
  { ingredientId: "cinnamaldehyde", productCategory: "body_lotion", maxConcentration: 0.05, amendment: "51st" },
  { ingredientId: "linalool", productCategory: "fine_fragrance", maxConcentration: 25.0, amendment: "51st" },
  { ingredientId: "citronellol", productCategory: "fine_fragrance", maxConcentration: 30.0, amendment: "51st" },
  { ingredientId: "geraniol", productCategory: "fine_fragrance", maxConcentration: 20.0, amendment: "51st" },
  { ingredientId: "ionone-alpha", productCategory: "fine_fragrance", maxConcentration: 10.0, amendment: "51st" },
  { ingredientId: "muscone", productCategory: "fine_fragrance", maxConcentration: 5.0, amendment: "51st" },
  { ingredientId: "limonene", productCategory: "fine_fragrance", maxConcentration: 80.0, amendment: "51st" },
  { ingredientId: "alpha-pinene", productCategory: "fine_fragrance", maxConcentration: 50.0, amendment: "51st" },
  { ingredientId: "aldehyde-c11", productCategory: "fine_fragrance", maxConcentration: 3.0, amendment: "51st" },
  { ingredientId: "methyl-salicylate", productCategory: "fine_fragrance", maxConcentration: 5.0, amendment: "51st" },
  { ingredientId: "galaxolide", productCategory: "fine_fragrance", maxConcentration: 15.0, amendment: "51st" },
];
