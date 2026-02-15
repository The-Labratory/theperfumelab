import { worlds } from "./worldsData";
import { availableNotes } from "./scentNotes";
import { scentArchetypes, noteFamilyMap } from "./scentDNA";
import { perfumeCollections } from "./collectionsData";

export type MilestoneCategory =
  | "world_discovery"
  | "ingredient_mastery"
  | "blend_creation"
  | "collection_progress"
  | "social_legacy"
  | "archetype_journey"
  | "quiz_mastery"
  | "mission_hero"
  | "challenge_champion"
  | "perfumery_knowledge";

export type MilestoneRarity = "common" | "rare" | "epic" | "legendary";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: MilestoneCategory;
  rarity: MilestoneRarity;
  xp: number;
  worldId?: string;
  noteId?: string;
  archetypeId?: string;
  collectionId?: string;
}

// ═══════════════════════════════════════════════════
// 1. WORLD DISCOVERY — ~60 milestones
// ═══════════════════════════════════════════════════
function generateWorldMilestones(): Milestone[] {
  const milestones: Milestone[] = [];

  worlds.forEach((world) => {
    // First visit
    milestones.push({
      id: `world-visit-${world.id}`,
      title: `${world.name} Explorer`,
      description: `Set foot in ${world.name} for the first time`,
      emoji: world.emoji,
      category: "world_discovery",
      rarity: "common",
      xp: 25,
      worldId: world.id,
    });

    // Complete first quiz
    milestones.push({
      id: `world-quiz-first-${world.id}`,
      title: `${world.name} Student`,
      description: `Answer your first quiz question correctly in ${world.name}`,
      emoji: "📝",
      category: "quiz_mastery",
      rarity: "common",
      xp: 30,
      worldId: world.id,
    });

    // Complete all quizzes
    milestones.push({
      id: `world-quiz-all-${world.id}`,
      title: `${world.name} Scholar`,
      description: `Answer all quiz questions correctly in ${world.name}`,
      emoji: "🎓",
      category: "quiz_mastery",
      rarity: "rare",
      xp: 100,
      worldId: world.id,
    });

    // Perfect quiz score (no mistakes)
    milestones.push({
      id: `world-quiz-perfect-${world.id}`,
      title: `${world.name} Sage`,
      description: `Perfect score on all ${world.name} quizzes with no mistakes`,
      emoji: "🏆",
      category: "quiz_mastery",
      rarity: "epic",
      xp: 200,
      worldId: world.id,
    });

    // Complete first mission
    milestones.push({
      id: `world-mission-first-${world.id}`,
      title: `${world.name} Apprentice`,
      description: `Complete your first mission in ${world.name}`,
      emoji: "⭐",
      category: "mission_hero",
      rarity: "common",
      xp: 40,
      worldId: world.id,
    });

    // Complete all missions
    milestones.push({
      id: `world-mission-all-${world.id}`,
      title: `${world.name} Hero`,
      description: `Complete all daily missions in ${world.name}`,
      emoji: "🦸",
      category: "mission_hero",
      rarity: "rare",
      xp: 150,
      worldId: world.id,
    });

    // Discover first ingredient
    milestones.push({
      id: `world-ingredient-first-${world.id}`,
      title: `${world.name} Forager`,
      description: `Discover your first ingredient in ${world.name}`,
      emoji: "🔍",
      category: "ingredient_mastery",
      rarity: "common",
      xp: 20,
      worldId: world.id,
    });

    // Discover all common ingredients
    milestones.push({
      id: `world-ingredient-common-${world.id}`,
      title: `${world.name} Gatherer`,
      description: `Discover all common ingredients in ${world.name}`,
      emoji: "🧺",
      category: "ingredient_mastery",
      rarity: "common",
      xp: 50,
      worldId: world.id,
    });

    // Discover all rare ingredients
    milestones.push({
      id: `world-ingredient-rare-${world.id}`,
      title: `${world.name} Treasure Hunter`,
      description: `Discover all rare ingredients in ${world.name}`,
      emoji: "💎",
      category: "ingredient_mastery",
      rarity: "rare",
      xp: 100,
      worldId: world.id,
    });

    // Discover legendary ingredient
    world.ingredients
      .filter((i) => i.rarity === "legendary")
      .forEach((ingredient) => {
        milestones.push({
          id: `world-ingredient-legend-${world.id}-${ingredient.id}`,
          title: `${ingredient.name} Found`,
          description: `Discover the legendary ${ingredient.name} in ${world.name}`,
          emoji: ingredient.emoji,
          category: "ingredient_mastery",
          rarity: "legendary",
          xp: 300,
          worldId: world.id,
        });
      });

    // Complete first blend challenge
    milestones.push({
      id: `world-challenge-first-${world.id}`,
      title: `${world.name} Challenger`,
      description: `Complete your first blend challenge in ${world.name}`,
      emoji: "⚔️",
      category: "challenge_champion",
      rarity: "common",
      xp: 50,
      worldId: world.id,
    });

    // Complete all blend challenges
    milestones.push({
      id: `world-challenge-all-${world.id}`,
      title: `${world.name} Champion`,
      description: `Conquer all blend challenges in ${world.name}`,
      emoji: "👑",
      category: "challenge_champion",
      rarity: "epic",
      xp: 250,
      worldId: world.id,
    });

    // Master the world (all activities complete)
    milestones.push({
      id: `world-master-${world.id}`,
      title: `${world.name} Master`,
      description: `Complete every activity in ${world.name}`,
      emoji: "🌟",
      category: "world_discovery",
      rarity: "legendary",
      xp: 500,
      worldId: world.id,
    });
  });

  // Cross-world milestones
  milestones.push(
    { id: "worlds-visit-3", title: "Wanderer", description: "Visit 3 different Scent Worlds", emoji: "🗺️", category: "world_discovery", rarity: "common", xp: 50 },
    { id: "worlds-visit-all", title: "World Traveler", description: "Visit all 6 Scent Worlds", emoji: "🌍", category: "world_discovery", rarity: "rare", xp: 150 },
    { id: "worlds-quiz-all", title: "Universal Scholar", description: "Complete all quizzes across every world", emoji: "📚", category: "quiz_mastery", rarity: "epic", xp: 500 },
    { id: "worlds-mission-all", title: "Legendary Hero", description: "Complete all missions across every world", emoji: "🏅", category: "mission_hero", rarity: "legendary", xp: 750 },
    { id: "worlds-challenge-all", title: "Grand Champion", description: "Conquer all blend challenges across every world", emoji: "🏆", category: "challenge_champion", rarity: "legendary", xp: 1000 },
    { id: "worlds-master-all", title: "Scent God", description: "Master every single activity in all 6 worlds", emoji: "✨", category: "world_discovery", rarity: "legendary", xp: 2000 },
  );

  return milestones;
}

