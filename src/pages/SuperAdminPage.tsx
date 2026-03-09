import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Crown, Users, GitBranch, Send, Trash2, RefreshCw,
  LogOut, ChevronRight, Clock, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { toast } from "sonner";

// ── Local types ───────────────────────────────────────────────────────────────

interface UserRoleRow {
  id: string;
  user_id: string;
  role: AppRole;
}

interface ReferralNode {
  id: string;
  referrer_id: string;
  referee_user_id: string | null;
  referee_email: string;
  referral_code: string;
  status: string;
  depth: number;
  created_at: string;
}

interface InviteRow {
  id: string;
  email: string;
  role: AppRole;
  invited_by: string;
  invite_code: string;
  status: string;
  expires_at: string;
  created_at: string;
}

type Tab = "roles" | "referrals" | "invites";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    registered: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    converted:  "bg-green-500/10 text-green-400 border-green-500/20",
    accepted:   "bg-green-500/10 text-green-400 border-green-500/20",
    expired:    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    revoked:    "bg-red-500/10 text-red-400 border-red-500/20",
    admin:      "bg-accent/10 text-accent border-accent/20",
    superadmin: "bg-primary/10 text-primary border-primary/20",
    user:       "bg-muted/30 text-muted-foreground border-border",
  };
  return `text-[10px] font-display tracking-wider px-2 py-0.5 rounded border ${
    map[status] ?? "bg-primary/10 text-primary border-primary/20"
  }`;
};

// ── Component ─────────────────────────────────────────────────────────────────

