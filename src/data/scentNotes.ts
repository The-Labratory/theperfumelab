export interface Note {
  id: string;
  name: string;
  emoji: string;
  layer: "top" | "heart" | "base";
  color: string;
}

export const availableNotes: Note[] = [
  // ══════════════════════ TOP NOTES (24) ══════════════════════
  { id: "bergamot", name: "Bergamot", emoji: "🍊", layer: "top", color: "hsl(35 90% 55%)" },
  { id: "lemon-zest", name: "Lemon Zest", emoji: "🍋", layer: "top", color: "hsl(50 90% 55%)" },
  { id: "pink-pepper", name: "Pink Pepper", emoji: "🌶️", layer: "top", color: "hsl(350 70% 55%)" },
  { id: "grapefruit", name: "Grapefruit", emoji: "🍈", layer: "top", color: "hsl(15 80% 55%)" },
  { id: "blood-orange", name: "Blood Orange", emoji: "🟠", layer: "top", color: "hsl(20 85% 50%)" },
  { id: "green-apple", name: "Green Apple", emoji: "🍏", layer: "top", color: "hsl(100 60% 50%)" },
  { id: "pear", name: "Pear", emoji: "🍐", layer: "top", color: "hsl(80 50% 55%)" },
  { id: "black-currant", name: "Black Currant", emoji: "🫐", layer: "top", color: "hsl(280 50% 35%)" },
  { id: "sparkling-citrus", name: "Sparkling Citrus", emoji: "✨", layer: "top", color: "hsl(55 85% 60%)" },
  { id: "mandarin", name: "Mandarin", emoji: "🍊", layer: "top", color: "hsl(25 90% 55%)" },
  { id: "cardamom", name: "Cardamom", emoji: "🫚", layer: "top", color: "hsl(40 40% 45%)" },
  { id: "ginger", name: "Ginger", emoji: "🫚", layer: "top", color: "hsl(38 60% 50%)" },
  { id: "saffron", name: "Saffron", emoji: "🌾", layer: "top", color: "hsl(30 90% 45%)" },
  { id: "mint", name: "Mint", emoji: "🌿", layer: "top", color: "hsl(150 60% 45%)" },
  { id: "eucalyptus", name: "Eucalyptus", emoji: "🍃", layer: "top", color: "hsl(160 40% 50%)" },
  { id: "aldehydes", name: "Aldehydes", emoji: "💠", layer: "top", color: "hsl(200 30% 70%)" },
  { id: "lime", name: "Lime", emoji: "🟢", layer: "top", color: "hsl(120 70% 45%)" },
  { id: "yuzu", name: "Yuzu", emoji: "🍋", layer: "top", color: "hsl(48 80% 50%)" },
  { id: "neroli", name: "Neroli", emoji: "🌸", layer: "top", color: "hsl(35 60% 70%)" },
  { id: "petitgrain", name: "Petitgrain", emoji: "🌱", layer: "top", color: "hsl(110 40% 45%)" },
  { id: "juniper", name: "Juniper", emoji: "🫒", layer: "top", color: "hsl(170 35% 40%)" },
  { id: "basil", name: "Basil", emoji: "🌿", layer: "top", color: "hsl(130 50% 35%)" },
  { id: "watermelon", name: "Watermelon", emoji: "🍉", layer: "top", color: "hsl(350 65% 50%)" },
  { id: "fig-leaf", name: "Fig Leaf", emoji: "🍃", layer: "top", color: "hsl(95 45% 40%)" },

  // ══════════════════════ HEART NOTES (24) ══════════════════════
  { id: "rose", name: "Rose", emoji: "🌹", layer: "heart", color: "hsl(340 70% 55%)" },
  { id: "jasmine", name: "Jasmine", emoji: "🌼", layer: "heart", color: "hsl(45 80% 70%)" },
  { id: "iris", name: "Iris", emoji: "💜", layer: "heart", color: "hsl(265 60% 55%)" },
  { id: "lavender", name: "Lavender", emoji: "💐", layer: "heart", color: "hsl(265 40% 60%)" },
  { id: "violet", name: "Violet", emoji: "🪻", layer: "heart", color: "hsl(275 55% 50%)" },
  { id: "lilac", name: "Lilac", emoji: "🌸", layer: "heart", color: "hsl(280 45% 65%)" },
  { id: "peony", name: "Peony", emoji: "🌺", layer: "heart", color: "hsl(330 60% 65%)" },
  { id: "tuberose", name: "Tuberose", emoji: "🤍", layer: "heart", color: "hsl(0 0% 90%)" },
  { id: "white-florals", name: "White Florals", emoji: "🕊️", layer: "heart", color: "hsl(40 30% 85%)" },
  { id: "coffee", name: "Coffee", emoji: "☕", layer: "heart", color: "hsl(25 60% 25%)" },
  { id: "cinnamon", name: "Cinnamon", emoji: "🫕", layer: "heart", color: "hsl(15 70% 40%)" },
  { id: "nutmeg", name: "Nutmeg", emoji: "🥜", layer: "heart", color: "hsl(30 50% 40%)" },
  { id: "geranium", name: "Geranium", emoji: "🌷", layer: "heart", color: "hsl(350 50% 55%)" },
  { id: "magnolia", name: "Magnolia", emoji: "🌸", layer: "heart", color: "hsl(320 40% 75%)" },
  { id: "orange-blossom", name: "Orange Blossom", emoji: "🌼", layer: "heart", color: "hsl(30 70% 65%)" },
  { id: "ylang-ylang", name: "Ylang-Ylang", emoji: "🌻", layer: "heart", color: "hsl(50 65% 55%)" },
  { id: "orchid", name: "Orchid", emoji: "🌺", layer: "heart", color: "hsl(290 50% 55%)" },
  { id: "freesia", name: "Freesia", emoji: "🌷", layer: "heart", color: "hsl(55 60% 65%)" },
  { id: "heliotrope", name: "Heliotrope", emoji: "💜", layer: "heart", color: "hsl(285 45% 50%)" },
  { id: "black-tea", name: "Black Tea", emoji: "🍵", layer: "heart", color: "hsl(20 45% 30%)" },
  { id: "praline", name: "Praline", emoji: "🍬", layer: "heart", color: "hsl(30 55% 45%)" },
  { id: "raspberry", name: "Raspberry", emoji: "🫐", layer: "heart", color: "hsl(335 65% 45%)" },
  { id: "clove", name: "Clove", emoji: "🫚", layer: "heart", color: "hsl(15 55% 30%)" },
  { id: "honey", name: "Honey", emoji: "🍯", layer: "heart", color: "hsl(40 80% 50%)" },

  // ══════════════════════ BASE NOTES (24) ══════════════════════
  { id: "vanilla", name: "Vanilla", emoji: "🍦", layer: "base", color: "hsl(35 70% 65%)" },
  { id: "sandalwood", name: "Sandalwood", emoji: "🪵", layer: "base", color: "hsl(25 50% 40%)" },
  { id: "musk", name: "White Musk", emoji: "🤍", layer: "base", color: "hsl(0 0% 80%)" },
  { id: "amber", name: "Amber", emoji: "🔶", layer: "base", color: "hsl(35 90% 45%)" },
  { id: "patchouli", name: "Patchouli", emoji: "🌿", layer: "base", color: "hsl(120 30% 30%)" },
  { id: "cedarwood", name: "Cedarwood", emoji: "🌲", layer: "base", color: "hsl(20 40% 35%)" },
  { id: "vetiver", name: "Vetiver", emoji: "🌾", layer: "base", color: "hsl(90 30% 35%)" },
  { id: "oud", name: "Oud", emoji: "🏺", layer: "base", color: "hsl(15 50% 25%)" },
  { id: "tonka-bean", name: "Tonka Bean", emoji: "🫘", layer: "base", color: "hsl(30 55% 35%)" },
  { id: "benzoin", name: "Benzoin", emoji: "🍯", layer: "base", color: "hsl(35 65% 40%)" },
  { id: "cashmere-wood", name: "Cashmere Wood", emoji: "🧶", layer: "base", color: "hsl(20 25% 50%)" },
  { id: "dark-cherry", name: "Dark Cherry", emoji: "🍒", layer: "base", color: "hsl(350 60% 35%)" },
  { id: "almond", name: "Almond", emoji: "🌰", layer: "base", color: "hsl(30 40% 50%)" },
  { id: "cocoa", name: "Cocoa", emoji: "🍫", layer: "base", color: "hsl(15 50% 25%)" },
  { id: "leather", name: "Leather", emoji: "🧳", layer: "base", color: "hsl(20 35% 30%)" },
  { id: "smoky-incense", name: "Smoky Incense", emoji: "🕯️", layer: "base", color: "hsl(0 10% 35%)" },
  { id: "black-musk", name: "Black Musk", emoji: "🖤", layer: "base", color: "hsl(0 0% 15%)" },
  { id: "ambergris", name: "Ambergris", emoji: "🐚", layer: "base", color: "hsl(35 40% 55%)" },
  { id: "myrrh", name: "Myrrh", emoji: "🪨", layer: "base", color: "hsl(25 35% 30%)" },
  { id: "labdanum", name: "Labdanum", emoji: "🍂", layer: "base", color: "hsl(20 50% 28%)" },
  { id: "guaiac-wood", name: "Guaiac Wood", emoji: "🪵", layer: "base", color: "hsl(10 30% 35%)" },
  { id: "caramel", name: "Caramel", emoji: "🍮", layer: "base", color: "hsl(30 70% 40%)" },
  { id: "tobacco", name: "Tobacco", emoji: "🍂", layer: "base", color: "hsl(25 45% 28%)" },
  { id: "suede", name: "Suede", emoji: "🤎", layer: "base", color: "hsl(20 30% 40%)" },
];

export interface Concentration {
  id: string;
  name: string;
  percentage: string;
  longevity: string;
  description: string;
}

export const concentrations: Concentration[] = [
  { id: "parfum", name: "Parfum", percentage: "50%", longevity: "24 hrs", description: "Maximum intensity & projection" },
  { id: "edp", name: "Eau de Parfum", percentage: "30%", longevity: "14 hrs", description: "Rich & long-lasting" },
  { id: "edt", name: "Eau de Toilette", percentage: "15%", longevity: "8 hrs", description: "Light & everyday wear" },
];
