import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "user" | "admin" | "superadmin";

export interface AuthState {
  user: User | null;
  session: Session | null;
  /** null = still loading; 'user' = authenticated but no special role */
  role: AppRole | null;
  loading: boolean;
}

const ROLE_PRIORITY: Record<string, number> = {
  superadmin: 3,
  admin: 2,
  user: 1,
};

const fetchUserRole = async (userId: string): Promise<AppRole> => {
  try {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (!data || data.length === 0) return "user";

    return data.reduce<AppRole>((highest, row) => {
      const rowRole = row.role as AppRole;
      return (ROLE_PRIORITY[rowRole] ?? 0) > (ROLE_PRIORITY[highest] ?? 0)
        ? rowRole
        : highest;
    }, "user");
  } catch {
    return "user";
  }
};

/** Ensure a profile row exists — safety net if the DB trigger didn't fire */
const ensureProfile = async (user: User): Promise<void> => {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data) {
      await supabase.from("profiles").insert({
        user_id: user.id,
        display_name:
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "User",
      });
    }
  } catch {
    // Non-critical — profile will be created on next opportunity
  }
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const bootstrap = async (session: Session | null) => {
      if (session?.user) {
        // Ensure profile exists (fire-and-forget, don't block auth)
        ensureProfile(session.user);
        const role = await fetchUserRole(session.user.id);
        if (mounted) setState({ user: session.user, session, role, loading: false });
      } else {
        if (mounted) setState({ user: null, session: null, role: null, loading: false });
      }
    };

    // Set up listener BEFORE getSession (per Supabase best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await bootstrap(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      bootstrap(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, role: null, loading: false });
  }, []);

  const isAdmin = state.role === "admin" || state.role === "superadmin";
  const isSuperAdmin = state.role === "superadmin";

  return { ...state, signIn, signInWithMagicLink, signUp, signOut, isAdmin, isSuperAdmin };
};