// ═══════════════════════════════════════════════════
// 2. INGREDIENT / NOTE MASTERY — ~120 milestones
// ═══════════════════════════════════════════════════
function generateNoteMilestones(): Milestone[] {
  const milestones: Milestone[] = [];

  // Per-note milestones for each available note
  availableNotes.forEach((note) => {
    // First use
    milestones.push({
      id: `note-first-${note.id}`,
      title: `${note.name} Discovery`,
      description: `Use ${note.name} in a blend for the first time`,
      emoji: note.emoji,
      category: "ingredient_mastery",
      rarity: "common",
      xp: 10,
      noteId: note.id,
    });
  });

  // Layer mastery
  (["top", "heart", "base"] as const).forEach((layer) => {
    const count = availableNotes.filter((n) => n.layer === layer).length;
    milestones.push({
      id: `layer-all-${layer}`,
      title: `${layer === "top" ? "Top" : layer === "heart" ? "Heart" : "Base"} Note Collector`,
      description: `Use all ${count} ${layer} notes at least once`,
      emoji: layer === "top" ? "⬆️" : layer === "heart" ? "❤️" : "⬇️",
      category: "ingredient_mastery",
      rarity: "epic",
      xp: 300,
    });
  });

  // Family mastery
  const families = [...new Set(Object.values(noteFamilyMap))];
  families.forEach((family) => {
    const familyNotes = Object.entries(noteFamilyMap).filter(([, f]) => f === family);
    milestones.push({
      id: `family-master-${family}`,
      title: `${family.charAt(0).toUpperCase() + family.slice(1)} Expert`,
      description: `Use all ${familyNotes.length} ${family} family notes`,
      emoji: family === "citrus" ? "🍊" : family === "floral" ? "🌹" : family === "woody" ? "🪵" : family === "oriental" ? "🕯️" : family === "gourmand" ? "🍫" : family === "spicy" ? "🌶️" : family === "musk" ? "🤍" : family === "leather" ? "🧳" : family === "green" ? "🌿" : family === "aquatic" ? "🌊" : "✨",
      category: "ingredient_mastery",
      rarity: "rare",
      xp: 150,
    });
  });

  // Cumulative usage milestones
  const usageTiers = [
    { count: 10, title: "Curious Nose", rarity: "common" as MilestoneRarity, xp: 30 },
    { count: 25, title: "Scent Apprentice", rarity: "common" as MilestoneRarity, xp: 60 },
    { count: 50, title: "Fragrance Artisan", rarity: "rare" as MilestoneRarity, xp: 120 },
    { count: 75, title: "Perfume Virtuoso", rarity: "epic" as MilestoneRarity, xp: 250 },
    { count: 100, title: "Olfactory Legend", rarity: "legendary" as MilestoneRarity, xp: 500 },
  ];
  usageTiers.forEach(({ count, title, rarity, xp }) => {
    milestones.push({
      id: `notes-used-${count}`,
      title,
      description: `Use ${count} unique notes across all your blends`,
      emoji: "🧪",
      category: "ingredient_mastery",
      rarity,
      xp,
    });
  });

  // All notes discovered
  milestones.push({
    id: "notes-all-discovered",
    title: "Complete Palette",
    description: `Discover and use all ${availableNotes.length} available notes`,
    emoji: "🎨",
    category: "ingredient_mastery",
    rarity: "legendary",
    xp: 1000,
  });

  return milestones;
}

