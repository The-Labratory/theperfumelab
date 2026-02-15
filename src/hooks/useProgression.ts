import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "perfume-lab-progression";

export interface ProgressionState {
  waitlistJoined: boolean;
  worldsVisited: string[];   // world IDs
  blendsCreated: number;
  cardsShared: number;
}

const defaultState: ProgressionState = {
  waitlistJoined: false,
  worldsVisited: [],
  blendsCreated: 0,
  cardsShared: 0,
};

const load = (): ProgressionState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
};

const save = (state: ProgressionState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

/**
 * Quest requirements for each collection perfume (by index).
 * Each perfume requires ALL conditions of its quest to be met.
 */
export interface Quest {
  label: string;
  description: string;
  check: (s: ProgressionState) => boolean;
}

export const collectionQuests: Quest[][] = [
  // 0 — Midnight Velvet: join the waitlist
  [
    { label: "Join the Waitlist", description: "Request access via /access or /launch", check: s => s.waitlistJoined },
  ],
  // 1 — Solar Ceremony: visit any scent world
  [
    { label: "Join the Waitlist", description: "Request access first", check: s => s.waitlistJoined },
    { label: "Explore a Scent World", description: "Visit any World detail page", check: s => s.worldsVisited.length >= 1 },
  ],
  // 2 — Emerald Mist: create your first blend
  [
    { label: "Explore 2 Worlds", description: "Visit two different World pages", check: s => s.worldsVisited.length >= 2 },
    { label: "Create a Blend", description: "Save a blend in the Scent Lab", check: s => s.blendsCreated >= 1 },
  ],
  // 3 — Azure Requiem: share an identity card
  [
    { label: "Create 2 Blends", description: "Save two blends in the Lab", check: s => s.blendsCreated >= 2 },
    { label: "Share an Identity Card", description: "Share your creation on the Arena page", check: s => s.cardsShared >= 1 },
  ],
  // 4 — Ember Throne: deep engagement
  [
    { label: "Explore 4 Worlds", description: "Visit four different World pages", check: s => s.worldsVisited.length >= 4 },
    { label: "Create 3 Blends", description: "Save three blends in the Lab", check: s => s.blendsCreated >= 3 },
    { label: "Share 2 Cards", description: "Share two Identity Cards", check: s => s.cardsShared >= 2 },
  ],
  // 5 — Bloom Reverie: mastery
  [
    { label: "Explore All 6 Worlds", description: "Visit every Scent World", check: s => s.worldsVisited.length >= 6 },
    { label: "Create 5 Blends", description: "A true creator's milestone", check: s => s.blendsCreated >= 5 },
    { label: "Share 3 Cards", description: "Build your social legacy", check: s => s.cardsShared >= 3 },
  ],
];

export const useProgression = () => {
  const [state, setState] = useState<ProgressionState>(load);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(load());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const update = useCallback((fn: (prev: ProgressionState) => ProgressionState) => {
    setState(prev => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  const markWaitlistJoined = useCallback(() => {
    update(s => ({ ...s, waitlistJoined: true }));
  }, [update]);

  const markWorldVisited = useCallback((worldId: string) => {
    update(s => ({
      ...s,
      worldsVisited: s.worldsVisited.includes(worldId)
        ? s.worldsVisited
        : [...s.worldsVisited, worldId],
    }));
  }, [update]);

  const markBlendCreated = useCallback(() => {
    update(s => ({ ...s, blendsCreated: s.blendsCreated + 1 }));
  }, [update]);

  const markCardShared = useCallback(() => {
    update(s => ({ ...s, cardsShared: s.cardsShared + 1 }));
  }, [update]);

  const isUnlocked = useCallback((perfumeIndex: number) => {
    const quests = collectionQuests[perfumeIndex];
    if (!quests) return true;
    return quests.every(q => q.check(state));
  }, [state]);

  const getQuestProgress = useCallback((perfumeIndex: number) => {
    const quests = collectionQuests[perfumeIndex];
    if (!quests) return { total: 0, completed: 0, quests: [] };
    const completed = quests.filter(q => q.check(state)).length;
    return {
      total: quests.length,
      completed,
      quests: quests.map(q => ({ ...q, done: q.check(state) })),
    };
  }, [state]);

  return {
    state,
    markWaitlistJoined,
    markWorldVisited,
    markBlendCreated,
    markCardShared,
    isUnlocked,
    getQuestProgress,
  };
};
