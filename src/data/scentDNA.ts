export interface ScentArchetype {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  traits: string[];
  occasions: string[];
  color: string;
  families: string[];
}

export const scentArchetypes: ScentArchetype[] = [
  {
    id: "magnetic-minimalist",
    name: "Magnetic Minimalist",
    emoji: "🧲",
    tagline: "Less is more. You speak in whispers that command attention.",
    traits: ["Fresh", "Elegant", "Controlled"],
    occasions: ["Business", "Daytime", "Summer"],
    color: "hsl(185 80% 55%)",
    families: ["citrus", "aquatic", "green"],
  },
  {
    id: "velvet-provocateur",
    name: "Velvet Provocateur",
    emoji: "🖤",
    tagline: "You don't enter a room — you change its atmosphere.",
    traits: ["Sensual", "Bold", "Mysterious"],
    occasions: ["Evening", "Date Night", "Winter"],
    color: "hsl(265 60% 50%)",
    families: ["oriental", "gourmand", "spicy"],
  },
  {
    id: "golden-alchemist",
    name: "Golden Alchemist",
    emoji: "⚗️",
    tagline: "You blend tradition and innovation into pure gold.",
    traits: ["Warm", "Complex", "Refined"],
    occasions: ["All Seasons", "Signature", "Creative"],
    color: "hsl(35 90% 55%)",
    families: ["woody", "amber", "spicy"],
  },
  {
    id: "ethereal-dreamer",
    name: "Ethereal Dreamer",
    emoji: "🌙",
    tagline: "Reality is too small for your imagination.",
    traits: ["Romantic", "Airy", "Enchanting"],
    occasions: ["Spring", "Romance", "Art Events"],
    color: "hsl(330 60% 55%)",
    families: ["floral", "powdery", "musk"],
  },
  {
    id: "wild-explorer",
    name: "Wild Explorer",
    emoji: "🌿",
    tagline: "Every scent is a new territory to conquer.",
    traits: ["Adventurous", "Natural", "Free-Spirited"],
    occasions: ["Outdoor", "Travel", "Casual"],
    color: "hsl(130 50% 45%)",
    families: ["green", "aromatic", "woody"],
  },
  {
    id: "dark-sovereign",
    name: "Dark Sovereign",
    emoji: "👑",
    tagline: "Power is not given — it's worn.",
    traits: ["Commanding", "Intense", "Regal"],
    occasions: ["Power Moves", "Gala", "Night"],
    color: "hsl(15 80% 50%)",
    families: ["leather", "oud", "incense"],
  },
];

// Note family mapping for DNA analysis
export const noteFamilyMap: Record<string, string> = {
  bergamot: "citrus", "lemon-zest": "citrus", grapefruit: "citrus", "blood-orange": "citrus",
  mandarin: "citrus", lime: "citrus", yuzu: "citrus", tangerine: "citrus", "sparkling-citrus": "citrus",
  "green-apple": "green", pear: "green", mint: "green", eucalyptus: "green", "fig-leaf": "green",
  basil: "green", "green-tea": "green", petitgrain: "green", juniper: "green",
  "pink-pepper": "spicy", cardamom: "spicy", ginger: "spicy", saffron: "spicy",
  "black-pepper": "spicy", "star-anise": "spicy", "sichuan-pepper": "spicy", cinnamon: "spicy",
  clove: "spicy", nutmeg: "spicy",
  rose: "floral", jasmine: "floral", iris: "floral", lavender: "floral", violet: "floral",
  lilac: "floral", peony: "floral", tuberose: "floral", "white-florals": "floral",
  magnolia: "floral", "orange-blossom": "floral", "ylang-ylang": "floral", orchid: "floral",
  freesia: "floral", gardenia: "floral", "rose-absolute": "floral", "jasmine-sambac": "floral",
  mimosa: "floral", osmanthus: "floral", geranium: "floral", heliotrope: "floral",
  vanilla: "gourmand", "tonka-bean": "gourmand", cocoa: "gourmand", caramel: "gourmand",
  coffee: "gourmand", praline: "gourmand", honey: "gourmand", almond: "gourmand",
  "dark-cherry": "gourmand", raspberry: "gourmand", plum: "gourmand",
  sandalwood: "woody", cedarwood: "woody", vetiver: "woody", patchouli: "woody",
  "cashmere-wood": "woody", "guaiac-wood": "woody", "teak-wood": "woody",
  oud: "oriental", amber: "oriental", benzoin: "oriental", "smoky-incense": "oriental",
  myrrh: "oriental", labdanum: "oriental", frankincense: "oriental", copal: "oriental",
  musk: "musk", "black-musk": "musk", ambergris: "musk", "musk-deer": "musk",
  leather: "leather", suede: "leather", "birch-tar": "leather", castoreum: "leather",
  tobacco: "leather",
  "black-currant": "fruity", lychee: "fruity", watermelon: "fruity",
  neroli: "citrus", aldehydes: "powdery", "iris-butter": "powdery", "oak-moss": "green",
  ozonic: "aquatic", "sea-salt": "aquatic", "black-tea": "aromatic", davana: "aromatic",
  elemi: "aromatic",
};

export function analyzeBlendDNA(noteIds: string[]): {
  dominantFamilies: { family: string; percentage: number }[];
  archetype: ScentArchetype;
  intensityPreference: "Light" | "Moderate" | "Bold";
  projectionStyle: string;
} {
  const familyCounts: Record<string, number> = {};
  noteIds.forEach((id) => {
    const family = noteFamilyMap[id] || "other";
    familyCounts[family] = (familyCounts[family] || 0) + 1;
  });

  const total = noteIds.length || 1;
  const sorted = Object.entries(familyCounts)
    .map(([family, count]) => ({ family, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percentage - a.percentage);

  const topFamilies = sorted.slice(0, 3).map((s) => s.family);

  // Find best matching archetype
  let bestMatch = scentArchetypes[0];
  let bestScore = 0;
  scentArchetypes.forEach((arch) => {
    const score = arch.families.reduce((acc, f) => acc + (topFamilies.includes(f) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = arch;
    }
  });

  const hasBase = noteIds.some((id) => {
    const fam = noteFamilyMap[id];
    return ["oriental", "woody", "leather", "gourmand"].includes(fam || "");
  });
  const hasTop = noteIds.some((id) => {
    const fam = noteFamilyMap[id];
    return ["citrus", "green", "aquatic"].includes(fam || "");
  });

  const intensityPreference = noteIds.length > 6 ? "Bold" : noteIds.length > 3 ? "Moderate" : "Light";
  const projectionStyle = hasBase && !hasTop ? "Close & Intimate" : hasTop && !hasBase ? "Bright & Radiant" : "Balanced Sillage";

  return {
    dominantFamilies: sorted.slice(0, 4),
    archetype: bestMatch,
    intensityPreference,
    projectionStyle,
  };
}