// ═══════════════════════════════════════════════════
// 3. BLEND CREATION — ~30 milestones
// ═══════════════════════════════════════════════════
function generateBlendMilestones(): Milestone[] {
  return [
    { id: "blend-first", title: "First Creation", description: "Create your very first blend", emoji: "🧪", category: "blend_creation", rarity: "common", xp: 25 },
    { id: "blend-3", title: "Budding Creator", description: "Create 3 blends", emoji: "🌱", category: "blend_creation", rarity: "common", xp: 50 },
    { id: "blend-5", title: "Prolific Mixer", description: "Create 5 blends", emoji: "⚗️", category: "blend_creation", rarity: "common", xp: 75 },
    { id: "blend-10", title: "Dedicated Perfumer", description: "Create 10 blends", emoji: "🔬", category: "blend_creation", rarity: "rare", xp: 150 },
    { id: "blend-25", title: "Master Blender", description: "Create 25 blends", emoji: "🏆", category: "blend_creation", rarity: "epic", xp: 300 },
    { id: "blend-50", title: "Legendary Creator", description: "Create 50 blends", emoji: "👑", category: "blend_creation", rarity: "legendary", xp: 500 },
    { id: "blend-100", title: "Centurion Perfumer", description: "Create 100 blends — you are unstoppable", emoji: "💯", category: "blend_creation", rarity: "legendary", xp: 1000 },

    // Concentration milestones
    { id: "blend-parfum", title: "Pure Intensity", description: "Create a blend at Parfum concentration", emoji: "💧", category: "blend_creation", rarity: "common", xp: 30 },
    { id: "blend-edp", title: "Elegant Choice", description: "Create a blend at Eau de Parfum concentration", emoji: "💧", category: "blend_creation", rarity: "common", xp: 25 },
    { id: "blend-edt", title: "Light Touch", description: "Create a blend at Eau de Toilette concentration", emoji: "💧", category: "blend_creation", rarity: "common", xp: 20 },
    { id: "blend-all-concentrations", title: "Full Spectrum", description: "Create blends in all 3 concentration levels", emoji: "🌈", category: "blend_creation", rarity: "rare", xp: 100 },

    // Harmony milestones
    { id: "harmony-50", title: "Balanced Start", description: "Achieve a harmony score of 50+", emoji: "⚖️", category: "blend_creation", rarity: "common", xp: 30 },
    { id: "harmony-70", title: "Harmonious Mind", description: "Achieve a harmony score of 70+", emoji: "🎵", category: "blend_creation", rarity: "rare", xp: 75 },
    { id: "harmony-85", title: "Perfect Pitch", description: "Achieve a harmony score of 85+", emoji: "🎶", category: "blend_creation", rarity: "epic", xp: 200 },
    { id: "harmony-95", title: "Divine Harmony", description: "Achieve a harmony score of 95+", emoji: "✨", category: "blend_creation", rarity: "legendary", xp: 500 },
    { id: "harmony-100", title: "Absolute Perfection", description: "Achieve a perfect 100 harmony score", emoji: "💎", category: "blend_creation", rarity: "legendary", xp: 1000 },

    // Note count milestones per blend
    { id: "blend-notes-3", title: "Minimalist", description: "Create a blend with exactly 3 notes", emoji: "3️⃣", category: "blend_creation", rarity: "common", xp: 20 },
    { id: "blend-notes-5", title: "Balanced Composer", description: "Create a blend with 5 notes", emoji: "5️⃣", category: "blend_creation", rarity: "common", xp: 30 },
    { id: "blend-notes-7", title: "Complex Mind", description: "Create a blend with 7+ notes", emoji: "7️⃣", category: "blend_creation", rarity: "rare", xp: 60 },
    { id: "blend-notes-10", title: "Maximalist", description: "Create a blend with 10+ notes", emoji: "🔟", category: "blend_creation", rarity: "epic", xp: 150 },

    // Special blends
    { id: "blend-all-layers", title: "Triple Layered", description: "Create a blend with notes in all 3 layers", emoji: "🎂", category: "blend_creation", rarity: "common", xp: 25 },
    { id: "blend-single-layer", title: "Purist", description: "Create a blend using notes from only one layer", emoji: "🎯", category: "blend_creation", rarity: "rare", xp: 75 },
    { id: "blend-single-family", title: "Mono-Family", description: "Create a blend using notes from only one scent family", emoji: "🧬", category: "blend_creation", rarity: "epic", xp: 150 },
    { id: "blend-5-families", title: "Fusion Artist", description: "Create a blend spanning 5+ scent families", emoji: "🌐", category: "blend_creation", rarity: "epic", xp: 200 },

    // Leaderboard
    { id: "leaderboard-weekly", title: "Weekly Star", description: "Appear on the weekly leaderboard", emoji: "📊", category: "blend_creation", rarity: "rare", xp: 100 },
    { id: "leaderboard-top3", title: "Podium Finish", description: "Reach Top 3 on the weekly leaderboard", emoji: "🥇", category: "blend_creation", rarity: "epic", xp: 300 },
    { id: "leaderboard-alltime", title: "Hall of Fame", description: "Appear on the all-time leaderboard", emoji: "🏛️", category: "blend_creation", rarity: "legendary", xp: 500 },
  ];
}

