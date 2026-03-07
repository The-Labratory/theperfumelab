import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Search, Pencil, Trash2, AlertTriangle, ChevronRight, ChevronDown,
  Shield, Crown, ArrowRight, RefreshCw, Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ReferralManagementPage() {
  const [relationships, setRelationships] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [fraudFlags, setFraudFlags] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [commissionRules, setCommissionRules] = useState<any[]>([]);
  const [rankRules, setRankRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Reassign dialog
  const [reassignRow, setReassignRow] = useState<any | null>(null);
  const [newParentId, setNewParentId] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit commission rule
  const [editRule, setEditRule] = useState<any | null>(null);
  const [editRank, setEditRank] = useState<any | null>(null);

  const loadAll = async () => {
    setLoading(true);
    const [relRes, invRes, flagsRes, eventsRes, rulesRes, ranksRes] = await Promise.all([
      (supabase.from("referral_relationships" as any) as any).select("*").order("created_at", { ascending: false }).limit(200),
      (supabase.from("referral_invites" as any) as any).select("*").order("created_at", { ascending: false }).limit(200),
      (supabase.from("fraud_flags" as any) as any).select("*").order("created_at", { ascending: false }).limit(100),
      (supabase.from("referral_events" as any) as any).select("*").order("created_at", { ascending: false }).limit(100),
      (supabase.from("commission_rules" as any) as any).select("*").order("level"),
      (supabase.from("rank_rules" as any) as any).select("*").order("rank_level"),
    ]);
    setRelationships(relRes.data || []);
    setInvites(invRes.data || []);
    setFraudFlags(flagsRes.data || []);
    setEvents(eventsRes.data || []);
    setCommissionRules(rulesRes.data || []);
    setRankRules(ranksRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleReassign = async () => {
    if (!reassignRow || !newParentId.trim()) return;
    setSaving(true);
    try {
      // Prevent self-assignment
      if (newParentId.trim() === reassignRow.user_id) {
        toast.error("Cannot assign user as their own parent");
        return;
      }

      const { error } = await (supabase.from("referral_relationships" as any) as any)
        .update({ parent_user_id: newParentId.trim() })
        .eq("id", reassignRow.id);
      if (error) throw error;

      await supabase.from("admin_audit_logs").insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id || "",
        action: "referral_reassign",
        entity_type: "referral_relationships",
        entity_id: reassignRow.id,
        old_values: { parent_user_id: reassignRow.parent_user_id },
        new_values: { parent_user_id: newParentId.trim() },
      }]);

      toast.success("Relationship reassigned");
      setReassignRow(null);
      setNewParentId("");
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReviewFlag = async (flagId: string, status: string) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await (supabase.from("fraud_flags" as any) as any)
        .update({ status, reviewed_by: userId, reviewed_at: new Date().toISOString() })
        .eq("id", flagId);
      if (error) throw error;
      toast.success(`Flag marked as ${status}`);
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const updateCommissionRule = async () => {
    if (!editRule) return;
    setSaving(true);
    try {
      const { id, ...payload } = editRule;
      payload.updated_at = new Date().toISOString();
      payload.updated_by = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await (supabase.from("commission_rules" as any) as any).update(payload).eq("id", id);
      if (error) throw error;
      toast.success("Commission rule updated");
      setEditRule(null);
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateRankRule = async () => {
    if (!editRank) return;
    setSaving(true);
    try {
      const { id, ...payload } = editRank;
      const { error } = await (supabase.from("rank_rules" as any) as any).update(payload).eq("id", id);
      if (error) throw error;
      toast.success("Rank rule updated");
      setEditRank(null);
      loadAll();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredRels = search
    ? relationships.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : relationships;

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">Referral Network Management</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Relationships", value: relationships.length },
          { label: "Invites Sent", value: invites.length },
          { label: "Accepted", value: invites.filter(i => i.status === "accepted").length },
          { label: "Fraud Flags", value: fraudFlags.filter(f => f.status === "open").length },
          { label: "Events", value: events.length },
        ].map(s => (
          <div key={s.label} className="glass-surface rounded-xl p-3 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="relationships" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-muted/30">
          <TabsTrigger value="relationships">Tree</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
          <TabsTrigger value="fraud">Fraud</TabsTrigger>
          <TabsTrigger value="commissions">Commission Rules</TabsTrigger>
          <TabsTrigger value="ranks">Rank Rules</TabsTrigger>
        </TabsList>

        {/* Relationships */}
        <TabsContent value="relationships">
          <div className="glass-surface rounded-xl p-4 mb-3">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Search by user ID</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
              <Button onClick={loadAll} variant="outline" size="sm" className="gap-1.5"><RefreshCw className="w-4 h-4" /> Refresh</Button>
            </div>
          </div>
          <div className="glass-surface rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Parent ID</TableHead>
                  <TableHead>Depth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRels.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs font-mono">{r.user_id?.slice(0, 8)}…</TableCell>
                    <TableCell className="text-xs font-mono">{r.parent_user_id ? r.parent_user_id.slice(0, 8) + "…" : "ROOT"}</TableCell>
                    <TableCell><Badge variant="outline">{r.depth}</Badge></TableCell>
                    <TableCell><Badge variant={r.status === "confirmed" ? "default" : "outline"}>{r.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.confirmed_at ? new Date(r.confirmed_at).toLocaleDateString() : "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setReassignRow(r); setNewParentId(r.parent_user_id || ""); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Invites */}
        <TabsContent value="invites">
          <div className="glass-surface rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Inviter</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Accepted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-xs font-mono">{inv.invite_code}</TableCell>
                    <TableCell className="text-xs font-mono">{inv.inviter_user_id?.slice(0, 8)}…</TableCell>
                    <TableCell className="text-xs">{inv.invited_email || "—"}</TableCell>
                    <TableCell><Badge variant={inv.status === "accepted" ? "default" : "outline"}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.accepted_at ? new Date(inv.accepted_at).toLocaleDateString() : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Fraud Flags */}
        <TabsContent value="fraud">
          <div className="glass-surface rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fraudFlags.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No fraud flags</TableCell></TableRow>
                ) : fraudFlags.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="text-xs font-mono">{f.user_id?.slice(0, 8)}…</TableCell>
                    <TableCell className="text-xs">{f.flag_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={f.severity === "critical" ? "text-destructive border-destructive/30" : f.severity === "high" ? "text-amber-500 border-amber-500/30" : ""}>
                        {f.severity}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant={f.status === "open" ? "destructive" : "outline"}>{f.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {f.status === "open" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleReviewFlag(f.id, "resolved")}>Resolve</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleReviewFlag(f.id, "dismissed")}>Dismiss</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Commission Rules */}
        <TabsContent value="commissions">
          <div className="glass-surface rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Commission %</TableHead>
                  <TableHead>Min Referrals</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissionRules.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">{r.rule_name}</TableCell>
                    <TableCell>{r.level}</TableCell>
                    <TableCell className="font-medium text-green-500">{r.commission_pct}%</TableCell>
                    <TableCell>{r.min_qualified_referrals}</TableCell>
                    <TableCell><Badge variant={r.is_active ? "default" : "outline"}>{r.is_active ? "Active" : "Off"}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditRule({ ...r })}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Rank Rules */}
        <TabsContent value="ranks">
          <div className="glass-surface rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Direct Refs</TableHead>
                  <TableHead>Team Sales</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankRules.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.badge_color }} />
                        <span className="text-sm font-medium">{r.rank_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{r.rank_level}</TableCell>
                    <TableCell>{r.min_direct_referrals}</TableCell>
                    <TableCell>€{r.min_team_sales}</TableCell>
                    <TableCell><Badge variant={r.is_active ? "default" : "outline"}>{r.is_active ? "Active" : "Off"}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditRank({ ...r })}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reassign Dialog */}
      <Dialog open={!!reassignRow} onOpenChange={(o) => !o && setReassignRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Parent</DialogTitle>
            <DialogDescription>Change the upline for user {reassignRow?.user_id?.slice(0, 12)}…</DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-xs text-muted-foreground">New Parent User ID</Label>
            <Input value={newParentId} onChange={e => setNewParentId(e.target.value)} className="mt-1 font-mono text-xs" placeholder="UUID of new parent" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignRow(null)}>Cancel</Button>
            <Button onClick={handleReassign} disabled={saving}>{saving ? "Saving…" : "Reassign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Commission Rule Dialog */}
      <Dialog open={!!editRule} onOpenChange={(o) => !o && setEditRule(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Commission Rule</DialogTitle></DialogHeader>
          {editRule && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Rule Name</Label>
                <Input value={editRule.rule_name} onChange={e => setEditRule({ ...editRule, rule_name: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Level</Label>
                  <Input type="number" value={editRule.level} onChange={e => setEditRule({ ...editRule, level: +e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Commission %</Label>
                  <Input type="number" step="0.5" value={editRule.commission_pct} onChange={e => setEditRule({ ...editRule, commission_pct: +e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Min Qualified Referrals</Label>
                <Input type="number" value={editRule.min_qualified_referrals} onChange={e => setEditRule({ ...editRule, min_qualified_referrals: +e.target.value })} className="mt-1" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRule(null)}>Cancel</Button>
            <Button onClick={updateCommissionRule} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rank Rule Dialog */}
      <Dialog open={!!editRank} onOpenChange={(o) => !o && setEditRank(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Rank Rule</DialogTitle></DialogHeader>
          {editRank && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Rank Name</Label>
                  <Input value={editRank.rank_name} onChange={e => setEditRank({ ...editRank, rank_name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rank Level</Label>
                  <Input type="number" value={editRank.rank_level} onChange={e => setEditRank({ ...editRank, rank_level: +e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Direct Referrals</Label>
                  <Input type="number" value={editRank.min_direct_referrals} onChange={e => setEditRank({ ...editRank, min_direct_referrals: +e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Min Team Sales (€)</Label>
                  <Input type="number" value={editRank.min_team_sales} onChange={e => setEditRank({ ...editRank, min_team_sales: +e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Badge Color</Label>
                <Input type="color" value={editRank.badge_color} onChange={e => setEditRank({ ...editRank, badge_color: e.target.value })} className="mt-1 h-10 w-20" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRank(null)}>Cancel</Button>
            <Button onClick={updateRankRule} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
