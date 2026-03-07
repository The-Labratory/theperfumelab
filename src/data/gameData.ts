/**
 * The Perfumer's Journey — Game Data
 *
 * All facts, terminology, and challenges are sourced from established
 * perfumery references and industry standards:
 *
 * BOOKS & AUTHORS:
 * - Jean Carles, "A Method of Creation in Perfumery" (Givaudan, 1961)
 *   → Olfactory pyramid concept, top/heart/base classification, accord theory
 * - Edmond Roudnitska, "The Art of Perfumery" (1977)
 *   → Philosophy of fragrance composition, the role of the perfumer as artist
 * - Jean-Claude Ellena, "Perfume: The Alchemy of Scent" (2011)
 *   → Modern minimalist composition, the concept of "less is more" in formulation
 * - Luca Turin & Tania Sanchez, "Perfumes: The Guide" (2008)
 *   → Scent family classification, critical evaluation methodology
 * - Steffen Arctander, "Perfume and Flavor Materials of Natural Origin" (1960)
 *   → Comprehensive raw material database, orris/iris distillation timelines
 *
 * INDUSTRY STANDARDS:
 * - IFRA (International Fragrance Association) Standards, 51st Amendment
 *   → Concentration limits, allergen labeling, oakmoss restrictions
 * - The Fragrance Foundation educational materials
 * - Givaudan Perfumery School curriculum (Jean Carles Method)
 *
 * HISTORICAL REFERENCES:
 * - François Coty, "Chypre" (1917) — founding the chypre family
 * - Houbigant, "Fougère Royale" (1882) — founding the fougère family
 * - Guerlain, "Jicky" (1889) — first modern perfume using synthetic coumarin
 * - Guerlain, "Mitsouko" (1919) — iconic chypre with peach aldehyde
 * - Ernest Beaux, "Chanel N°5" (1921) — revolutionary use of aldehydes
 */

export interface GameNote {
  name: string;
  emoji: string;
  family: string;
  layer: "top" | "heart" | "base";
}

export interface GameChallenge {
  type: "identify" | "blend" | "match" | "story";
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  hint?: string;
  source?: string; // attribution for the fact
  xpReward: number;
}

export interface GameChapter {
  id: number;
  title: string;
  subtitle: string;
  story: string;
  icon: string;
  rankUnlock: string;
  challenges: GameChallenge[];
  unlockXP: number;
}

export const PERFUMER_RANKS = [
  { name: "Novice", minXP: 0, icon: "🌱", color: "hsl(var(--muted-foreground))" },
  { name: "Apprentice", minXP: 100, icon: "🧪", color: "hsl(var(--primary))" },
  { name: "Artisan", minXP: 300, icon: "⚗️", color: "hsl(var(--secondary))" },
  { name: "Composer", minXP: 600, icon: "🎼", color: "hsl(var(--accent))" },
  { name: "Master Perfumer", minXP: 1000, icon: "👑", color: "hsl(45, 93%, 47%)" },
  { name: "Grand Nez", minXP: 1500, icon: "✨", color: "hsl(300, 70%, 60%)" },
  { name: "Platinum Nez", minXP: 2100, icon: "💎", color: "hsl(220, 90%, 72%)" },
];