// ═══════════════════════════════════════════════════
// 4. COLLECTION PROGRESS — ~18 milestones
// ═══════════════════════════════════════════════════
function generateCollectionMilestones(): Milestone[] {
  const milestones: Milestone[] = [];

  perfumeCollections.forEach((perfume, index) => {
    milestones.push({
      id: `collection-unlock-${perfume.id}`,
      title: `${perfume.name} Unlocked`,
      description: `Complete all quests to unlock ${perfume.name}`,
      emoji: perfume.emoji,
      category: "collection_progress",
      rarity: index < 2 ? "common" : index < 4 ? "rare" : "epic",
      xp: (index + 1) * 50,
      collectionId: perfume.id,
    });

    milestones.push({
      id: `collection-study-${perfume.id}`,
      title: `${perfume.name} Connoisseur`,
      description: `Study every note in ${perfume.name}'s composition`,
      emoji: "📖",
      category: "collection_progress",
      rarity: "rare",
      xp: 75,
      collectionId: perfume.id,
    });
  });

  milestones.push(
    { id: "collection-unlock-3", title: "Collector", description: "Unlock 3 signature fragrances", emoji: "🗝️", category: "collection_progress", rarity: "rare", xp: 150 },
    { id: "collection-unlock-all", title: "Complete Collection", description: "Unlock all 6 signature fragrances", emoji: "💫", category: "collection_progress", rarity: "legendary", xp: 1000 },
    { id: "collection-featured", title: "Featured Fan", description: "Explore all featured fragrances", emoji: "⭐", category: "collection_progress", rarity: "common", xp: 50 },
  );

  return milestones;
}

