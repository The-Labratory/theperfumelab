

## Problem: Dashboard Blocked by Onboarding Gate

**Root cause**: The `OnboardingGate` component (added in the last change) requires `profiles.onboarding_completed = true` to access the dashboard. All 7 existing users have `onboarding_completed = false`, so everyone is redirected to `/onboarding` and can never reach the dashboard.

Additionally, the `profiles` table type definition may not include `onboarding_completed`, forcing the code to use `as any` casts which could silently fail on update.

## Plan

### 1. Fix existing users — mark all current profiles as onboarded
Run a migration to set `onboarding_completed = true` for all existing users so they aren't retroactively blocked:
```sql
UPDATE public.profiles SET onboarding_completed = true WHERE onboarding_completed = false;
```

### 2. Fix the OnboardingGate to handle edge cases
The current gate has two problems:
- If the Supabase query fails (network error, RLS issue), `checking` stays `true` forever → infinite spinner
- It returns `null` when `!onboarded`, which shows a blank screen after redirect

**Fix**: Add error handling and a timeout fallback. If the profile query fails, allow access rather than permanently blocking:

```typescript
const OnboardingGate = () => {
  // ... existing state ...
  useEffect(() => {
    if (loading || !user) return;
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          // Don't block on error — let user through
          setOnboarded(true);
          setChecking(false);
          return;
        }
        const completed = !!(data as any)?.onboarding_completed;
        setOnboarded(completed);
        setChecking(false);
        if (!completed) {
          navigate("/onboarding", { replace: true });
        }
      });
  }, [user, loading, navigate]);
  // ...
};
```

### 3. Fix the OnboardingPage completion to use proper typing
The `update` call in `OnboardingPage.tsx` uses `as any` because the auto-generated types don't include `onboarding_completed` yet. After the migration runs, the types will regenerate. In the meantime, confirm the update actually works by removing the `as any` or ensuring the column name is correct.

### 4. Ensure new users go through onboarding once
The `handle_new_user` trigger creates profiles with `onboarding_completed = false` (the column default), so new signups will still be gated — this is correct behavior.

## Summary of changes
- **Database**: `UPDATE profiles SET onboarding_completed = true` for existing users
- **App.tsx**: Add error handling to `OnboardingGate` so failures don't cause infinite spinners
- **OnboardingPage.tsx**: Verify the completion update works correctly