export const GAME_CHAPTERS: GameChapter[] = [
  // ═══════════════════════════════════════════════════════════
  // CHAPTER 1 — The Jean Carles Method: Learning the Alphabet
  // Based on Jean Carles' training methodology at Givaudan
  // ═══════════════════════════════════════════════════════════
  {
    id: 1,
    title: "The First Breath",
    subtitle: "Learn the olfactory alphabet — the Jean Carles Method",
    story: "In 1946, perfumer Jean Carles revolutionized fragrance education at Givaudan by creating a systematic method to train the nose. He believed every perfumer must first memorize individual raw materials — like a musician learning scales — before they can compose. You begin your journey the same way: one scent at a time.",
    icon: "🌬️",
    rankUnlock: "Novice",
    unlockXP: 0,
    challenges: [
      {
        type: "identify",
        question: "Bergamot is a citrus fruit essential to perfumery. It gives Earl Grey tea its distinctive aroma and is cold-pressed from the rind of Citrus bergamia, grown almost exclusively in Calabria, Italy. In the olfactory pyramid, bergamot is classified as a:",
        options: ["Top note", "Heart note", "Base note", "Fixative"],
        correctAnswer: "Top note",
        hint: "Jean Carles classified notes by volatility. Citrus oils have small, light molecules that evaporate within 15–30 minutes — making them top notes, the first impression of any fragrance.",
        source: "Jean Carles, 'A Method of Creation in Perfumery' (1961)",
        xpReward: 25,
      },
      {
        type: "story",
        question: "The olfactory pyramid — top, heart, and base — was formalized by Jean Carles at Givaudan to teach apprentice perfumers how a fragrance unfolds over time. What determines which 'layer' a raw material belongs to?",
        options: [
          "Its color and appearance",
          "The volatility (evaporation speed) of its molecules",
          "The country it comes from",
          "How expensive it is",
        ],
        correctAnswer: "The volatility (evaporation speed) of its molecules",
        hint: "Molecular weight and vapor pressure determine how quickly a substance evaporates. Light molecules (citrus, herbs) evaporate fast = top notes. Heavy molecules (woods, resins) linger for hours = base notes.",
        source: "Jean Carles, Givaudan Perfumery School curriculum",
        xpReward: 30,
      },
      {
        type: "identify",
        question: "Rosa damascena (Damask Rose), primarily cultivated in Bulgaria's Rose Valley and Grasse, France, requires approximately 5,000 kg of petals to produce just 1 kg of rose absolute. In the fragrance pyramid, rose is a:",
        options: ["Top note", "Heart note", "Base note"],
        correctAnswer: "Heart note",
        hint: "Heart notes (also called 'middle notes') form the body of a fragrance. They emerge after top notes fade (15–30 min) and last 2–4 hours. Florals like rose, jasmine, and ylang-ylang are quintessential heart notes.",
        source: "Steffen Arctander, 'Perfume and Flavor Materials of Natural Origin' (1960)",
        xpReward: 25,
      },
      {
        type: "match",
        question: "Match each raw material to its correct layer in the olfactory pyramid: Bergamot = ___, Rose = ___, Sandalwood = ___.",
        options: ["Top, Heart, Base", "Heart, Top, Base", "Base, Heart, Top", "Top, Base, Heart"],
        correctAnswer: "Top, Heart, Base",
        hint: "Bergamot (citrus) evaporates in minutes → top. Rose (floral) blooms for hours → heart. Santalum album (Mysore sandalwood) can persist for 8+ hours on skin → base. This hierarchy follows molecular weight: ~136 Da (bergamot) → ~256 Da (rose) → ~220+ Da complex sesquiterpenes (sandalwood).",
        source: "Jean Carles Method; molecular data from Arctander (1960)",
        xpReward: 30,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CHAPTER 2 — The Great Olfactory Families
  // Based on the Société Française des Parfumeurs classification
  // and Michael Edwards' Fragrance Wheel
  // ═══════════════════════════════════════════════════════════
  {
    id: 2,
    title: "The Scent Families",
    subtitle: "The seven great olfactory families",
    story: "In 1983, fragrance taxonomist Michael Edwards created the 'Fragrance Wheel' — a circular classification system that organized all perfumes into families: Floral, Oriental, Woody, Fresh (Citrus, Green, Aquatic), Fougère, and Chypre. Understanding these families is like learning the grammar of scent — it gives you the vocabulary to describe, analyze, and eventually compose.",
    icon: "🌸",
    rankUnlock: "Apprentice",
    unlockXP: 100,
    challenges: [
      {
        type: "identify",
        question: "Oud (Agarwood) is formed when Aquilaria trees are infected by Phialophora parasitica mold, producing a dark, fragrant resin over decades. Traded for up to $100,000/kg, it is one of the most expensive raw materials in perfumery. Which olfactory family does oud belong to?",
        options: ["Fresh/Citrus", "Floral", "Oriental/Amber", "Green"],
        correctAnswer: "Oriental/Amber",
        hint: "The Oriental (now often called 'Amber') family is characterized by warmth, richness, and sensuality. Key materials include oud, amber, incense (olibanum), benzoin, and vanilla. The name 'Oriental' references the historic spice trade routes.",
        source: "Michael Edwards, Fragrance Wheel classification; Arctander (1960) on Aquilaria",
        xpReward: 30,
      },
      {
        type: "story",
        question: "'Fougère Royale' by Houbigant (1882), created by perfumer Paul Parquet, is considered the first modern fougère fragrance. The word 'fougère' is French for:",
        options: ["Flower", "Fern", "Fire", "Forest"],
        correctAnswer: "Fern",
        hint: "Ironically, ferns have almost no scent. The 'fougère' accord is an abstract representation of a lush, ferny forest floor, built on a lavender-coumarin-oakmoss skeleton. Coumarin (first synthesized in 1868 by William Perkin) was one of the first synthetic materials used in fine perfumery.",
        source: "Paul Parquet, Houbigant (1882); Luca Turin & Tania Sanchez, 'Perfumes: The Guide'",
        xpReward: 35,
      },
      {
        type: "match",
        question: "Classify these raw materials: Lemon and Bergamot are ___ notes, while Benzoin and Vanilla are ___ notes.",
        options: ["Fresh, Oriental", "Oriental, Fresh", "Both Fresh", "Both Oriental"],
        correctAnswer: "Fresh, Oriental",
        hint: "Fresh/Citrus materials are volatile, bright, and clean (they evaporate quickly). Oriental materials are heavy, warm, balsamic, and sweet — they persist on skin and create a sense of warmth and intimacy.",
        source: "Michael Edwards, Fragrance Wheel; Société Française des Parfumeurs classification",
        xpReward: 30,
      },
      {
        type: "story",
        question: "Guerlain's 'Jicky' (1889), created by Aimé Guerlain, is widely considered the first 'modern' perfume. What made it revolutionary?",
        options: [
          "It was the first perfume sold in a glass bottle",
          "It was the first to combine natural essences with synthetic materials (coumarin & vanillin)",
          "It was the first perfume marketed to men",
          "It was the first perfume using alcohol as a solvent",
        ],
        correctAnswer: "It was the first to combine natural essences with synthetic materials (coumarin & vanillin)",
        hint: "Before Jicky, perfumes were essentially soliflores (single-flower scents) made purely from naturals. Aimé Guerlain blended lavender with synthetic coumarin (hay-like) and vanillin, creating an abstract composition that didn't mimic nature — it transcended it. This was the birth of modern perfumery.",
        source: "Guerlain archives; Luca Turin, 'The Secret of Scent' (2006)",
        xpReward: 35,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CHAPTER 3 — The Art of the Accord
  // Based on Jean Carles' accord training and Edmond Roudnitska
  // ═══════════════════════════════════════════════════════════
  {
    id: 3,
    title: "The Art of Blending",
    subtitle: "Accords — the chords of perfumery",
    story: "Edmond Roudnitska, in his 1977 essay 'The Art of Perfumery,' wrote: 'A perfumer who cannot create accords is like a musician who cannot play chords.' An accord is a blend of 2–4 raw materials that fuse into a new, unified scent — greater than the sum of its parts. Jean Carles' method teaches students to master accords by pairing materials systematically: first harmonious pairs, then contrasting ones.",
    icon: "⚗️",
    rankUnlock: "Artisan",
    unlockXP: 300,
    challenges: [
      {
        type: "blend",
        question: "The classic 'Hesperidia' accord (named after the Hesperides of Greek mythology — nymphs who tended golden citrus gardens) combines citrus oils for a bright, sparkling opening. Which combination creates an authentic hesperidia?",
        options: [
          "Bergamot + Lemon + Neroli (orange blossom)",
          "Patchouli + Oud + Musk",
          "Rose + Jasmine + Tuberose",
          "Vanilla + Tonka Bean + Benzoin",
        ],
        correctAnswer: "Bergamot + Lemon + Neroli (orange blossom)",
        hint: "Hesperidia accords use citrus oils from the Rutaceae family. Neroli (Citrus aurantium flower distillate) bridges citrus freshness into the floral heart. The name 'Eau de Cologne' originally described this type of citrus-heavy composition — pioneered by Giovanni Maria Farina in Cologne, Germany (1709).",
        source: "Jean Carles accord methodology; Farina, 'Eau de Cologne' (1709)",
        xpReward: 35,
      },
      {
        type: "story",
        question: "When two fragrance materials enhance each other — creating a scent that neither could produce alone — this is called:",
        options: ["Synergy", "Harmony", "Both terms are used in perfumery"],
        correctAnswer: "Both terms are used in perfumery",
        hint: "Roudnitska distinguished between 'harmony' (similar materials blending smoothly, like different musks) and 'synergy' (contrasting materials creating unexpected beauty, like rose + oud). Both are essential compositional techniques.",
        source: "Edmond Roudnitska, 'The Art of Perfumery' (1977)",
        xpReward: 25,
      },
      {
        type: "blend",
        question: "A 'gourmand' accord — a term coined by perfumer Thierry Wasser (Guerlain) — creates edible, dessert-like warmth. Which trio best anchors a gourmand base?",
        options: [
          "Vanilla + Tonka Bean + Benzoin",
          "Lemon + Basil + Mint",
          "Rose + Iris + Peony",
        ],
        correctAnswer: "Vanilla + Tonka Bean + Benzoin",
        hint: "Tonka bean contains coumarin (the same molecule that makes hay smell sweet). Benzoin resin (from Styrax trees in Laos/Sumatra) adds a warm, balsamic sweetness. Together with vanilla (Vanilla planifolia), they create the 'edible' warmth characteristic of gourmand fragrances — a trend popularized by Thierry Mugler's 'Angel' (1992).",
        source: "Thierry Mugler 'Angel' (1992, perfumer Olivier Cresp); Arctander on benzoin",
        xpReward: 35,
      },
      {
        type: "identify",
        question: "A 'fixative' is a low-volatility ingredient that slows the evaporation of lighter notes, extending a fragrance's longevity. Which of these is a classic fixative material?",
        options: ["Lemon (Citrus limon)", "Musk (macrocyclic musks)", "Bergamot", "Peppermint"],
        correctAnswer: "Musk (macrocyclic musks)",
        hint: "Natural musk was historically derived from the musk deer (Moschus moschiferus), now protected by CITES. Modern perfumery uses synthetic macrocyclic musks like Habanolide® or Muscenone — large molecules (MW 238–268 Da) that evaporate extremely slowly, 'fixing' the fragrance to skin for 8+ hours.",
        source: "Arctander (1960); CITES Appendix I; Firmenich research on macrocyclic musks",
        xpReward: 30,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CHAPTER 4 — The Master's Palette: Rare Materials & History
  // Based on Arctander, IFRA standards, and industry knowledge
  // ═══════════════════════════════════════════════════════════
  {
    id: 4,
    title: "The Composer's Palette",
    subtitle: "Rare materials, industry standards, and the science of scent",
    story: "Jean-Claude Ellena, house perfumer for Hermès (2004–2016), wrote: 'The perfumer's palette is not infinite — it is around 3,000 materials. The art is in the editing.' You now study the rarest and most regulated ingredients: orris butter from iris roots aged 5 years, oakmoss restricted by IFRA, and the centuries-old mystery of ambergris.",
    icon: "🎼",
    rankUnlock: "Composer",
    unlockXP: 600,
    challenges: [
      {
        type: "identify",
        question: "Orris butter (Beurre d'Iris) costs $40,000–$100,000/kg and is one of the most expensive ingredients in perfumery. It comes from:",
        options: [
          "Orchid petals",
          "The dried rhizomes (roots) of Iris pallida, aged 3–5 years before distillation",
          "Lily of the Valley flowers",
          "Tulip bulbs",
        ],
        correctAnswer: "The dried rhizomes (roots) of Iris pallida, aged 3–5 years before distillation",
        hint: "Iris pallida roots are harvested in Tuscany (near Florence), then dried for 3–5 years. During aging, lipids in the root oxidize into irones — the molecules responsible for the powdery, violet-like, lipstick-like scent. Only ~2 kg of orris butter is obtained from 1,000 kg of dried roots.",
        source: "Steffen Arctander, 'Perfume and Flavor Materials of Natural Origin' (1960); Iris cultivation data from Grasse",
        xpReward: 40,
      },
      {
        type: "story",
        question: "IFRA (International Fragrance Association) sets safety standards for the fragrance industry. In their 49th Amendment, they severely restricted oakmoss (Evernia prunastri) in perfumes. Why?",
        options: [
          "Oakmoss smells bad",
          "Oakmoss contains atranol and chloroatranol, identified as potent skin sensitizers (allergens)",
          "Oakmoss trees are endangered",
          "Oakmoss is too expensive to harvest",
        ],
        correctAnswer: "Oakmoss contains atranol and chloroatranol, identified as potent skin sensitizers (allergens)",
        hint: "IFRA restricted oakmoss absolute to 0.1% in fine fragrances. This forced reformulation of hundreds of classic chypre perfumes (like Guerlain's Mitsouko and Chanel's Cristalle). Some houses now use 'purified' oakmoss treated to remove atranol, but purists argue the character is lost.",
        source: "IFRA 49th Amendment (2020); EU Cosmetics Regulation EC 1223/2009",
        xpReward: 40,
      },
      {
        type: "blend",
        question: "The 'chypre' accord — named after the island of Cyprus — was formalized by François Coty in his 1917 perfume 'Chypre.' Which classic triptych defines this foundational structure?",
        options: [
          "Bergamot (top) + Oakmoss (heart/base) + Labdanum (base)",
          "Rose + Jasmine + Ylang-Ylang",
          "Lemon + Basil + Vetiver",
        ],
        correctAnswer: "Bergamot (top) + Oakmoss (heart/base) + Labdanum (base)",
        hint: "The chypre structure is: citrus freshness (bergamot) → mossy earthiness (oakmoss) → warm resinous amber (labdanum, from Cistus ladanifer shrubs). This contrast between bright and dark creates a sophisticated tension that defined 20th-century perfumery. Guerlain's Mitsouko (1919) added a peach aldehyde (C-14), becoming the definitive chypre.",
        source: "François Coty, 'Chypre' (1917); Jacques Guerlain, 'Mitsouko' (1919)",
        xpReward: 40,
      },
      {
        type: "identify",
        question: "Ambergris (French: 'ambre gris') has been used in perfumery for centuries. Where does natural ambergris originate?",
        options: [
          "A tree resin from Southeast Asia",
          "A waxy substance produced in the digestive system of sperm whales (Physeter macrocephalus)",
          "A mineral deposit found on coastlines",
          "A flower grown in Madagascar",
        ],
        correctAnswer: "A waxy substance produced in the digestive system of sperm whales (Physeter macrocephalus)",
        hint: "Ambergris is expelled by sperm whales and floats in the ocean for years or decades, undergoing photo-oxidation that transforms it from a dark, fecal-smelling mass into a prized, sweet, musky-marine material. The key odorant molecule is ambrein, which oxidizes to ambroxan — now synthesized commercially as Ambroxan® (Firmenich) and used in Dior Sauvage.",
        source: "Arctander (1960); Christopher Kemp, 'Floating Gold: A Natural (and Unnatural) History of Ambergris' (2012)",
        xpReward: 40,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CHAPTER 5 — The Master's Trial
  // Based on professional perfumery knowledge, concentration
  // standards, and composition philosophy
  // ═══════════════════════════════════════════════════════════
  {
    id: 5,
    title: "The Master's Trial",
    subtitle: "Prove you can think like a Master Perfumer",
    story: "Edmond Roudnitska wrote: 'The perfumer is an artist who works with the invisible.' You have memorized raw materials, studied families, mastered accords, and learned industry science. Now comes the final trial — composing with the intuition, knowledge, and creativity of a true Master Perfumer. No labels, no guides. Trust your nose and your training.",
    icon: "👑",
    rankUnlock: "Master Perfumer",
    unlockXP: 1000,
    challenges: [
      {
        type: "blend",
        question: "Fragrance concentrations are defined by the percentage of aromatic compounds dissolved in ethanol. An Eau de Parfum (EDP) typically contains:",
        options: ["1–3% (Eau Fraîche)", "15–20% aromatic compounds", "50–60%", "90–100% (pure oil)"],
        correctAnswer: "15–20% aromatic compounds",
        hint: "The concentration hierarchy: Eau Fraîche (1–3%) → Eau de Cologne (3–8%) → Eau de Toilette (8–15%) → Eau de Parfum (15–20%) → Extrait/Parfum (20–40%). Higher concentration = longer longevity and richer sillage, but also higher cost per bottle.",
        source: "IFRA concentration standards; French perfumery industry conventions",
        xpReward: 40,
      },
      {
        type: "identify",
        question: "Ernest Beaux's Chanel N°5 (1921) revolutionized perfumery by using a specific class of synthetic molecules at unprecedented levels, creating an abstract, non-naturalistic bouquet. What were these molecules?",
        options: [
          "Aldehydes (specifically C-10, C-11, and C-12 aliphatic aldehydes)",
          "Musks (nitro-musks)",
          "Ketones (ionones)",
          "Esters (fruit esters)",
        ],
        correctAnswer: "Aldehydes (specifically C-10, C-11, and C-12 aliphatic aldehydes)",
        hint: "Ernest Beaux used aliphatic aldehydes in doses 10x higher than anyone before. These waxy, soapy, sparkling molecules gave N°5 its famously 'abstract' quality — it smells like no single flower, but like all flowers at once. This was the birth of the 'aldehydic floral' family, arguably the most commercially successful fragrance category in history.",
        source: "Ernest Beaux, Chanel archives; Luca Turin, 'The Secret of Scent' (2006)",
        xpReward: 45,
      },
      {
        type: "story",
        question: "A client asks for a fragrance that 'smells like rain on warm earth.' The scientific term for this scent phenomenon — caused by geosmin produced by soil bacteria (Streptomyces) and plant oils released by raindrops — is:",
        options: ["Sillage", "Petrichor", "Drydown", "Accord"],
        correctAnswer: "Petrichor",
        hint: "The word 'petrichor' was coined in 1964 by Australian researchers Isabel Joy Bear and R.G. Thomas (from Greek: 'petra' = stone, 'ichor' = the ethereal fluid of the gods). The key molecule is geosmin, detectable by the human nose at concentrations as low as 5 parts per trillion — making it one of the most potent odorants known.",
        source: "Bear & Thomas, 'Nature of Argillaceous Odour', Nature 201 (1964); geosmin detection threshold data",
        xpReward: 45,
      },
      {
        type: "blend",
        question: "For your masterwork, you compose a 'white floral nocturne' — a fragrance evoking a moonlit garden of night-blooming flowers. Which combination captures this vision with authentic perfumery materials?",
        options: [
          "Tuberose absolute + Jasmine sambac + Oud + Ambroxan (synthetic ambergris)",
          "Lemon + Mint + Cucumber + Green Tea",
          "Cinnamon bark + Clove bud + Ginger + Pink Pepper",
        ],
        correctAnswer: "Tuberose absolute + Jasmine sambac + Oud + Ambroxan (synthetic ambergris)",
        hint: "Night-blooming white florals (tuberose, jasmine) produce indole — a molecule that smells both floral and animalic, giving them their narcotic, intoxicating quality. Jasmine sambac (used in Dior J'adore) is headier than Jasmine grandiflorum. Oud adds dark mystery, while Ambroxan provides a clean, amber radiance. This architecture follows the philosophy of Jean-Claude Ellena: 'Construct by contrast.'",
        source: "Jean-Claude Ellena, 'Perfume: The Alchemy of Scent' (2011); indole chemistry from Firmenich research",
        xpReward: 50,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // CHAPTER 6 — Grand Nez Finale: Professional-Level Mastery
  // Synthesis, GC-MS analysis, formulation economics, and
  // advanced regulatory knowledge from industry professionals
  // ═══════════════════════════════════════════════════════════
  {
    id: 6,
    title: "The Grand Nez Finale",
    subtitle: "Synthesis, analytics, and the business of scent",
    story: "You stand at the pinnacle. The title of 'Grand Nez' — French for 'Great Nose' — is reserved for the ~400 master perfumers working worldwide. To earn it, you must think beyond artistry: understand the chemistry of synthesis, read a gas chromatogram, calculate production economics, and navigate global regulations. This is where art meets science meets business. Complete this chapter to unlock Platinum Nez status and claim your reward: two complimentary 100ml custom fragrances, 50% personalized to your scent profile.",
    icon: "💎",
    rankUnlock: "Grand Nez",
    unlockXP: 1500,
    challenges: [
      {
        type: "story",
        question: "Gas Chromatography–Mass Spectrometry (GC-MS) is the gold standard for analyzing perfume compositions. In GC-MS, a fragrance sample is vaporized and carried through a capillary column. What separates the individual molecules?",
        options: [
          "Their color and density",
          "Their boiling points and polarity — lighter, less polar molecules elute first",
          "A human nose ranks them by smell",
          "An AI algorithm sorts them digitally",
        ],
        correctAnswer: "Their boiling points and polarity — lighter, less polar molecules elute first",
        hint: "In a GC column (typically 30m long, 0.25mm diameter), molecules separate based on their interaction with the stationary phase. A 'chromatogram' shows peaks at different retention times — each peak is a molecule. Mass spectrometry then identifies each molecule by fragmenting it and matching the mass pattern to a library (e.g., NIST/Wiley). This is how perfumers reverse-engineer competitor fragrances.",
        source: "Robert P. Adams, 'Identification of Essential Oil Components by GC/MS' (4th ed., 2007); NIST Mass Spectral Library",
        xpReward: 55,
      },
      {
        type: "blend",
        question: "Iso E Super (chemical name: 1-(2,3,8,8-tetramethyl-1,2,3,4,5,6,7,8-octahydronaphthalen-2-yl)ethanone) is one of the most widely used synthetic aroma chemicals in modern perfumery. Geza Schoen used it as virtually the sole ingredient in 'Molecule 01.' What is its olfactory character?",
        options: [
          "Sharp, pungent, like vinegar",
          "A velvety, cedarwood-like warmth with a 'skin scent' effect that seems to disappear and reappear",
          "Intensely sweet like cotton candy",
          "Fishy and marine",
        ],
        correctAnswer: "A velvety, cedarwood-like warmth with a 'skin scent' effect that seems to disappear and reappear",
        hint: "Iso E Super (IFF, MW 234 Da) has a unique 'phantom' quality — anosmia fluctuations mean it seems to come and go. It's used at 10–40% in modern compositions as a diffusion booster and woody base. Perfumers call it a 'volume pedal' — it amplifies everything around it without imposing its own character strongly.",
        source: "IFF (International Flavors & Fragrances) technical bulletin; Geza Schoen, Escentric Molecules (2006)",
        xpReward: 55,
      },
      {
        type: "story",
        question: "A niche perfume house produces a 100ml EDP with a raw material cost of €18, packaging €12, labor €10, and overhead €5. Using the industry-standard 4.5x luxury markup, what should the retail price be?",
        options: [
          "€45 (1x cost)",
          "€90 (2x cost)",
          "€202.50 (4.5x cost)",
          "€450 (10x cost)",
        ],
        correctAnswer: "€202.50 (4.5x cost)",
        hint: "Total COGS = €18 + €12 + €10 + €5 = €45. A 4.5x markup (standard for luxury niche) yields €202.50 retail. This gives a ~78% gross margin, which must cover distribution (15–25%), marketing (10–20%), R&D (5–10%), and net profit. Mass-market brands use 8–15x; luxury houses like Chanel or Louis Vuitton can command 20–30x on iconic products.",
        source: "Industry economics from The Fragrance Foundation; LVMH annual reports; niche brand financial benchmarks",
        xpReward: 60,
      },
      {
        type: "identify",
        question: "Headspace technology captures the scent of living flowers (or any object) without picking them. NASA originally developed this technique. How does it work?",
        options: [
          "A glass dome is placed over the subject, and volatile molecules are trapped on an adsorbent material (Tenax), then analyzed by GC-MS",
          "A microphone records the sound waves of the scent",
          "UV light is used to photograph the scent molecules",
          "The flower is frozen and ground into powder",
        ],
        correctAnswer: "A glass dome is placed over the subject, and volatile molecules are trapped on an adsorbent material (Tenax), then analyzed by GC-MS",
        hint: "Roman Kaiser (Givaudan) pioneered 'headspace' in perfumery in the 1970s–80s, capturing the scent of rare tropical flowers in situ. The trapped volatiles are thermally desorbed and analyzed by GC-MS, revealing the exact molecular fingerprint of a living flower. IFF's 'Living Flower Technology' and Firmenich's 'NaturePrint' use similar approaches.",
        source: "Roman Kaiser, 'Meaningful Scents Around the World' (Wiley, 2006); Givaudan headspace research",
        xpReward: 60,
      },
      {
        type: "blend",
        question: "EU Cosmetics Regulation (EC 1223/2009) requires 26 specific allergens to be listed on perfume labels if they exceed certain thresholds. What are the concentration thresholds that trigger mandatory labeling?",
        options: [
          "Any detectable amount must be listed",
          "0.001% in leave-on products, 0.01% in rinse-off products",
          "5% in all products",
          "Only if the customer requests it",
        ],
        correctAnswer: "0.001% in leave-on products, 0.01% in rinse-off products",
        hint: "The 26 EU-listed allergens include linalool, limonene, citral, geraniol, eugenol, and coumarin — all common in fine fragrances. At these thresholds (10 ppm leave-on, 100 ppm rinse-off), virtually every fine fragrance must list several allergens. IFRA's 51st Amendment (2024) further tightened some limits and added new restricted materials.",
        source: "EU Cosmetics Regulation EC 1223/2009, Annex III; IFRA 51st Amendment (2024); SCCS (Scientific Committee on Consumer Safety) opinions",
        xpReward: 60,
      },
      {
        type: "story",
        question: "Coumarin (C₉H₆O₂), first synthesized by William Perkin in 1868, has a characteristic hay-like, vanilla-adjacent scent. It is the backbone of the fougère accord and appears in ~40% of all marketed fragrances. From which natural source was coumarin first isolated?",
        options: [
          "Rose petals (Rosa damascena)",
          "Tonka beans (Dipteryx odorata) — discovered in 1820 by A. Vogel",
          "Sandalwood bark (Santalum album)",
          "Lemon peel (Citrus limon)",
        ],
        correctAnswer: "Tonka beans (Dipteryx odorata) — discovered in 1820 by A. Vogel",
        hint: "Coumarin was first isolated from tonka beans (from the Orinoco region of Venezuela) by A. Vogel in 1820, and first synthesized by Perkin in 1868 via the Perkin reaction (salicylaldehyde + acetic anhydride). It's now produced synthetically at ~$20/kg. Tonka beans contain up to 10% coumarin by weight. Fun fact: coumarin is banned from food in the US (FDA) but widely used in perfumery.",
        source: "William Perkin synthesis (1868); Vogel isolation (1820); FDA 21 CFR 189.130; Arctander (1960)",
        xpReward: 60,
      },
    ],
  },
];
