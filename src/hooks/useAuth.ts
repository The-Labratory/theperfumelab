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
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (!data || data.length === 0) return "user";

  // Return the highest-privilege role the user holds
  return data.reduce<AppRole>((highest, row) => {
    const rowRole = row.role as AppRole;
    return (ROLE_PRIORITY[rowRole] ?? 0) > (ROLE_PRIORITY[highest] ?? 0)
      ? rowRole
      : highest;
  }, "user");
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Hydrate from existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        setState({ user: session.user, session, role, loading: false });
      } else {
        setState({ user: null, session: null, role: null, loading: false });
      }
    });

    // Keep state in sync with auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          setState({ user: session.user, session, role, loading: false });
        } else {
          setState({ user: null, session: null, role: null, loading: false });
        }
      }
    );

    return () => subscription.unsubscribe();
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
  }, []);

  const isAdmin = state.role === "admin" || state.role === "superadmin";
  const isSuperAdmin = state.role === "superadmin";

  return { ...state, signIn, signInWithMagicLink, signUp, signOut, isAdmin, isSuperAdmin };
};
