import { supabase } from "@/integrations/supabase/client";

/**
 * Batched translation backend that calls the translation-agent edge function
 * for any missing i18n keys, ensuring all languages always have translations.
 */

const BATCH_DELAY = 300; // ms — collect missing keys before sending
const LOCAL_CACHE_KEY = "tpl_translations_cache";

interface PendingRequest {
  key: string;
  defaultValue: string;
  resolve: (value: string) => void;
}

const pendingByLang = new Map<string, PendingRequest[]>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

// Persistent local cache
function getLocalCache(): Record<string, Record<string, string>> {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalCache(lang: string, key: string, value: string) {
  try {
    const cache = getLocalCache();
    if (!cache[lang]) cache[lang] = {};
    cache[lang][key] = value;
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function getFromLocalCache(lang: string, key: string): string | null {
  const cache = getLocalCache();
  return cache[lang]?.[key] ?? null;
}

async function flushBatch(lang: string) {
  const batch = pendingByLang.get(lang);
  if (!batch || batch.length === 0) return;
  pendingByLang.set(lang, []);

  const keys = batch.map(b => b.key);
  const defaultValues = batch.map(b => b.defaultValue);

  try {
    const { data, error } = await supabase.functions.invoke("translation-agent", {
      body: { keys, targetLang: lang, defaultValues },
    });

    if (error || !data?.translations) {
      // Fallback: resolve with default values
      batch.forEach(b => b.resolve(b.defaultValue));
      return;
    }

    const translations = data.translations as Record<string, string>;
    batch.forEach(b => {
      const translated = translations[b.key] || b.defaultValue;
      setLocalCache(lang, b.key, translated);
      b.resolve(translated);
    });
  } catch {
    batch.forEach(b => b.resolve(b.defaultValue));
  }
}

/**
 * Request translation for a missing key. Returns a promise that resolves
 * to the translated string. Batches multiple requests within BATCH_DELAY ms.
 */
export function requestTranslation(lang: string, key: string, defaultValue: string): Promise<string> {
  // Check local cache first
  const cached = getFromLocalCache(lang, key);
  if (cached) return Promise.resolve(cached);

  return new Promise<string>((resolve) => {
    if (!pendingByLang.has(lang)) pendingByLang.set(lang, []);
    pendingByLang.get(lang)!.push({ key, defaultValue, resolve });

    // Reset the timer for this language
    if (timers.has(lang)) clearTimeout(timers.get(lang)!);
    timers.set(lang, setTimeout(() => flushBatch(lang), BATCH_DELAY));
  });
}

/**
 * i18next missingKeyHandler — integrates with the translation agent.
 * Updates the i18n store once translations arrive.
 */
export function createMissingKeyHandler(i18nInstance: any) {
  return (_lngs: string[], ns: string, key: string, fallbackValue: string) => {
    const lang = i18nInstance.language;
    if (lang === "en") return; // English is the source — no need to translate

    requestTranslation(lang, key, fallbackValue).then((translated) => {
      if (translated && translated !== fallbackValue) {
        i18nInstance.addResource(lang, ns, key, translated);
      }
    });
  };
}
