import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/policyEngine";

export function useSuperAdmin() {
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (_event === 'SIGNED_IN') {
          await supabase.rpc("assign_admin_if_allowed", {
            _user_id: session.user.id,
            _email: session.user.email || "",
          });
        }
        await loadRoles(session.user.id);
      } else {
        setRoles([]);
        setIsSuperAdmin(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadRoles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRoles = async (userId: string) => {
    try {
      const { data: superCheck } = await supabase.rpc("is_super_admin", { _user_id: userId });
      const isSA = !!superCheck;
      setIsSuperAdmin(isSA);

      if (isSA) {
        setRoles(['super_admin', 'admin']);
      } else {
        const { data: adminCheck } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
        setRoles(adminCheck ? ['admin'] : ['user']);
      }
    } catch {
      setRoles([]);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (eventType: string, details: Record<string, unknown> = {}) => {
    try {
      await supabase.from("security_events").insert({
        event_type: eventType,
        severity: "medium",
        user_id: user?.id,
        endpoint: window.location.pathname,
        details,
      });
    } catch {}
  };

  return { user, roles, isSuperAdmin, loading, logSecurityEvent };
}
