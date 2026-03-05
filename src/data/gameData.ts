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
  notes?: GameNote[];
  hint?: string;
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
];

export const GAME_CHAPTERS: GameChapter[] = [
  {
    id: 1,
    title: "The First Breath",
    subtitle: "Discover the world of scent",
    story: "You step into the ancient atelier of a legendary perfumer. Dusty vials line the shelves, each holding a secret. The old master looks at you and says: 'Every great perfumer begins with a single breath. Tell me — can you name what you smell?'",
    icon: "🌬️",
    rankUnlock: "Novice",
    unlockXP: 0,
    challenges: [
      {
        type: "identify",
        question: "The master hands you a strip of paper. A bright, zesty burst hits your nose. What citrus note is this?",
        options: ["Bergamot", "Vanilla", "Sandalwood", "Patchouli"],
        correctAnswer: "Bergamot",
        hint: "It's the soul of Earl Grey tea — a citrus from Southern Italy.",
        xpReward: 25,
      },
      {
        type: "identify",
        question: "A sweet, powdery cloud rises from the next vial. 'This is the queen of flowers,' the master whispers. Which note?",
        options: ["Cedarwood", "Rose", "Vetiver", "Amber"],
        correctAnswer: "Rose",
        hint: "The most iconic flower in perfumery, used for thousands of years.",
        xpReward: 25,
      },
      {
        type: "story",
        question: "The master teaches you the Fragrance Pyramid — three layers that unfold over time. Which layer do you smell first when you spray a perfume?",
        options: ["Base Notes", "Heart Notes", "Top Notes"],
        correctAnswer: "Top Notes",
        hint: "These are the lightest, most volatile molecules — the first impression.",
        xpReward: 30,
      },
      {
        type: "match",
        question: "Match the note to its layer: Bergamot is a ___ note, Rose is a ___ note, and Sandalwood is a ___ note.",
        options: ["Top, Heart, Base", "Heart, Top, Base", "Base, Heart, Top"],
        correctAnswer: "Top, Heart, Base",
        hint: "Citrus floats on top, florals bloom in the heart, woods anchor the base.",
        xpReward: 30,
      },
    ],
  },
  {
    id: 2,
    title: "The Scent Families",
    subtitle: "Learn the language of fragrance",
    story: "The master leads you deeper into the atelier, past walls of organized ingredients. 'Every note belongs to a family,' he explains. 'Florals, Orientals, Woody, Fresh — learn these families and you learn the grammar of scent.'",
    icon: "🌸",
    rankUnlock: "Apprentice",
    unlockXP: 100,
    challenges: [
      {
        type: "identify",
        question: "Which of these notes belongs to the Woody family?",
        options: ["Jasmine", "Lemon", "Cedarwood", "Lavender"],
        correctAnswer: "Cedarwood",
        hint: "Think of dry, warm, bark-like aromas found in nature.",
        xpReward: 25,
      },
      {
        type: "identify",
        question: "'Oriental' fragrances are known for being warm and sensual. Which note is quintessentially Oriental?",
        options: ["Grapefruit", "Oud", "Mint", "Green Tea"],
        correctAnswer: "Oud",
        hint: "This rare resinous wood from Southeast Asia is called 'liquid gold'.",
        xpReward: 30,
      },
      {
        type: "match",
        question: "Sort these into Fresh vs Oriental: Mint and Bergamot are ___, while Amber and Vanilla are ___.",
        options: ["Fresh, Oriental", "Oriental, Fresh", "Both Fresh", "Both Oriental"],
        correctAnswer: "Fresh, Oriental",
        hint: "Fresh = light, clean, airy. Oriental = warm, sweet, enveloping.",
        xpReward: 30,
      },
      {
        type: "story",
        question: "A 'Fougère' accord is one of the foundational fragrance structures. What does 'Fougère' mean in French?",
        options: ["Flower", "Fern", "Fire", "Forest"],
        correctAnswer: "Fern",
        hint: "It was pioneered by Houbigant's 'Fougère Royale' in 1882.",
        xpReward: 35,
      },
    ],
  },
  {
    id: 3,
    title: "The Art of Blending",
    subtitle: "Create your first accord",
    story: "The master places three vials before you. 'A single note is just an ingredient. When you combine them with intention — that is when you become an artist. Today, you create your first accord.'",
    icon: "⚗️",
    rankUnlock: "Artisan",
    unlockXP: 300,
    challenges: [
      {
        type: "blend",
        question: "To create a classic 'Hesperidia' accord (fresh citrus), which combination works best?",
        options: [
          "Bergamot + Lemon + Neroli",
          "Patchouli + Oud + Musk",
          "Rose + Jasmine + Tuberose",
          "Vanilla + Tonka + Benzoin",
        ],
        correctAnswer: "Bergamot + Lemon + Neroli",
        hint: "Hesperidia comes from the Hesperides — the citrus gardens of Greek mythology.",
        xpReward: 35,
      },
      {
        type: "story",
        question: "When two notes 'clash', it means they create a discordant smell together. What is the opposite — when notes enhance each other?",
        options: ["Synergy", "Harmony", "Both are correct"],
        correctAnswer: "Both are correct",
        hint: "In perfumery, synergy and harmony both describe complementary interactions.",
        xpReward: 25,
      },
      {
        type: "blend",
        question: "You want a warm, gourmand base for a winter fragrance. Which trio anchors it best?",
        options: [
          "Vanilla + Tonka Bean + Benzoin",
          "Lemon + Basil + Mint",
          "Rose + Iris + Peony",
        ],
        correctAnswer: "Vanilla + Tonka Bean + Benzoin",
        hint: "Gourmand bases are sweet, edible-smelling, and cozy.",
        xpReward: 35,
      },
      {
        type: "identify",
        question: "A fixative is an ingredient that makes a fragrance last longer. Which of these is a classic fixative?",
        options: ["Lemon", "Musk", "Bergamot", "Mint"],
        correctAnswer: "Musk",
        hint: "Fixatives are heavy, low-volatility molecules that anchor lighter notes.",
        xpReward: 30,
      },
    ],
  },
  {
    id: 4,
    title: "The Composer's Palette",
    subtitle: "Master advanced accords",
    story: "Months have passed. Your nose is sharper, your instincts refined. The master opens a locked cabinet. 'These are the rare ingredients — Oud, Ambergris, Iris Butter. Only a true Composer can wield them. Show me you're ready.'",
    icon: "🎼",
    rankUnlock: "Composer",
    unlockXP: 600,
    challenges: [
      {
        type: "identify",
        question: "Iris Butter (Orris) is one of the most expensive ingredients in perfumery. What plant does it come from?",
        options: ["Orchid", "Iris flower root", "Lily", "Tulip"],
        correctAnswer: "Iris flower root",
        hint: "The rhizomes must dry for 3-5 years before distillation.",
        xpReward: 40,
      },
      {
        type: "story",
        question: "What is 'maceration' in perfumery?",
        options: [
          "Grinding ingredients into powder",
          "Letting a fragrance age so notes marry together",
          "Heating oils to extract scent",
          "Mixing alcohol with water",
        ],
        correctAnswer: "Letting a fragrance age so notes marry together",
        hint: "Like wine, perfumes improve with time — the molecules need to bond.",
        xpReward: 35,
      },
      {
        type: "blend",
        question: "You're crafting a sophisticated 'Chypre' accord. Which classic combination defines this structure?",
        options: [
          "Bergamot + Oakmoss + Labdanum",
          "Rose + Jasmine + Ylang-Ylang",
          "Lemon + Basil + Vetiver",
        ],
        correctAnswer: "Bergamot + Oakmoss + Labdanum",
        hint: "Named after the island of Cyprus, Chypre was pioneered by François Coty in 1917.",
        xpReward: 40,
      },
      {
        type: "identify",
        question: "Ambergris is a legendary perfumery ingredient. Where does it come from?",
        options: ["A tree resin", "A sperm whale", "A mineral deposit", "A flower"],
        correctAnswer: "A sperm whale",
        hint: "It floats in the ocean for years, aging into a precious aromatic substance.",
        xpReward: 40,
      },
    ],
  },
  {
    id: 5,
    title: "The Master's Trial",
    subtitle: "Prove you are a Master Perfumer",
    story: "The master stands at the door of the atelier for the last time. 'I have nothing left to teach you. But before you earn the title of Master Perfumer, you must pass the Trial. Create a fragrance from memory alone — no labels, no guides. Trust your nose.'",
    icon: "👑",
    rankUnlock: "Master Perfumer",
    unlockXP: 1000,
    challenges: [
      {
        type: "blend",
        question: "Create a balanced Eau de Parfum. The ideal total concentration should be around:",
        options: ["1-3%", "15-20%", "50-60%", "90-100%"],
        correctAnswer: "15-20%",
        hint: "EDP sits between EDT (5-15%) and Extrait (20-40%).",
        xpReward: 40,
      },
      {
        type: "identify",
        question: "Without a label, you smell something powdery, violet-like, with a buttery undertone. This is likely:",
        options: ["Orris (Iris)", "Patchouli", "Vetiver", "Oakmoss"],
        correctAnswer: "Orris (Iris)",
        hint: "That powdery, lipstick-like quality is the hallmark of iris.",
        xpReward: 45,
      },
      {
        type: "story",
        question: "A client wants a fragrance that 'smells like rain on warm earth.' Which perfumery term describes this scent?",
        options: ["Sillage", "Petrichor", "Drydown", "Accord"],
        correctAnswer: "Petrichor",
        hint: "From Greek: 'petra' (stone) + 'ichor' (the fluid of gods).",
        xpReward: 45,
      },
      {
        type: "blend",
        question: "For your masterwork, you choose to create a perfume inspired by a midnight garden. Which combination captures this vision?",
        options: [
          "Tuberose + Jasmine Sambac + Black Oud + Ambergris",
          "Lemon + Mint + Cucumber + Green Tea",
          "Cinnamon + Clove + Ginger + Pepper",
        ],
        correctAnswer: "Tuberose + Jasmine Sambac + Black Oud + Ambergris",
        hint: "Night-blooming white florals over deep, mysterious woods.",
        xpReward: 50,
      },
    ],
  },
];
