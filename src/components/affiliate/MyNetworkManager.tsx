import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, Edit3, Trash2, Save, X, ChevronDown, ChevronRight,
  TrendingUp, Crown, Shield, Star, Award, Zap, Gem, Link2, Copy, CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PyramidNode {
  id: string;
  name: string;
  title: string | null;
  avatar_url: string | null;
  level: number;
  position: number;
  parent_id: string | null;
  earnings: number;
  total_transactions: number;
  is_placeholder: boolean;
  affiliate_partner_id: string | null;
  children?: PyramidNode[];
}

const RANKS = [
  { name: "Starter", minSales: 0, commission: 10, icon: Zap, color: "text-muted-foreground" },
  { name: "Bronze", minSales: 5, commission: 15, icon: Shield, color: "text-[hsl(30_60%_50%)]" },
  { name: "Silver", minSales: 15, commission: 20, icon: Star, color: "text-[hsl(220_20%_65%)]" },
  { name: "Gold", minSales: 30, commission: 30, icon: Award, color: "text-[hsl(45_93%_47%)]" },
  { name: "Platinum", minSales: 60, commission: 40, icon: Gem, color: "text-primary" },
  { name: "Diamond", minSales: 100, commission: 50, icon: Crown, color: "text-accent" },
];

function getRank(totalSales: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalSales >= r.minSales) rank = r;
  }
  return rank;
}

function buildSubTree(nodes: PyramidNode[], rootId: string): PyramidNode | null {
  const map = new Map<string, PyramidNode>();
  nodes.forEach(n => map.set(n.id, { ...n, children: [] }));

  let root: PyramidNode | null = null;
  nodes.forEach(n => {
    const node = map.get(n.id)!;
    if (n.id === rootId) {
      root = node;
    } else if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children!.push(node);
    }
  });

  const sortChildren = (node: PyramidNode) => {
    node.children?.sort((a, b) => a.position - b.position);
    node.children?.forEach(sortChildren);
  };
  if (root) sortChildren(root);
  return root;
}