// ═══════════════════════════════════════════════════
// 5. SOCIAL & GIFTING — ~25 milestones
// ═══════════════════════════════════════════════════
function generateSocialMilestones(): Milestone[] {
  return [
    { id: "social-share-first", title: "First Share", description: "Share your first identity card", emoji: "📤", category: "social_legacy", rarity: "common", xp: 25 },
    { id: "social-share-3", title: "Social Butterfly", description: "Share 3 identity cards", emoji: "🦋", category: "social_legacy", rarity: "common", xp: 50 },
    { id: "social-share-10", title: "Influencer", description: "Share 10 identity cards", emoji: "📱", category: "social_legacy", rarity: "rare", xp: 150 },
    { id: "social-share-25", title: "Scent Ambassador", description: "Share 25 identity cards", emoji: "🌟", category: "social_legacy", rarity: "epic", xp: 300 },

    // Gifting
    { id: "gift-first", title: "First Gift", description: "Create your first fragrance gift", emoji: "🎁", category: "social_legacy", rarity: "common", xp: 30 },
    { id: "gift-3", title: "Generous Soul", description: "Create 3 fragrance gifts", emoji: "💝", category: "social_legacy", rarity: "common", xp: 75 },
    { id: "gift-10", title: "Gift Master", description: "Create 10 fragrance gifts", emoji: "🎀", category: "social_legacy", rarity: "rare", xp: 200 },
    { id: "gift-duo-first", title: "Duo Creator", description: "Create your first Duo Blend gift", emoji: "👫", category: "social_legacy", rarity: "rare", xp: 75 },
    { id: "gift-duo-5", title: "Duo Expert", description: "Create 5 Duo Blend gifts", emoji: "💕", category: "social_legacy", rarity: "epic", xp: 200 },
    { id: "gift-revealed", title: "Surprise!", description: "Have a gift you created be revealed by the recipient", emoji: "😍", category: "social_legacy", rarity: "rare", xp: 100 },
    { id: "gift-reaction", title: "Heartfelt Reaction", description: "Receive a reaction on a gift you created", emoji: "🥹", category: "social_legacy", rarity: "rare", xp: 100 },

    // Waitlist
    { id: "waitlist-joined", title: "Early Adopter", description: "Join the exclusive waitlist", emoji: "📋", category: "social_legacy", rarity: "common", xp: 25 },

    // Séance
    { id: "seance-first", title: "First Séance", description: "Complete your first Scent Séance ritual", emoji: "👁️", category: "social_legacy", rarity: "rare", xp: 75 },
    { id: "seance-3", title: "Séance Adept", description: "Complete 3 Scent Séance rituals across different worlds", emoji: "🔮", category: "social_legacy", rarity: "epic", xp: 200 },
    { id: "seance-all", title: "Oracle's Chosen", description: "Complete a Séance in every Scent World", emoji: "✨", category: "social_legacy", rarity: "legendary", xp: 500 },

    // Install / PWA
    { id: "app-installed", title: "True Fan", description: "Install the app on your device", emoji: "📲", category: "social_legacy", rarity: "common", xp: 30 },

    // Partner
    { id: "partner-applied", title: "Business Mind", description: "Submit a partner application", emoji: "🤝", category: "social_legacy", rarity: "rare", xp: 50 },
  ];
}

