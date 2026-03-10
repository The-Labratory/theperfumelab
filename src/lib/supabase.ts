/**
 * Supabase client configuration helpers and JWT utilities.
 *
 * Usage:
 *   import { supabase, decodeJwt, getUserRole } from "@/lib/supabase";
 */

import { supabase } from "@/integrations/supabase/client";

export { supabase };

// ─── JWT Utilities ─────────────────────────────────────────────────────────

/**
 * Decode a JWT without verifying the signature (client-side only).
 * Returns the parsed payload or null if the token is malformed.
 */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64url → Base64 → JSON
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Retrieve the role stored in the current session's JWT custom claims.
 * Returns one of: 'admin' | 'b2b_agent' | 'b2c_affiliate' | null.
 */
export async function getUserRole(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) return null;

  const payload = decodeJwt(session.access_token);
  if (!payload) return null;

  // Supabase stores custom claims under app_metadata or user_metadata
  const appMeta = payload["app_metadata"] as Record<string, unknown> | undefined;
  const userMeta = payload["user_metadata"] as Record<string, unknown> | undefined;

  return (
    (appMeta?.["role"] as string | undefined) ??
    (userMeta?.["role"] as string | undefined) ??
    null
  );
}

/**
 * Check if the currently authenticated user holds the given role.
 */
export async function hasRole(role: string): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

// ─── Email Masking (Data Security — Module D) ──────────────────────────────

/**
 * Mask a client email address to prevent database scraping in the UI.
 *
 * Examples:
 *   "test@domain.com"     → "te***@domain.com"
 *   "a@b.co"              → "a***@b.co"
 *   "verylongemail@x.io"  → "ve***@x.io"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***";
  const [local, domain] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}
