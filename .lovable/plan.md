

# Master Perfumer AI & Full Application Audit — Fix Plan

## Issues Found

### 1. Edge Function: JSON Parsing Fragility (Critical)
The `perfumer-ai` edge function returns raw AI text in `data.content`. The Gifting, Seance, and SEO flows then `JSON.parse()` this content. If the AI model wraps its response in markdown code fences (e.g., ` ```json ... ``` `), parsing fails silently and the user sees "Could not generate blend" errors.

**Fix:** Strip markdown code fences from the AI response in the edge function before returning `content`.

### 2. Edge Function: SEO Mode Not Supported (Bug)
`SEOPageGeneratorPage` sends `{ messages: [...] }` to `perfumer-ai`, but the edge function only accepts `mode` values of `analyze`, `gift`, `duo`, or `seance`. It ignores the `messages` field entirely and returns a 400 error. The SEO page falls through to a local fallback template every time.

**Fix:** Add a `messages` pass-through mode to the edge function that forwards arbitrary chat messages to the AI gateway.

### 3. Edge Function: Model Update
Currently uses `google/gemini-2.5-flash`. Per platform guidelines, the default should be `google/gemini-3-flash-preview`.

**Fix:** Update the model string in the edge function.

### 4. AIPerfumer Component: Poor Auth Error Handling
When unauthenticated users tap "Master Perfumer AI", the edge function returns 401 but the component shows a generic "AI Perfumer is temporarily unavailable" toast. Users don't know they need to log in.

**Fix:** Check the error response and show "Please sign in to use the AI Perfumer" when 401.

### 5. AIPerfumer Component: Missing 429/402 Handling
Rate limit (429) and payment (402) errors from the edge function are not surfaced with specific messages.

**Fix:** Add specific toast messages for 429 and 402 status codes.

### 6. GiftingPage & ScentSeance: Same Auth & Error Handling Gaps
Same issues as AIPerfumer — no specific handling for 401, 429, or 402.

### 7. FormulationLabPage: Same Pattern
The `requestAiEvolution` function has the same generic error handling.

---

## Implementation Plan

### A. Update `supabase/functions/perfumer-ai/index.ts`
- Strip markdown code fences (` ```json `, ` ``` `) from AI response content before returning
- Add a `"messages"` mode that forwards raw messages to the AI gateway (for SEO and future use)
- Update model to `google/gemini-3-flash-preview`
- Return error status codes in the JSON body so `supabase.functions.invoke` can surface them

### B. Update `src/components/AIPerfumer.tsx`
- Detect 401 errors and show "Sign in to use AI Perfumer"
- Detect 429/402 and show appropriate messages
- Handle `data.error` field from edge function responses

### C. Update `src/pages/GiftingPage.tsx`
- Same auth and rate-limit error handling improvements
- Improve JSON parse error resilience (strip code fences client-side as fallback)

### D. Update `src/components/ScentSeance.tsx`
- Same error handling improvements
- Same JSON parse resilience

### E. Update `src/pages/FormulationLabPage.tsx`
- Same error handling pattern

### F. Update `src/pages/SEOPageGeneratorPage.tsx`
- Use the new `messages` mode properly
- Parse `data.content` instead of `data.choices[0].message.content`

---

## Summary of Changes

| File | Change |
|------|--------|
| `supabase/functions/perfumer-ai/index.ts` | Strip code fences, add messages mode, update model, surface error codes |
| `src/components/AIPerfumer.tsx` | Auth-aware error handling (401/429/402) |
| `src/pages/GiftingPage.tsx` | Auth-aware error handling, JSON parse resilience |
| `src/components/ScentSeance.tsx` | Auth-aware error handling, JSON parse resilience |
| `src/pages/FormulationLabPage.tsx` | Auth-aware error handling |
| `src/pages/SEOPageGeneratorPage.tsx` | Fix to use correct response shape |

