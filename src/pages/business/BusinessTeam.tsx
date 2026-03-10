import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Plus, Copy, CheckCircle2, Clock, Lock, Loader2,
  TrendingUp, DollarSign, Mail
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getExpansionTier, canAccessTeamPortal } from "@/lib/affiliateTiers";

interface SubInvite {
  id: string;
  invite_code: string;
  invited_email: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  sub_affiliate_id: string | null;
}

interface SubAffiliate {
  id: string;
  display_name: string;
  email: string;
  total_sales: number;
  total_earnings: number;
  status: string;
  tier: string;
}

export default function BusinessTeam() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [invites, setInvites] = useState<SubInvite[]>([]);
  const [subAffiliates, setSubAffiliates] = useState<SubAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const weeklySales: number = affiliate?.weekly_sales_count ?? 0;
  const tierKey = getExpansionTier(weeklySales);
  const hasAccess = canAccessTeamPortal(tierKey);
  const overridePct = (affiliate?.management_override_pct ?? 0.1) * 100;

  useEffect(() => {
    if (hasAccess) fetchData();
    else setLoading(false);
  }, [affiliate?.id, hasAccess]);

  const fetchData = async () => {
    setLoading(true);
    const [inviteRes, subRes] = await Promise.all([
      supabase
        .from("sub_affiliate_invites")
        .select("*")
        .eq("lead_affiliate_id", affiliate.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("affiliate_partners")
        .select("id, display_name, email, total_sales, total_earnings, status, tier")
        .eq("lead_affiliate_id", affiliate.id)
        .order("total_sales", { ascending: false }),
    ]);
    if (inviteRes.error) toast.error("Failed to load invites");
    if (subRes.error) toast.error("Failed to load team members");
    setInvites((inviteRes.data as SubInvite[]) || []);
    setSubAffiliates((subRes.data as SubAffiliate[]) || []);
    setLoading(false);
  };

  const createInvite = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("sub_affiliate_invites")
      .insert({
        lead_affiliate_id: affiliate.id,
        invited_email: inviteEmail.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create invite");
    } else {
      toast.success("Invite created!");
      setInviteEmail("");
      setDialogOpen(false);
      setInvites((prev) => [data as SubInvite, ...prev]);
    }
    setSaving(false);
  };

  const copyInviteLink = (code: string) => {
    const url = `${window.location.origin}/affiliate-signup?invite=${code}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Invite link copied!"));
  };

  const revokeInvite = async (id: string) => {
    if (!window.confirm("Revoke this invite?")) return;
    const { error } = await supabase
      .from("sub_affiliate_invites")
      .update({ status: "revoked" })
      .eq("id", id);
    if (error) toast.error("Failed to revoke invite");
    else {
      toast.success("Invite revoked");
      setInvites((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, status: "revoked" } : inv))
      );
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
      accepted: "bg-green-400/10 text-green-400 border-green-400/30",
      expired: "bg-muted/20 text-muted-foreground border-border/30",
      revoked: "bg-destructive/10 text-destructive border-destructive/30",
    };
    return map[status] ?? map.pending;
  };

  const teamTotalSales = subAffiliates.reduce((s, a) => s + (a.total_sales || 0), 0);
  const teamTotalEarnings = subAffiliates.reduce((s, a) => s + (a.total_earnings || 0), 0);
  const overrideEarnings = (teamTotalEarnings * overridePct) / 100;

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">Team Portal Locked</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Reach <strong>15 sales/week</strong> (Pro tier) to unlock the Sub-Affiliate Team Portal.
          You currently have <strong>{weeklySales} sales</strong> this week.
        </p>
        <Badge variant="outline" className="text-xs">
          {15 - weeklySales} more {15 - weeklySales === 1 ? "sale" : "sales"} needed
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
            Sub-Affiliate Team
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Sponsor sub-affiliates and earn a{" "}
            <span className="text-foreground font-semibold">{overridePct.toFixed(0)}% management override</span>{" "}
            on every sale they make.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 font-display tracking-wider">
              <Plus className="w-4 h-4" />
              NEW INVITE
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wide">Invite Sub-Affiliate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Your sub-affiliate gets the standard <strong>40% margin</strong>. You earn a{" "}
                <strong>{overridePct.toFixed(0)}% management override</strong> on their sales.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">
                  <Mail className="w-3.5 h-3.5 inline mr-1" />
                  Email (optional)
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="partner@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to create a generic invite link.
                </p>
              </div>
              <Button className="w-full font-display tracking-wider" onClick={createInvite} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {saving ? "CREATING…" : "CREATE INVITE"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team stats */}
      {subAffiliates.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "TEAM MEMBERS", value: subAffiliates.length, icon: Users, color: "text-blue-400" },
            { label: "TEAM SALES", value: `€${teamTotalSales.toFixed(0)}`, icon: TrendingUp, color: "text-green-400" },
            { label: "TEAM EARNINGS", value: `€${teamTotalEarnings.toFixed(0)}`, icon: DollarSign, color: "text-primary" },
            { label: "YOUR OVERRIDE", value: `€${overrideEarnings.toFixed(0)}`, icon: DollarSign, color: "text-purple-400" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border/40 glass-surface p-4 text-center"
            >
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <p className={`font-display text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] font-display tracking-widest text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Team members */}
          {subAffiliates.length > 0 && (
            <div>
              <h3 className="font-display text-xs tracking-widest text-muted-foreground mb-3">
                TEAM MEMBERS
              </h3>
              <div className="space-y-2">
                {subAffiliates.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-border/30 glass-surface p-4 flex items-center gap-4 flex-wrap"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-display font-black text-sm shrink-0">
                      {sub.display_name?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-foreground truncate">
                        {sub.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-center">
                        <p className="font-display text-sm font-black text-green-400">
                          €{(sub.total_sales || 0).toFixed(0)}
                        </p>
                        <p className="text-[9px] font-display tracking-widest text-muted-foreground">SALES</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-sm font-black text-primary">
                          €{((sub.total_earnings || 0) * overridePct / 100).toFixed(0)}
                        </p>
                        <p className="text-[9px] font-display tracking-widest text-muted-foreground">YOUR CUT</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          sub.status === "active"
                            ? "border-green-400/40 text-green-400"
                            : "border-border/40 text-muted-foreground"
                        }`}
                      >
                        {sub.status?.toUpperCase()}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Invite links */}
          <div>
            <h3 className="font-display text-xs tracking-widest text-muted-foreground mb-3">
              INVITE LINKS
            </h3>
            {invites.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/40 p-10 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="font-display text-sm tracking-wider">NO INVITES YET</p>
                <p className="text-xs mt-1">Create an invite to start building your team.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invites.map((inv, i) => {
                  const invUrl = `${window.location.origin}/affiliate-signup?invite=${inv.invite_code}`;
                  const isExpired =
                    inv.status === "expired" ||
                    (inv.status === "pending" && new Date(inv.expires_at) < new Date());
                  return (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-xl border border-border/30 glass-surface p-3 flex items-center gap-3 flex-wrap"
                    >
                      <div className="flex-1 min-w-0">
                        {inv.invited_email ? (
                          <p className="text-xs font-medium text-foreground truncate">{inv.invited_email}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground font-mono truncate">{invUrl}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={`text-[10px] ${statusBadge(inv.status)}`}>
                            {inv.status.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires {new Date(inv.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {inv.status === "accepted" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-7 h-7"
                              onClick={() => copyInviteLink(inv.invite_code)}
                              disabled={isExpired}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            {inv.status === "pending" && !isExpired && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-destructive hover:text-destructive h-7"
                                onClick={() => revokeInvite(inv.id)}
                              >
                                Revoke
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Data security note */}
          <div className="rounded-xl bg-muted/20 border border-border/30 p-4 text-xs text-muted-foreground">
            <strong className="text-foreground">Data Security — The Handcuff:</strong> All sub-affiliates
            and locations are hard-linked to your profile. If you become inactive (fail the 5-sale/week
            rule), sub-affiliates and location links revert to the Company House Account after 30 days.
          </div>
        </>
      )}
    </div>
  );
}