// ═══════════════════════════════════════════════════
// 6. ARCHETYPE JOURNEY — ~24 milestones
// ═══════════════════════════════════════════════════
function generateArchetypeMilestones(): Milestone[] {
  const milestones: Milestone[] = [];

  scentArchetypes.forEach((arch) => {
    milestones.push({
      id: `archetype-discover-${arch.id}`,
      title: `${arch.name} Awakens`,
      description: `Discover the ${arch.name} archetype through your blend DNA`,
      emoji: arch.emoji,
      category: "archetype_journey",
      rarity: "rare",
      xp: 75,
      archetypeId: arch.id,
    });

    milestones.push({
      id: `archetype-embody-${arch.id}`,
      title: `True ${arch.name}`,
      description: `Create 5 blends that match the ${arch.name} archetype`,
      emoji: arch.emoji,
      category: "archetype_journey",
      rarity: "epic",
      xp: 200,
      archetypeId: arch.id,
    });

    milestones.push({
      id: `archetype-transcend-${arch.id}`,
      title: `${arch.name} Transcended`,
      description: `Create 10 blends as a ${arch.name} — your identity is fully realized`,
      emoji: "🌟",
      category: "archetype_journey",
      rarity: "legendary",
      xp: 400,
      archetypeId: arch.id,
    });
  });

  milestones.push(
    { id: "archetype-discover-all", title: "Identity Explorer", description: "Discover all 6 scent archetypes", emoji: "🧬", category: "archetype_journey", rarity: "legendary", xp: 750 },
    { id: "archetype-dna-first", title: "DNA Decoded", description: "View your Scent DNA analysis for the first time", emoji: "🧬", category: "archetype_journey", rarity: "common", xp: 25 },
    { id: "archetype-dna-evolved", title: "DNA Evolved", description: "Your Scent DNA has shifted archetypes after creating more blends", emoji: "🔄", category: "archetype_journey", rarity: "rare", xp: 100 },
  );

  return milestones;
}

// ═══════════════════════════════════════════════════
// 7. PERFUMERY KNOWLEDGE — ~20 milestones
// ═══════════════════════════════════════════════════
function generateKnowledgeMilestones(): Milestone[] {
  return [
    { id: "knowledge-first-quiz", title: "Curious Mind", description: "Answer your first quiz question correctly", emoji: "❓", category: "perfumery_knowledge", rarity: "common", xp: 15 },
    { id: "knowledge-10-correct", title: "Quick Learner", description: "Answer 10 quiz questions correctly", emoji: "📝", category: "perfumery_knowledge", rarity: "common", xp: 50 },
    { id: "knowledge-25-correct", title: "Studious", description: "Answer 25 quiz questions correctly", emoji: "📖", category: "perfumery_knowledge", rarity: "rare", xp: 100 },
    { id: "knowledge-50-correct", title: "Encyclopedia", description: "Answer 50 quiz questions correctly", emoji: "📚", category: "perfumery_knowledge", rarity: "epic", xp: 250 },
    { id: "knowledge-streak-5", title: "On Fire", description: "Answer 5 quiz questions correctly in a row", emoji: "🔥", category: "perfumery_knowledge", rarity: "rare", xp: 75 },
    { id: "knowledge-streak-10", title: "Unstoppable", description: "Answer 10 quiz questions correctly in a row", emoji: "⚡", category: "perfumery_knowledge", rarity: "epic", xp: 200 },

    // Note knowledge
    { id: "knowledge-note-families", title: "Family Tree", description: "Learn all scent note families by using notes from each", emoji: "🌳", category: "perfumery_knowledge", rarity: "epic", xp: 300 },
    { id: "knowledge-layers", title: "Layer Expert", description: "Understand the fragrance pyramid by using all 3 layers", emoji: "📐", category: "perfumery_knowledge", rarity: "common", xp: 30 },

    // AI interactions
    { id: "knowledge-ai-first", title: "AI Consultation", description: "Get your first blend analysis from the Master Perfumer AI", emoji: "🤖", category: "perfumery_knowledge", rarity: "common", xp: 25 },
    { id: "knowledge-ai-5", title: "AI Apprentice", description: "Consult the Master Perfumer AI 5 times", emoji: "🧠", category: "perfumery_knowledge", rarity: "rare", xp: 75 },
    { id: "knowledge-ai-10", title: "AI Collaborator", description: "Consult the Master Perfumer AI 10 times", emoji: "🤝", category: "perfumery_knowledge", rarity: "epic", xp: 150 },

    // Time-based
    { id: "knowledge-day-1", title: "Day One", description: "Begin your perfumery journey", emoji: "🌅", category: "perfumery_knowledge", rarity: "common", xp: 10 },
    { id: "knowledge-week-1", title: "Week One", description: "Return after your first week", emoji: "📅", category: "perfumery_knowledge", rarity: "common", xp: 50 },
    { id: "knowledge-month-1", title: "Dedicated Student", description: "Still exploring after a month", emoji: "🗓️", category: "perfumery_knowledge", rarity: "rare", xp: 150 },
  ];
}

