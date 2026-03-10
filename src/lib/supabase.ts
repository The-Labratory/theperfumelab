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

    // Convert base64url encoding to standard base64, then pad to a multiple of 4
    const base64url = parts[1];
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const paddingNeeded = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(paddingNeeded);

    return JSON.parse(atob(padded)) as Record<string, unknown>;
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
 * Shows at most 2 characters of the local part then "***", keeping the
 * domain visible for recognition but making the full address un-copyable.
 *
 * Examples:
 *   "test@domain.com"  → "te***@domain.com"
 *   "a@b.co"           → "a***@b.co"
 *   "ab@x.io"          → "ab***@x.io"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***";
  const atIndex = email.lastIndexOf("@");
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  // Always show at most 2 chars; for 1-char locals show 1 char
  const visibleChars = Math.min(2, local.length);
  const visible = local.slice(0, visibleChars);
  return `${visible}***@${domain}`;
}