function countDescendants(node: PyramidNode): number {
  if (!node.children) return 0;
  return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

function totalTeamEarnings(node: PyramidNode): number {
  if (!node.children) return 0;
  return node.children.reduce((sum, c) => sum + c.earnings + totalTeamEarnings(c), 0);
}

function totalTeamSales(node: PyramidNode): number {
  if (!node.children) return 0;
  return node.children.reduce((sum, c) => sum + c.total_transactions + totalTeamSales(c), 0);
}

/* ── Edit Form ─────────────────────────────────────────── */
function AgentForm({
  initial,
  parentId,
  parentLevel,
  onSave,
  onCancel,
}: {
  initial?: PyramidNode;
  parentId: string;
  parentLevel: number;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (initial) {
        const { error } = await supabase
          .from("affiliate_pyramid")
          .update({ name: name.trim(), title: title.trim() || null })
          .eq("id", initial.id);
        if (error) throw error;
        toast.success("Agent updated");
      } else {
        // Get max position among siblings
        const { data: siblings } = await supabase
          .from("affiliate_pyramid")
          .select("position")
          .eq("parent_id", parentId)
          .order("position", { ascending: false })
          .limit(1);
        const nextPos = (siblings?.[0]?.position ?? -1) + 1;

        const { error } = await supabase
          .from("affiliate_pyramid")
          .insert({
            name: name.trim(),
            title: title.trim() || null,
            parent_id: parentId,
            level: parentLevel + 1,
            position: nextPos,
            is_placeholder: false,
          });
        if (error) throw error;
        toast.success("Agent added to your network");
      }
      onSave();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="rounded-xl border border-primary/30 bg-background/95 backdrop-blur-xl p-4 mt-2"
    >
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-display tracking-[0.2em] text-muted-foreground block mb-1">NAME</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="Agent name"
          />
        </div>
        <div>
          <label className="text-[10px] font-display tracking-[0.2em] text-muted-foreground block mb-1">TITLE (OPTIONAL)</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-muted/20 border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            placeholder="e.g. Regional Agent"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={handleSubmit} disabled={saving} className="font-display tracking-wider text-xs">
            <Save className="w-3.5 h-3.5 mr-1" />
            {saving ? "Saving…" : initial ? "Update" : "Add Agent"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} className="font-display tracking-wider text-xs">
            <X className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Node Card ─────────────────────────────────────────── */
function NetworkNode({
  node,
  depth = 0,
  isOwner = false,
  onRefresh,
}: {
  node: PyramidNode;
  depth?: number;
  isOwner?: boolean;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const rank = getRank(node.total_transactions);
  const RankIcon = rank.icon;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("affiliate_pyramid")
        .delete()
        .eq("id", node.id);
      if (error) throw error;
      toast.success(`${node.name} removed from network`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.05 }}
        className={`w-full max-w-[300px] rounded-2xl border ${isOwner ? "border-primary/50 bg-primary/10" : "border-border/30 bg-muted/10"} p-4 relative`}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isOwner ? "border-primary/50 bg-primary/20" : "border-border/30 bg-muted/20"}`}>
            {node.avatar_url ? (
              <img src={node.avatar_url} alt={node.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-display text-sm font-black text-foreground/70">
                {node.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display text-sm font-bold tracking-wide text-foreground truncate">
              {node.name} {isOwner && <span className="text-primary text-[10px]">(You)</span>}
            </h4>
            {node.title && (
              <p className="text-[10px] font-display tracking-wider text-muted-foreground">{node.title}</p>
            )}
            <div className="flex items-center gap-1 mt-0.5">
              <RankIcon className={`w-3 h-3 ${rank.color}`} />
              <span className={`text-[10px] font-display font-bold ${rank.color}`}>{rank.name}</span>
            </div>
          </div>
          {hasChildren && (
            <button onClick={() => setExpanded(!expanded)} className="p-1 rounded-md hover:bg-muted/30">
              {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20">
          <div className="text-center flex-1">
            <p className="font-display text-sm font-bold text-foreground">€{node.earnings.toFixed(2)}</p>
            <p className="text-[8px] font-display tracking-wider text-muted-foreground">EARNED</p>
          </div>
          <div className="w-px h-6 bg-border/20" />
          <div className="text-center flex-1">
            <p className="font-display text-sm font-bold text-foreground">{node.total_transactions}</p>
            <p className="text-[8px] font-display tracking-wider text-muted-foreground">SALES</p>
          </div>
        </div>

        {/* Action buttons (not for the owner's own node) */}
        {!isOwner && (
          <div className="flex gap-1.5 mt-3 pt-2 border-t border-border/10">
            <button
              onClick={() => { setEditing(true); setAdding(false); }}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-muted/20 hover:bg-muted/40 text-[10px] font-display tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || (hasChildren && node.children!.length > 0)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-[10px] font-display tracking-wider text-destructive/70 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title={hasChildren ? "Remove children first" : "Remove agent"}
            >
              <Trash2 className="w-3 h-3" /> {deleting ? "…" : "Remove"}
            </button>
          </div>
        )}

        {/* Add agent button */}
        <button
          onClick={() => { setAdding(true); setEditing(false); setExpanded(true); }}
          className="mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-[10px] font-display tracking-wider text-primary transition-colors"
        >
          <UserPlus className="w-3 h-3" /> Add Agent Below
        </button>

        {/* Edit form */}
        <AnimatePresence>
          {editing && (
            <AgentForm
              initial={node}
              parentId={node.parent_id!}
              parentLevel={node.level - 1}
              onSave={() => { setEditing(false); onRefresh(); }}
              onCancel={() => setEditing(false)}
            />
          )}
        </AnimatePresence>

        {/* Add form */}
        <AnimatePresence>
          {adding && (
            <AgentForm
              parentId={node.id}
              parentLevel={node.level}
              onSave={() => { setAdding(false); onRefresh(); }}
              onCancel={() => setAdding(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Children */}
      {hasChildren && expanded && (
        <>
          <div className="w-px h-6 bg-border/30" />
          <div className="flex flex-wrap gap-4 justify-center">
            {node.children!.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-border/30" />
                <NetworkNode node={child} depth={depth + 1} onRefresh={onRefresh} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Component ────────────────────────────────────── */
export default function MyNetworkManager({ affiliateId }: { affiliateId: string }) {
  const [myNode, setMyNode] = useState<PyramidNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadNetwork = useCallback(async () => {
    setLoading(true);
    // Find the pyramid node linked to this affiliate
    const { data: myPyramidNode } = await supabase
      .from("affiliate_pyramid")
      .select("id")
      .eq("affiliate_partner_id", affiliateId)
      .maybeSingle();

    if (!myPyramidNode) {
      setMyNode(null);
      setLoading(false);
      return;
    }

    // Load all nodes, then build sub-tree from my node
    const { data: allNodes } = await supabase
      .from("affiliate_pyramid")
      .select("*")
      .order("level")
      .order("position");

    if (allNodes) {
      const tree = buildSubTree(allNodes as PyramidNode[], myPyramidNode.id);
      setMyNode(tree);
    }
    setLoading(false);
  }, [affiliateId]);

  useEffect(() => { loadNetwork(); }, [loadNetwork]);

  const inviteLink = `${window.location.origin}/affiliate?invite=${affiliateId}`;
  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!myNode) {
    return (
      <div className="text-center py-12">
        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground font-body">
          You don't have a position in the network yet. Contact your upline or admin to get placed.
        </p>
      </div>
    );
  }

  const teamSize = countDescendants(myNode);
  const teamEarnings = totalTeamEarnings(myNode);
  const teamSales = totalTeamSales(myNode);

  return (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/30 bg-muted/10 p-4 text-center">
          <p className="font-display text-xl font-black text-foreground">{teamSize}</p>
          <p className="text-[9px] font-display tracking-[0.2em] text-muted-foreground">TEAM SIZE</p>
        </div>
        <div className="rounded-xl border border-border/30 bg-muted/10 p-4 text-center">
          <p className="font-display text-xl font-black text-foreground">€{teamEarnings.toFixed(0)}</p>
          <p className="text-[9px] font-display tracking-[0.2em] text-muted-foreground">TEAM EARNINGS</p>
        </div>
        <div className="rounded-xl border border-border/30 bg-muted/10 p-4 text-center">
          <p className="font-display text-xl font-black text-foreground">{teamSales}</p>
          <p className="text-[9px] font-display tracking-[0.2em] text-muted-foreground">TEAM SALES</p>
        </div>
      </div>

      {/* Invite Link */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-display font-semibold tracking-wider text-foreground">Invite Link</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-muted/20 rounded-lg px-3 py-2 text-xs font-body text-foreground/60 overflow-x-auto whitespace-nowrap border border-border">
            {inviteLink}
          </div>
          <Button size="sm" variant="outline" onClick={copyInvite} className="shrink-0 text-xs font-display tracking-wider">
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground font-body mt-2">Share this link to recruit agents into your network.</p>
      </div>

      {/* Network Tree */}
      <div className="overflow-x-auto pb-4">
        <div className="flex justify-center min-w-[400px]">
          <NetworkNode node={myNode} isOwner onRefresh={loadNetwork} />
        </div>
      </div>
    </div>
  );
}
