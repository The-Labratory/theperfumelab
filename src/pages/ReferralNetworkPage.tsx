import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Link2, Copy, CheckCircle, TrendingUp, UserPlus, Share2,
  ChevronRight, ChevronDown, Crown, Award, Shield, ArrowUp,
  Gift, Zap, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { toast } from "sonner";

interface TreeNode {
  user_id: string;
  parent_user_id: string | null;
  depth: number;
  display_name: string | null;
  referral_code: string | null;
  children?: TreeNode[];
}

// Recursive tree node component
function TreeNodeCard({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4 md:ml-8">
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border border-border/30 bg-card/50 backdrop-blur-sm mb-1 cursor-pointer hover:bg-muted/30 transition-colors`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <div className="w-4 h-4 shrink-0" />
        )}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {(node.display_name || "?")[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{node.display_name || "Unknown"}</p>
          <p className="text-[10px] text-muted-foreground">Level {node.depth}</p>
        </div>
        {hasChildren && (
          <Badge variant="outline" className="text-[10px] shrink-0">{node.children!.length} direct</Badge>
        )}
      </div>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-l-2 border-border/20 ml-4"
          >
            {node.children!.map(child => (
              <TreeNodeCard key={child.user_id} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReferralNetworkPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Network data
  const [myRelationship, setMyRelationship] = useState<any>(null);
  const [inviterProfile, setInviterProfile] = useState<any>(null);
  const [directReferrals, setDirectReferrals] = useState<TreeNode[]>([]);
  const [totalDownline, setTotalDownline] = useState(0);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [rankHistory, setRankHistory] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [ranks, setRanks] = useState<any[]>([]);

  // Invite dialog
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth?redirect=/network");
        return;
      }
      setUser(session.user);
      await loadAllData(session.user.id);

      // Check if user came with a referral code to process
      const refCode = searchParams.get("ref");
      if (refCode) {
        await processReferralCode(session.user.id, refCode);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) navigate("/auth?redirect=/network");
      else setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const processReferralCode = async (userId: string, code: string) => {
    try {
      const { data, error } = await supabase.rpc("process_referral_signup", {
        _new_user_id: userId,
        _referral_code: code,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.success) {
        toast.success("You've been linked to your inviter's network!");
        await loadAllData(userId);
      } else if (result?.error === "User already has a referral parent") {
        // Already linked, no need to show error
      } else if (result?.error) {
        toast.error(result.error);
      }
    } catch (err: any) {
      console.error("Referral processing error:", err);
    }
  };

  const loadAllData = async (userId: string) => {
    setLoading(true);
    try {
      const [profileRes, downlineRes, directCountRes, invitesRes, rankHistRes, commissionsRes, ranksRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
        supabase.rpc("get_downline", { _user_id: userId }),
        supabase.rpc("count_direct_referrals", { _user_id: userId }),
        (supabase.from("referral_invites" as any) as any).select("*").eq("inviter_user_id", userId).order("created_at", { ascending: false }).limit(50),
        (supabase.from("user_rank_history" as any) as any).select("*").eq("user_id", userId).order("achieved_at", { ascending: false }),
        (supabase.from("commission_ledger" as any) as any).select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
        (supabase.from("rank_rules" as any) as any).select("*").eq("is_active", true).order("rank_level", { ascending: true }),
      ]);

      // Fetch relationship separately with type cast
      const relRes = await (supabase.from("referral_relationships" as any) as any).select("*").eq("user_id", userId).maybeSingle();

      setProfile(profileRes.data);
      const relData = relRes.data as any;
      setMyRelationship(relData);

      // Load inviter profile if exists
      if (relData?.parent_user_id) {
        const { data: inviter } = await supabase.from("profiles").select("display_name, referral_code, avatar_url").eq("user_id", relData.parent_user_id).maybeSingle();
        setInviterProfile(inviter);
      }

      const downlineData = (downlineRes.data || []) as TreeNode[];
      setTotalDownline(downlineData.length);

      // Build tree from flat downline data
      const directChildren = downlineData.filter(d => d.parent_user_id === userId);
      setDirectReferrals(directChildren);

      // Build nested tree
      const buildTree = (parentId: string): TreeNode[] => {
        return downlineData
          .filter(d => d.parent_user_id === parentId)
          .map(d => ({ ...d, children: buildTree(d.user_id) }));
      };
      setTreeData(buildTree(userId));

      setInvites(invitesRes.data || []);
      setRankHistory(rankHistRes.data || []);
      setCommissions(commissionsRes.data || []);
      setRanks(ranksRes.data || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    const link = `https://www.lenzohariri.com/auth?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      // Rate limit check
      const { data: canInvite } = await supabase.rpc("check_invite_rate_limit", { _user_id: user.id });
      if (!canInvite) {
        toast.error("Too many invites. Please wait before sending more.");
        return;
      }

      const { error } = await (supabase.from("referral_invites" as any) as any).insert([{
        inviter_user_id: user.id,
        invited_email: inviteEmail.trim().toLowerCase(),
      }]);
      if (error) throw error;

      await (supabase.from("referral_events" as any) as any).insert([{
        user_id: user.id,
        event_type: "invite_sent",
        details: { invited_email: inviteEmail.trim().toLowerCase() },
      }]);

      toast.success("Invite recorded!");
      setInviteEmail("");
      setShowInvite(false);
      loadAllData(user.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setSendingInvite(false);
    }
  };

  const currentRank = rankHistory[0]?.rank_name || "Starter";
  const totalCommissions = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
  const pendingCommissions = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + (c.commission_amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ParticleField />
      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
            My <span className="text-primary">Network</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Invite & Earn — grow your referral tree, track your team, and unlock rewards.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Direct Invites", value: directReferrals.length, icon: UserPlus, color: "text-primary" },
            { label: "Total Downline", value: totalDownline, icon: Users, color: "text-secondary" },
            { label: "Current Rank", value: currentRank, icon: Crown, color: "text-amber-500" },
            { label: "Total Earned", value: `€${totalCommissions.toFixed(2)}`, icon: TrendingUp, color: "text-green-500" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 glass-surface border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Referral Link Section */}
        <Card className="glass-surface border-border/30 p-5 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" /> Your Referral Link
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Share this link to grow your network. Code: <strong className="text-foreground">{profile?.referral_code}</strong></p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyReferralLink} variant="outline" size="sm" className="gap-2">
                {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button onClick={() => setShowInvite(true)} size="sm" className="gap-2">
                <Share2 className="w-4 h-4" /> Invite
              </Button>
            </div>
          </div>
          {profile?.referral_code && (
            <div className="mt-3 p-2 rounded bg-muted/30 border border-border/20">
              <code className="text-xs text-muted-foreground break-all">https://www.lenzohariri.com/auth?ref={profile.referral_code}</code>
            </div>
          )}
        </Card>

        {/* My Inviter */}
        {myRelationship?.parent_user_id && inviterProfile && (
          <Card className="glass-surface border-border/30 p-4 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <ArrowUp className="w-4 h-4" /> My Inviter
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {(inviterProfile.display_name || "?")[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{inviterProfile.display_name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">Referred you to the network</p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="tree" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-muted/30">
            <TabsTrigger value="tree">Referral Tree</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="ranks">Rank Progress</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Referral Tree Tab */}
          <TabsContent value="tree">
            <Card className="glass-surface border-border/30 p-5">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Team Structure
              </h2>
              {treeData.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No team members yet. Share your referral link to start building your network!</p>
                  <Button onClick={copyReferralLink} variant="outline" size="sm" className="mt-4 gap-2">
                    <Copy className="w-4 h-4" /> Copy Referral Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-1 -ml-4 md:-ml-8">
                  {treeData.map(node => (
                    <TreeNodeCard key={node.user_id} node={node} />
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Invites Tab */}
          <TabsContent value="invites">
            <Card className="glass-surface border-border/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" /> My Invitations
                </h2>
                <Button onClick={() => setShowInvite(true)} size="sm" className="gap-1.5">
                  <UserPlus className="w-4 h-4" /> New Invite
                </Button>
              </div>
              {invites.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No invitations sent yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Accepted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell className="text-sm">{inv.invited_email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === "accepted" ? "default" : "outline"} className={inv.status === "accepted" ? "bg-green-500/10 text-green-500 border-green-500/30" : ""}>
                            {inv.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{inv.accepted_at ? new Date(inv.accepted_at).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* Ranks Tab */}
          <TabsContent value="ranks">
            <Card className="glass-surface border-border/30 p-5">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" /> Rank Progression
              </h2>
              <div className="grid gap-3 mb-6">
                {ranks.map((rank, i) => {
                  const isAchieved = rankHistory.some(rh => rh.rank_level >= rank.rank_level);
                  const isCurrent = currentRank === rank.rank_name;
                  return (
                    <div
                      key={rank.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isCurrent ? "border-primary bg-primary/5" : isAchieved ? "border-green-500/30 bg-green-500/5" : "border-border/20 bg-muted/10 opacity-60"}`}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: rank.badge_color + "20", color: rank.badge_color }}>
                        {rank.rank_level}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{rank.rank_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {rank.min_direct_referrals} direct · €{rank.min_team_sales} team sales
                        </p>
                      </div>
                      {isCurrent && <Badge className="bg-primary/10 text-primary border-primary/30">Current</Badge>}
                      {isAchieved && !isCurrent && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  );
                })}
              </div>

              {rankHistory.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Rank History</h3>
                  <div className="space-y-2">
                    {rankHistory.map(rh => (
                      <div key={rh.id} className="flex items-center justify-between p-2 rounded bg-muted/20 text-xs">
                        <span className="font-medium">{rh.rank_name}</span>
                        <span className="text-muted-foreground">{new Date(rh.achieved_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card className="glass-surface border-border/30 p-5">
              <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" /> Commission Earnings
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs text-muted-foreground">Total Earned</p>
                  <p className="text-xl font-display font-bold text-green-500">€{totalCommissions.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-xl font-display font-bold text-amber-500">€{pendingCommissions.toFixed(2)}</p>
                </div>
              </div>
              {commissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No commission entries yet. Commissions are earned on verified sales from your network.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Sale Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">L{c.level}</TableCell>
                        <TableCell className="text-sm">€{c.sale_amount?.toFixed(2)}</TableCell>
                        <TableCell className="text-sm font-medium text-green-500">€{c.commission_amount?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={c.status === "paid" ? "text-green-500" : c.status === "pending" ? "text-amber-500" : ""}>{c.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Someone</DialogTitle>
            <DialogDescription>Send an invite or share your referral link directly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Email (optional — just to track)</Label>
              <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="friend@example.com" className="mt-1" type="email" />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
              <p className="text-xs text-muted-foreground mb-1">Your referral link:</p>
              <code className="text-xs break-all text-foreground">{window.location.origin}/auth?ref={profile?.referral_code}</code>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { copyReferralLink(); setShowInvite(false); }} className="gap-2">
              <Copy className="w-4 h-4" /> Copy Link
            </Button>
            <Button onClick={sendInvite} disabled={sendingInvite || !inviteEmail.trim()}>
              {sendingInvite ? "Sending…" : "Record Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