const SuperAdminPage = () => {
  const { user, isSuperAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("roles");
  const [userRoles, setUserRoles] = useState<UserRoleRow[]>([]);
  const [referralNodes, setReferralNodes] = useState<ReferralNode[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("user");
  const [inviting, setInviting] = useState(false);

  // Referral tree root input
  const [treeRootId, setTreeRootId] = useState("");
  const [treeLoading, setTreeLoading] = useState(false);

  // Redirect if not superadmin
  useEffect(() => {
    if (!loading && !isSuperAdmin) navigate("/", { replace: true });
  }, [loading, isSuperAdmin, navigate]);

  const loadTab = useCallback(async (t: Tab) => {
    setDataLoading(true);
    try {
      if (t === "roles") {
        const { data, error } = await supabase
          .from("user_roles")
          .select("*")
          .order("role", { ascending: true });
        if (error) throw error;
        setUserRoles((data as UserRoleRow[]) ?? []);

      } else if (t === "invites") {
        const { data, error } = await supabase
          .from("referral_invites")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        setInvites((data as unknown as InviteRow[]) ?? []);
      }
    } catch (e) {
      toast.error("Failed to load data.");
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) loadTab(tab);
  }, [tab, isSuperAdmin, loadTab]);

  const removeRole = async (roleRow: UserRoleRow) => {
    // Only service-role can delete from user_roles in production;
    // here we call via the authenticated client — RLS blocks non-superadmin.
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", roleRow.id);
    if (error) { toast.error("Cannot remove role: " + error.message); return; }
    toast.success(`Role '${roleRow.role}' removed.`);
    setUserRoles(prev => prev.filter(r => r.id !== roleRow.id));
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    const { error } = await supabase.from("employee_invites").insert({
      email: inviteEmail.trim(),
      role: inviteRole,
      invited_by: user!.id,
    });
    setInviting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Invite sent to ${inviteEmail.trim()}.`);
    setInviteEmail("");
    loadTab("invites");
  };

  const revokeInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from("employee_invites")
      .update({ status: "revoked" })
      .eq("id", inviteId);
    if (error) { toast.error("Could not revoke invite."); return; }
    toast.success("Invite revoked.");
    setInvites(prev => prev.map(i => i.id === inviteId ? { ...i, status: "revoked" } : i));
  };

  const loadReferralTree = async () => {
    if (!treeRootId.trim()) {
      toast.error("Enter a user ID to inspect.");
      return;
    }
    setTreeLoading(true);
    try {
      const { data, error } = await supabase
        .rpc("get_referral_tree", { _root_user_id: treeRootId.trim() });
      if (error) throw error;
      setReferralNodes((data as ReferralNode[]) ?? []);
    } catch (e) {
      toast.error("Failed to load referral tree.");
      console.error(e);
    } finally {
      setTreeLoading(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "roles",     label: "User Roles",    icon: <Shield className="w-3.5 h-3.5" /> },
    { key: "invites",   label: "Invites",        icon: <Send className="w-3.5 h-3.5" /> },
    { key: "referrals", label: "Referral Tree",  icon: <GitBranch className="w-3.5 h-3.5" /> },
  ];

  if (loading || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse font-body">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-4 h-4 text-accent" />
            <span className="font-display text-sm tracking-wider text-foreground">
              SUPER ADMIN
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-body hidden sm:block">
              {user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin")}
              className="text-xs font-display tracking-wide"
            >
              Admin Console
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await signOut(); navigate("/auth"); }}
              className="text-xs text-muted-foreground"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="font-display text-2xl font-black tracking-wider gradient-text">
            SUPER ADMIN CONSOLE
          </h1>
          <p className="text-xs text-muted-foreground font-body mt-1">
            User roles, employee invites, and referral tree management
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display tracking-wide transition-all ${
                tab === t.key
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "glass-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {dataLoading ? (
          <div className="glass-surface rounded-2xl p-12 text-center">
            <p className="text-muted-foreground text-sm font-body animate-pulse">Loading…</p>
          </div>
        ) : (
          <>
            {/* ── User Roles ───────────────────────────────────────────────── */}
            {tab === "roles" && (
              <div className="glass-surface rounded-2xl overflow-hidden">
                {userRoles.length === 0 ? (
                  <EmptyState icon={<Users />} label="No role assignments found." />
                ) : (
                  <ScrollArea className="h-[600px]">
                    <table className="w-full text-xs font-body">
                      <thead className="bg-background/60 sticky top-0">
                        <tr className="text-muted-foreground">
                          <th className="text-left px-4 py-3 font-display tracking-wider">User ID</th>
                          <th className="text-left px-4 py-3 font-display tracking-wider">Role</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {userRoles.map(row => (
                          <tr
                            key={row.id}
                            className="border-t border-border/40 hover:bg-primary/5 transition-colors"
                          >
                            <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                              {row.user_id}
                              {row.user_id === user?.id && (
                                <span className="ml-2 text-[9px] text-primary">(you)</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={statusBadge(row.role)}>{row.role}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {row.user_id !== user?.id && (
                                <button
                                  onClick={() => removeRole(row)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                  title="Remove role"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* ── Invites ──────────────────────────────────────────────────── */}
            {tab === "invites" && (
              <div className="space-y-6">
                {/* Send invite form */}
                <div className="glass-surface rounded-2xl p-5">
                  <h3 className="font-display text-sm tracking-wider text-foreground mb-4">
                    Send Employee Invite
                  </h3>
                  <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      required
                      placeholder="employee@scentra.com"
                      className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value as AppRole)}
                      className="bg-background/50 border border-border rounded-lg px-4 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <Button
                      type="submit"
                      disabled={inviting}
                      className="font-display tracking-wider text-sm glow-primary"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {inviting ? "Sending…" : "Send Invite"}
                    </Button>
                  </form>
                </div>

                {/* Invite list */}
                <div className="glass-surface rounded-2xl overflow-hidden">
                  {invites.length === 0 ? (
                    <EmptyState icon={<Send />} label="No invites sent yet." />
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <table className="w-full text-xs font-body">
                        <thead className="bg-background/60 sticky top-0">
                          <tr className="text-muted-foreground">
                            <th className="text-left px-4 py-3 font-display tracking-wider">Email</th>
                            <th className="text-left px-4 py-3 font-display tracking-wider">Role</th>
                            <th className="text-left px-4 py-3 font-display tracking-wider hidden sm:table-cell">Expires</th>
                            <th className="text-left px-4 py-3 font-display tracking-wider">Status</th>
                            <th className="px-4 py-3" />
                          </tr>
                        </thead>
                        <tbody>
                          {invites.map(inv => (
                            <tr
                              key={inv.id}
                              className="border-t border-border/40 hover:bg-primary/5 transition-colors"
                            >
                              <td className="px-4 py-3 text-foreground">{inv.email}</td>
                              <td className="px-4 py-3">
                                <span className={statusBadge(inv.role)}>{inv.role}</span>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                                {fmt(inv.expires_at)}
                              </td>
                              <td className="px-4 py-3">
                                <span className={statusBadge(inv.status)}>{inv.status}</span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {inv.status === "pending" && (
                                  <button
                                    onClick={() => revokeInvite(inv.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                    title="Revoke invite"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  )}
                </div>
              </div>
            )}

            {/* ── Referral Tree ─────────────────────────────────────────────── */}
            {tab === "referrals" && (
              <div className="space-y-6">
                {/* Root picker */}
                <div className="glass-surface rounded-2xl p-5">
                  <h3 className="font-display text-sm tracking-wider text-foreground mb-4">
                    Inspect Referral Tree
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={treeRootId}
                      onChange={e => setTreeRootId(e.target.value)}
                      placeholder="Paste a user UUID…"
                      className="flex-1 bg-background/50 border border-border rounded-lg px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <Button
                      onClick={loadReferralTree}
                      disabled={treeLoading}
                      variant="outline"
                      className="font-display tracking-wider text-sm"
                    >
                      {treeLoading
                        ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        : <GitBranch className="w-4 h-4 mr-2" />}
                      {treeLoading ? "Loading…" : "Load Tree"}
                    </Button>
                  </div>
                </div>

                {/* Tree visualisation */}
                {referralNodes.length > 0 && (
                  <div className="glass-surface rounded-2xl p-5">
                    <h3 className="font-display text-sm tracking-wider text-foreground mb-4">
                      Tree ({referralNodes.length} referrals)
                    </h3>
                    <ScrollArea className="h-[460px]">
                      <div className="space-y-1">
                        {referralNodes.map(node => (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-primary/5 transition-colors"
                            style={{ paddingLeft: `${(node.depth - 1) * 24 + 8}px` }}
                          >
                            {node.depth > 1 && (
                              <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            )}
                            <GitBranch className="w-3 h-3 text-primary shrink-0" />
                            <span className="text-xs font-body text-foreground">
                              {node.referee_email}
                            </span>
                            <span className={statusBadge(node.status)}>
                              {node.status}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-body ml-auto hidden sm:flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {fmt(node.created_at)}
                            </span>
                            {node.depth > 1 && (
                              <span className="text-[10px] text-muted-foreground font-display tracking-wider hidden md:block">
                                L{node.depth}
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Depth summary */}
                    <div className="mt-4 pt-4 border-t border-border flex gap-4 flex-wrap">
                      {Array.from(new Set(referralNodes.map(n => n.depth))).sort().map(d => {
                        const count = referralNodes.filter(n => n.depth === d).length;
                        return (
                          <div key={d} className="text-center">
                            <span className="block font-display text-sm text-primary">{count}</span>
                            <span className="text-[10px] text-muted-foreground font-body">Level {d}</span>
                          </div>
                        );
                      })}
                      <div className="text-center">
                        <span className="block font-display text-sm text-accent">
                          {referralNodes.filter(n => n.status === "converted").length}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-body">Converted</span>
                      </div>
                    </div>
                  </div>
                )}

                {referralNodes.length === 0 && treeRootId && !treeLoading && (
                  <EmptyState icon={<GitBranch />} label="No referrals found for this user." />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ── Empty state helper ─────────────────────────────────────────────────────────

const EmptyState = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="py-16 text-center">
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted/30 text-muted-foreground mb-3">
      {icon}
    </div>
    <p className="text-sm text-muted-foreground font-body">{label}</p>
  </div>
);

export default SuperAdminPage;