// ═══════════════════════════════════════════════════
// COMBINE ALL — 300+ milestones
// ═══════════════════════════════════════════════════
export const allMilestones: Milestone[] = [
  ...generateWorldMilestones(),
  ...generateNoteMilestones(),
  ...generateBlendMilestones(),
  ...generateCollectionMilestones(),
  ...generateSocialMilestones(),
  ...generateArchetypeMilestones(),
  ...generateKnowledgeMilestones(),
];

// Category metadata for display
export const milestoneCategories: Record<MilestoneCategory, { label: string; emoji: string; color: string }> = {
  world_discovery: { label: "World Discovery", emoji: "🌍", color: "hsl(130 50% 45%)" },
  ingredient_mastery: { label: "Ingredient Mastery", emoji: "🧪", color: "hsl(35 80% 55%)" },
  blend_creation: { label: "Blend Creation", emoji: "⚗️", color: "hsl(265 60% 55%)" },
  collection_progress: { label: "Collection Progress", emoji: "💎", color: "hsl(200 80% 55%)" },
  social_legacy: { label: "Social Legacy", emoji: "🌟", color: "hsl(330 60% 55%)" },
  archetype_journey: { label: "Archetype Journey", emoji: "🧬", color: "hsl(15 80% 55%)" },
  quiz_mastery: { label: "Quiz Mastery", emoji: "🎓", color: "hsl(45 90% 55%)" },
  mission_hero: { label: "Mission Hero", emoji: "🦸", color: "hsl(170 50% 45%)" },
  challenge_champion: { label: "Challenge Champion", emoji: "⚔️", color: "hsl(350 70% 50%)" },
  perfumery_knowledge: { label: "Perfumery Knowledge", emoji: "📚", color: "hsl(220 60% 55%)" },
};

export const rarityConfig: Record<MilestoneRarity, { label: string; color: string; glow: string }> = {
  common: { label: "Common", color: "hsl(0 0% 60%)", glow: "0 0 8px hsl(0 0% 60% / 0.3)" },
  rare: { label: "Rare", color: "hsl(210 80% 60%)", glow: "0 0 12px hsl(210 80% 60% / 0.4)" },
  epic: { label: "Epic", color: "hsl(280 70% 60%)", glow: "0 0 16px hsl(280 70% 60% / 0.4)" },
  legendary: { label: "Legendary", color: "hsl(45 90% 55%)", glow: "0 0 20px hsl(45 90% 55% / 0.5)" },
};

// Stats
export const milestoneStats = {
  total: allMilestones.length,
  byCategory: Object.entries(milestoneCategories).map(([key, meta]) => ({
    category: key as MilestoneCategory,
    ...meta,
    count: allMilestones.filter((m) => m.category === key).length,
  })),
  byRarity: (["common", "rare", "epic", "legendary"] as MilestoneRarity[]).map((r) => ({
    rarity: r,
    ...rarityConfig[r],
    count: allMilestones.filter((m) => m.rarity === r).length,
  })),
  totalXP: allMilestones.reduce((sum, m) => sum + m.xp, 0),
};
