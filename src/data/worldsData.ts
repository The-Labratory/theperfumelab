import worldVerdant from "@/assets/world-verdant.jpg";
import worldAzure from "@/assets/world-azure.jpg";
import worldEmber from "@/assets/world-ember.jpg";
import worldBloom from "@/assets/world-bloom.jpg";
import worldNocturne from "@/assets/world-nocturne.jpg";
import worldSolar from "@/assets/world-solar.jpg";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xp: number;
  emoji: string;
}

export interface CollectibleIngredient {
  id: string;
  name: string;
  emoji: string;
  rarity: "common" | "rare" | "legendary";
  description: string;
  discovered: boolean;
}

export interface BlendChallenge {
  id: string;
  title: string;
  description: string;
  targetNotes: string[];
  difficulty: "beginner" | "intermediate" | "master";
}

export interface World {
  id: string;
  name: string;
  type: string;
  emoji: string;
  image: string;
  unlocked: boolean;
  lore: string;
  color: string;
  quizzes: QuizQuestion[];
  dailyMissions: DailyMission[];
  ingredients: CollectibleIngredient[];
  blendChallenges: BlendChallenge[];
}

export const worlds: World[] = [
  {
    id: "verdant",
    name: "The Verdant Realm",
    type: "Green / Herbal",
    emoji: "🌲",
    image: worldVerdant,
    unlocked: true,
    color: "hsl(130 50% 35%)",
    lore: "An ancient forest where every leaf holds a secret fragrance. The Verdant Realm is home to the rarest herbal essences, guarded by master herbalists who have perfected green compositions for centuries.",
    quizzes: [
      { question: "Which note is extracted from the bark of cinnamon trees?", options: ["Vetiver", "Cinnamon", "Patchouli", "Basil"], correctIndex: 1, explanation: "Cinnamon comes from the inner bark of Cinnamomum trees." },
      { question: "What is Petitgrain derived from?", options: ["Flower petals", "Bitter orange leaves", "Tree roots", "Grass"], correctIndex: 1, explanation: "Petitgrain is distilled from the leaves and twigs of the bitter orange tree." },
      { question: "Which herb is known as the 'king of herbs' in perfumery?", options: ["Mint", "Basil", "Rosemary", "Thyme"], correctIndex: 1, explanation: "Basil, especially exotic basil, is prized for its complex aromatic profile." },
      { question: "Vetiver oil is extracted from which part of the plant?", options: ["Leaves", "Flowers", "Roots", "Seeds"], correctIndex: 2, explanation: "Vetiver oil comes from the roots of the vetiver grass." },
    ],
    dailyMissions: [
      { id: "v1", title: "Forest Forager", description: "Identify 3 green notes in your daily surroundings", xp: 50, emoji: "🌿" },
      { id: "v2", title: "Herb Garden", description: "Create a blend using only herbal notes in the Lab", xp: 100, emoji: "🌱" },
      { id: "v3", title: "Morning Dew", description: "Smell fresh-cut grass and describe the scent", xp: 30, emoji: "💧" },
    ],
    ingredients: [
      { id: "wild-moss", name: "Wild Moss", emoji: "🌿", rarity: "common", description: "Earthy, damp forest floor essence", discovered: true },
      { id: "ancient-fern", name: "Ancient Fern", emoji: "🌾", rarity: "rare", description: "Primordial green from ferns older than flowers", discovered: false },
      { id: "dryad-tear", name: "Dryad's Tear", emoji: "💎", rarity: "legendary", description: "Mythical sap said to capture the soul of the forest", discovered: false },
      { id: "pine-resin", name: "Pine Resin", emoji: "🌲", rarity: "common", description: "Sticky, balsamic warmth from conifer trees", discovered: true },
      { id: "clover-honey", name: "Clover Honey", emoji: "🍀", rarity: "rare", description: "Sweet herbal nectar with green undertones", discovered: false },
    ],
    blendChallenges: [
      { id: "vc1", title: "Forest Dawn", description: "Recreate the scent of a misty morning forest", targetNotes: ["vetiver", "mint", "cedarwood"], difficulty: "beginner" },
      { id: "vc2", title: "Herbalist's Secret", description: "Blend a calming herbal composition", targetNotes: ["basil", "lavender", "green-tea", "eucalyptus"], difficulty: "intermediate" },
      { id: "vc3", title: "Elven Garden", description: "A mythical green scent that transcends nature", targetNotes: ["fig-leaf", "petitgrain", "iris", "oak-moss", "vetiver"], difficulty: "master" },
    ],
  },
  {
    id: "azure",
    name: "The Azure Depths",
    type: "Aquatic / Fresh",
    emoji: "🌊",
    image: worldAzure,
    unlocked: true,
    color: "hsl(200 80% 50%)",
    lore: "Beneath crystalline waves lies a kingdom of aquatic scents. The Azure Depths captures the essence of ocean spray, mineral-rich sea caves, and the fresh wind that carries salt across endless horizons.",
    quizzes: [
      { question: "What synthetic molecule is commonly used to create 'ocean' scents?", options: ["Calone", "Vanillin", "Coumarin", "Linalool"], correctIndex: 0, explanation: "Calone (methylbenzodioxepinone) creates that distinctive marine/watermelon note." },
      { question: "Which natural material gives a salty, marine quality?", options: ["Ambergris", "Rose", "Sandalwood", "Vanilla"], correctIndex: 0, explanation: "Ambergris, produced by sperm whales, has a unique salty-sweet marine character." },
      { question: "Sea salt in perfumery primarily adds what quality?", options: ["Sweetness", "Mineral freshness", "Woody depth", "Floral lift"], correctIndex: 1, explanation: "Sea salt provides a clean mineral freshness that enhances aquatic compositions." },
    ],
    dailyMissions: [
      { id: "a1", title: "Tide Walker", description: "Describe the difference between morning air and evening air", xp: 50, emoji: "🌊" },
      { id: "a2", title: "Deep Dive", description: "Create an aquatic blend with at least 4 notes", xp: 100, emoji: "🐠" },
      { id: "a3", title: "Salt Spray", description: "Find a scent that reminds you of the ocean", xp: 30, emoji: "🧂" },
    ],
    ingredients: [
      { id: "sea-foam", name: "Sea Foam", emoji: "🫧", rarity: "common", description: "Light, effervescent marine accord", discovered: true },
      { id: "abyssal-pearl", name: "Abyssal Pearl", emoji: "🦪", rarity: "rare", description: "Deep-sea iridescence with powdery minerality", discovered: false },
      { id: "kraken-ink", name: "Kraken Ink", emoji: "🦑", rarity: "legendary", description: "Dark, mysterious deep-ocean essence", discovered: false },
      { id: "coral-bloom", name: "Coral Bloom", emoji: "🪸", rarity: "common", description: "Delicate marine floral from warm currents", discovered: true },
      { id: "drift-wood", name: "Drift Wood", emoji: "🪵", rarity: "rare", description: "Sun-bleached, salt-worn woody accord", discovered: false },
    ],
    blendChallenges: [
      { id: "ac1", title: "Coastal Morning", description: "Capture the scent of a seaside sunrise", targetNotes: ["sea-salt", "ozonic", "bergamot"], difficulty: "beginner" },
      { id: "ac2", title: "Deep Current", description: "An oceanic scent with mysterious depth", targetNotes: ["ambergris", "sea-salt", "vetiver", "ozonic"], difficulty: "intermediate" },
      { id: "ac3", title: "Poseidon's Throne", description: "A regal aquatic blend fit for a sea god", targetNotes: ["ambergris", "iris", "sea-salt", "sandalwood", "ozonic"], difficulty: "master" },
    ],
  },
  {
    id: "ember",
    name: "Ember Dominion",
    type: "Spicy / Woody",
    emoji: "🔥",
    image: worldEmber,
    unlocked: true,
    color: "hsl(15 80% 50%)",
    lore: "A volcanic realm where molten rivers flow through ancient spice markets. The Ember Dominion is where the most intense and warming fragrances are forged — a place of fire, wood smoke, and exotic spice caravans.",
    quizzes: [
      { question: "Which spice is known as 'red gold' in perfumery?", options: ["Cinnamon", "Nutmeg", "Saffron", "Cardamom"], correctIndex: 2, explanation: "Saffron is one of the most expensive spices by weight, hence 'red gold'." },
      { question: "Oud is derived from which tree?", options: ["Sandalwood", "Agarwood", "Cedar", "Pine"], correctIndex: 1, explanation: "Oud comes from the resinous heartwood of Aquilaria (agarwood) trees infected by mold." },
      { question: "Which note gives leather fragrances their smoky quality?", options: ["Birch tar", "Vanilla", "Jasmine", "Rose"], correctIndex: 0, explanation: "Birch tar has been used historically in Russian leather and provides that distinctive smoky note." },
    ],
    dailyMissions: [
      { id: "e1", title: "Spice Merchant", description: "Smell 3 different spices in your kitchen", xp: 50, emoji: "🔥" },
      { id: "e2", title: "Forge Master", description: "Create a blend dominated by woody-spicy notes", xp: 100, emoji: "⚒️" },
      { id: "e3", title: "Smoke Signal", description: "Light a candle and describe its scent profile", xp: 30, emoji: "🕯️" },
    ],
    ingredients: [
      { id: "volcanic-ash", name: "Volcanic Ash", emoji: "🌋", rarity: "common", description: "Dry, mineral smokiness from deep earth", discovered: true },
      { id: "dragon-amber", name: "Dragon Amber", emoji: "🐉", rarity: "rare", description: "Molten amber with supernatural warmth", discovered: false },
      { id: "phoenix-feather", name: "Phoenix Feather", emoji: "🔥", rarity: "legendary", description: "Ashes that regenerate into the purest incense", discovered: false },
      { id: "ember-wood", name: "Ember Wood", emoji: "🪵", rarity: "common", description: "Charred aromatic wood with lingering warmth", discovered: true },
      { id: "spice-dust", name: "Spice Dust", emoji: "✨", rarity: "rare", description: "Ancient market blend of rare ground spices", discovered: false },
    ],
    blendChallenges: [
      { id: "ec1", title: "Fireside", description: "Warmth of a crackling fire on a winter night", targetNotes: ["smoky-incense", "cedarwood", "vanilla"], difficulty: "beginner" },
      { id: "ec2", title: "Spice Route", description: "The exotic scent of a Far East spice caravan", targetNotes: ["saffron", "cardamom", "oud", "leather"], difficulty: "intermediate" },
      { id: "ec3", title: "Inferno Crown", description: "An overwhelming, majestic spicy-woody composition", targetNotes: ["oud", "saffron", "leather", "smoky-incense", "black-pepper", "amber"], difficulty: "master" },
    ],
  },
  {
    id: "bloom",
    name: "Bloom Sanctum",
    type: "Floral",
    emoji: "🌸",
    image: worldBloom,
    unlocked: false,
    color: "hsl(330 60% 55%)",
    lore: "An eternal garden where every petal holds a thousand years of beauty. The Bloom Sanctum is a sacred paradise of flowers — from delicate spring blossoms to intoxicating night-blooming florals.",
    quizzes: [
      { question: "Which flower is considered the 'Queen of Perfumery'?", options: ["Rose", "Jasmine", "Tuberose", "Lily"], correctIndex: 0, explanation: "Rose has been the most iconic flower in perfumery for thousands of years." },
      { question: "Tuberose is known for what characteristic?", options: ["Subtle lightness", "Narcotic intensity", "Citrus freshness", "Woody depth"], correctIndex: 1, explanation: "Tuberose is famously narcotic and intoxicating, especially at night." },
    ],
    dailyMissions: [
      { id: "b1", title: "Petal Collector", description: "Smell a fresh flower and note its scent layers", xp: 50, emoji: "🌹" },
      { id: "b2", title: "Garden Architect", description: "Create an all-floral blend in the Lab", xp: 100, emoji: "🏡" },
    ],
    ingredients: [
      { id: "moon-petal", name: "Moon Petal", emoji: "🌙", rarity: "rare", description: "Night-blooming flower that glows under moonlight", discovered: false },
      { id: "eden-rose", name: "Eden Rose", emoji: "🌹", rarity: "legendary", description: "The first rose, said to bloom in paradise", discovered: false },
      { id: "pollen-dust", name: "Pollen Dust", emoji: "🌼", rarity: "common", description: "Golden particles carrying floral DNA", discovered: false },
    ],
    blendChallenges: [
      { id: "bc1", title: "Spring Bouquet", description: "A fresh floral arrangement in scent form", targetNotes: ["rose", "peony", "freesia"], difficulty: "beginner" },
      { id: "bc2", title: "Midnight Garden", description: "Intoxicating night-blooming flowers", targetNotes: ["tuberose", "jasmine", "ylang-ylang", "musk"], difficulty: "master" },
    ],
  },
  {
    id: "nocturne",
    name: "Nocturne District",
    type: "Oriental / Gourmand",
    emoji: "🌙",
    image: worldNocturne,
    unlocked: false,
    color: "hsl(265 60% 40%)",
    lore: "A twilight city of indulgence where sweet, dark, and mysterious scents fill the air. The Nocturne District is an underground world of gourmand treasures, resinous incense, and velvety oriental compositions.",
    quizzes: [
      { question: "What ingredient gives gourmand fragrances their sweet, edible quality?", options: ["Cedarwood", "Ethyl maltol", "Vetiver", "Lemon"], correctIndex: 1, explanation: "Ethyl maltol is a synthetic molecule that adds a cotton-candy sweetness to fragrances." },
      { question: "Which resin has been used in spiritual ceremonies for millennia?", options: ["Benzoin", "Frankincense", "Elemi", "All of these"], correctIndex: 3, explanation: "All three — benzoin, frankincense, and elemi — have ancient ceremonial uses." },
    ],
    dailyMissions: [
      { id: "n1", title: "Sweet Tooth", description: "Compare vanilla extract with a vanilla-scented product", xp: 50, emoji: "🍦" },
      { id: "n2", title: "Shadow Blender", description: "Create a dark, mysterious oriental blend", xp: 100, emoji: "🌑" },
    ],
    ingredients: [
      { id: "shadow-silk", name: "Shadow Silk", emoji: "🕸️", rarity: "rare", description: "Smooth, dark accord of black musk and silk", discovered: false },
      { id: "void-amber", name: "Void Amber", emoji: "⚫", rarity: "legendary", description: "Amber from the edge of existence, infinitely deep", discovered: false },
      { id: "midnight-cocoa", name: "Midnight Cocoa", emoji: "🍫", rarity: "common", description: "Bittersweet dark chocolate essence", discovered: false },
    ],
    blendChallenges: [
      { id: "nc1", title: "Velvet Night", description: "A smooth, comforting evening scent", targetNotes: ["vanilla", "tonka-bean", "cocoa"], difficulty: "beginner" },
      { id: "nc2", title: "Opium Den", description: "A decadent, mysterious oriental", targetNotes: ["oud", "benzoin", "smoky-incense", "vanilla", "black-musk"], difficulty: "master" },
    ],
  },
  {
    id: "solar",
    name: "Solar Citadel",
    type: "Citrus",
    emoji: "🍋",
    image: worldSolar,
    unlocked: false,
    color: "hsl(45 90% 55%)",
    lore: "A sun-drenched fortress perched above the clouds where light itself has a scent. The Solar Citadel radiates with citrus bursts, golden warmth, and the electric energy of a perpetual sunrise.",
    quizzes: [
      { question: "Which citrus oil is cold-pressed from its rind?", options: ["All citrus oils", "Only lemon", "Only bergamot", "Only orange"], correctIndex: 0, explanation: "Most citrus essential oils are obtained by cold-pressing the fruit rinds." },
      { question: "Bergamot is a key ingredient in which classic blend?", options: ["Chanel No. 5", "Eau de Cologne", "Shalimar", "Opium"], correctIndex: 1, explanation: "Bergamot is the backbone of classic Eau de Cologne, first created in the 18th century." },
    ],
    dailyMissions: [
      { id: "s1", title: "Sunrise Sniffer", description: "Peel a citrus fruit and describe the burst of scent", xp: 50, emoji: "🌅" },
      { id: "s2", title: "Solar Flare", description: "Create a citrus-forward energizing blend", xp: 100, emoji: "☀️" },
    ],
    ingredients: [
      { id: "sun-crystal", name: "Sun Crystal", emoji: "💛", rarity: "rare", description: "Crystallized sunlight with sparkling citrus facets", discovered: false },
      { id: "supernova-zest", name: "Supernova Zest", emoji: "💥", rarity: "legendary", description: "The most intense citrus burst in the universe", discovered: false },
      { id: "golden-peel", name: "Golden Peel", emoji: "🍊", rarity: "common", description: "Fresh zest from sun-ripened golden citrus", discovered: false },
    ],
    blendChallenges: [
      { id: "sc1", title: "Morning Light", description: "A bright, uplifting citrus opener", targetNotes: ["bergamot", "lemon-zest", "grapefruit"], difficulty: "beginner" },
      { id: "sc2", title: "Golden Hour", description: "Citrus meets warmth in a sunset composition", targetNotes: ["blood-orange", "neroli", "sandalwood", "amber", "mandarin"], difficulty: "master" },
    ],
  },
];
