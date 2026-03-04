import { useState, useEffect, createContext, useContext } from "react";
import { motion } from "framer-motion";
import { Crown, User, UserPlus, TrendingUp, ChevronDown, ChevronRight, Star, Shield, Gem, Award, Zap, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ConfettiBurst from "./ConfettiBurst";
import { playCelebrationChime } from "./celebrationSound";
import lenzoAvatar from "@/assets/lenzo-avatar.png";
import maherAvatar from "@/assets/maher-alia-avatar.jpg";

// Map known names to local avatar assets
const AVATAR_OVERRIDES: Record<string, string> = {
  "LAW el HARIRI": lenzoAvatar,
  "Lenzo Al Hariri": lenzoAvatar,
  "Lenzo Hariri": lenzoAvatar,
  "Maher Alia": maherAvatar,
  "Maher Allan": maherAvatar,
};

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
  children?: PyramidNode[];
}

// Context to pass down to cards
interface AppCtx {
  isAdmin: boolean;
  currentUserId: string | null;
  userNodeId: string | null; // pyramid node linked to current user
  onEdit: (node: PyramidNode) => void;
  onDelete: (id: string) => void;
  onAdd: (parentId: string, level: number) => void;
  onRegisterSale: (nodeId: string) => void;
  allNodes: PyramidNode[];
}
const AppContext = createContext<AppCtx>({ isAdmin: false, currentUserId: null, userNodeId: null, onEdit: () => {}, onDelete: () => {}, onAdd: () => {}, onRegisterSale: () => {}, allNodes: [] });

// Rank system based on total transactions (sales)
const RANKS = [
  { name: "Starter", minSales: 0, commission: 10, icon: Zap, color: "text-muted-foreground", 
    perks: ["Basic affiliate link", "Community access", "Weekly tips newsletter"],
    tagline: "Your journey begins here 🔥", gradient: "from-muted/30 to-muted/10" },
  { name: "Bronze", minSales: 5, commission: 15, icon: Shield, color: "text-[hsl(30_60%_50%)]",
    perks: ["15% commission rate", "Priority support", "Monthly bonus drops", "Early product access"],
    tagline: "Rising through the ranks ⚔️", gradient: "from-[hsl(30_60%_50%)]/20 to-[hsl(30_40%_30%)]/10" },
  { name: "Silver", minSales: 15, commission: 20, icon: Star, color: "text-[hsl(220_20%_65%)]",
    perks: ["20% commission rate", "Custom referral page", "Exclusive scent samples", "Team building tools", "Silver badge on profile"],
    tagline: "Becoming legendary 🌟", gradient: "from-[hsl(220_20%_65%)]/20 to-[hsl(220_15%_45%)]/10" },
  { name: "Gold", minSales: 30, commission: 30, icon: Award, color: "text-[hsl(45_93%_47%)]",
    perks: ["30% commission rate", "VIP event invitations", "Free product monthly", "Gold-tier analytics dashboard", "Personal account manager", "Exclusive Gold collection access"],
    tagline: "Elite status unlocked 👑", gradient: "from-[hsl(45_93%_47%)]/20 to-[hsl(45_80%_35%)]/10" },
  { name: "Platinum", minSales: 60, commission: 40, icon: Gem, color: "text-primary",
    perks: ["40% commission rate", "Revenue share on team sales", "Custom co-branded products", "Platinum retreat access", "Dedicated marketing team", "First access to new launches", "Quarterly luxury gift box"],
    tagline: "Top 1% — Unstoppable 💎", gradient: "from-primary/20 to-primary/5" },
  { name: "Diamond", minSales: 100, commission: 50, icon: Crown, color: "text-accent",
    perks: ["50% maximum commission", "Equity partnership options", "Global ambassador status", "All-expenses-paid annual summit", "Custom fragrance line", "Lifetime VIP membership", "Direct CEO access", "Legacy wealth building"],
    tagline: "The pinnacle of excellence 🏆", gradient: "from-accent/25 to-accent/5" },
];

function getRank(totalSales: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (totalSales >= r.minSales) rank = r;
  }
  const nextRank = RANKS[RANKS.indexOf(rank) + 1];
  return { ...rank, nextRank };
}

function buildTree(nodes: PyramidNode[]): PyramidNode[] {
  const map = new Map<string, PyramidNode>();
  const roots: PyramidNode[] = [];

  nodes.forEach(n => map.set(n.id, { ...n, children: [] }));
  nodes.forEach(n => {
    const node = map.get(n.id)!;
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children!.push(node);
    } else if (!n.parent_id) {
      roots.push(node);
    }
  });

  const sortChildren = (node: PyramidNode) => {
    node.children?.sort((a, b) => a.position - b.position);
    node.children?.forEach(sortChildren);
  };
  roots.forEach(sortChildren);

  return roots;
}

const LEVEL_STYLES = [
  { bg: "bg-accent/20", border: "border-accent/50", text: "text-accent", glow: "shadow-accent/20", icon: Crown },
  { bg: "bg-primary/20", border: "border-primary/50", text: "text-primary", glow: "shadow-primary/20", icon: Crown },
  { bg: "bg-[hsl(45_93%_47%)]/15", border: "border-[hsl(45_93%_47%)]/40", text: "text-[hsl(45_93%_47%)]", glow: "shadow-[hsl(45_93%_47%)]/10", icon: User },
  { bg: "bg-[hsl(220_20%_65%)]/10", border: "border-[hsl(220_20%_65%)]/30", text: "text-[hsl(220_20%_65%)]", glow: "", icon: User },
  { bg: "bg-muted/15", border: "border-muted-foreground/25", text: "text-muted-foreground", glow: "", icon: User },
  { bg: "bg-muted/10", border: "border-border/20", text: "text-muted-foreground/60", glow: "", icon: User },
];

function PyramidCard({ node, depth = 0 }: { node: PyramidNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true);
  const style = LEVEL_STYLES[Math.min(node.level, LEVEL_STYLES.length - 1)];
  const hasChildren = node.children && node.children.length > 0;
  const rank = getRank(node.total_transactions);
  const RankIcon = rank.icon;
  const { isAdmin, onEdit, onDelete, onAdd, onRegisterSale, currentUserId, userNodeId } = useContext(AppContext);

  if (node.is_placeholder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.05 }}
        className="flex flex-col items-center"
      >
        <div className="w-full max-w-[180px] rounded-2xl border-2 border-dashed border-border/30 bg-muted/5 p-4 text-center relative group">
          <div className="w-10 h-10 rounded-full bg-muted/10 border border-border/20 mx-auto mb-2 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-muted-foreground/30" />
          </div>
          <p className="text-[11px] font-display tracking-[0.2em] text-muted-foreground/40 uppercase">Available Slot</p>
          <p className="text-[9px] text-muted-foreground/30 mt-1">Join & claim this position</p>
          {/* Admin controls on placeholder */}
          {isAdmin && (
            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                className="w-6 h-6 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Pencil className="w-3 h-3" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
                className="w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: depth * 0.08, type: "spring", stiffness: 200 }}
      className="flex flex-col items-center"
    >
      {/* Card */}
      <div
        className={`w-full max-w-[200px] rounded-2xl border-2 ${style.border} ${style.bg} p-3 text-center relative cursor-pointer transition-all hover:scale-[1.03] backdrop-blur-sm ${style.glow ? `shadow-xl ${style.glow}` : ""} group`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Admin controls */}
        {isAdmin && (
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); onEdit(node); }}
              className="w-6 h-6 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
              <Pencil className="w-3 h-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onAdd(node.id, node.level + 1); }}
              className="w-6 h-6 rounded-full bg-accent/90 text-accent-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
              <Plus className="w-3 h-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              className="w-6 h-6 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Avatar */}
        <div className={`rounded-full mx-auto mb-2 flex items-center justify-center border-2 ${style.border} ${style.bg} shadow-lg ${style.glow}`}
          style={{ width: 48, height: 48 }}
        >
          {(AVATAR_OVERRIDES[node.name] || node.avatar_url) ? (
            <img src={AVATAR_OVERRIDES[node.name] || node.avatar_url!} alt={node.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className={`font-display text-base font-black ${style.text}`}>
              {node.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          )}
        </div>

        {/* Name */}
        <h4 className="font-display text-xs font-black tracking-wide text-foreground">{node.name}</h4>
        {node.title && (
          <p className="text-[10px] font-display tracking-[0.15em] text-muted-foreground mt-0.5">{node.title}</p>
        )}

        {/* Rank Badge */}
        <div className="flex items-center justify-center gap-1 mt-1">
          <RankIcon className={`w-3 h-3 ${rank.color}`} />
          <span className={`text-[10px] font-display font-bold tracking-wider ${rank.color}`}>{rank.name}</span>
          <span className="text-[9px] font-display font-semibold text-accent ml-0.5">({rank.commission}%)</span>
        </div>

        {/* Rank Progress */}
        {rank.nextRank && (
          <div className="mt-2 px-2">
            <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((node.total_transactions - rank.minSales) / (rank.nextRank.minSales - rank.minSales)) * 100, 100)}%` }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`h-full rounded-full bg-gradient-to-r from-primary to-accent`}
              />
            </div>
            <p className="text-[8px] text-muted-foreground/50 mt-1">
              {rank.nextRank.minSales - node.total_transactions} sales to {rank.nextRank.name}
            </p>
          </div>
        )}

        {/* Earnings */}
        <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-border/20">
          <div className="text-center">
            <p className={`font-display text-xs font-black ${style.text}`}>€{node.earnings.toFixed(0)}</p>
            <p className="text-[8px] font-display tracking-wider text-muted-foreground/60">EARNED</p>
          </div>
          <div className="w-px h-5 bg-border/20" />
          <div className="text-center">
            <p className={`font-display text-xs font-black ${style.text}`}>{node.total_transactions}</p>
            <p className="text-[8px] font-display tracking-wider text-muted-foreground/60">SALES</p>
          </div>
        </div>

        {/* Expand indicator */}
        {hasChildren && (
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-background border border-border/30 flex items-center justify-center shadow-sm">
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Connector line */}
      {hasChildren && expanded && (
        <>
          <div className="w-px h-8 bg-border/30" />
          <div className="relative">
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border/30" 
                style={{ width: `${Math.max((node.children!.length - 1) * 260, 100)}px` }} />
            )}
            <div className="flex gap-3 items-start pt-0 flex-wrap justify-center">
              {node.children!.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-6 bg-border/30" />
                  <PyramidCard node={child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

/* Rank Progression Table */
function RankProgression() {
  const [activeRank, setActiveRank] = useState<number | null>(null);
  const [confettiIdx, setConfettiIdx] = useState<number | null>(null);

  return (
    <div className="mt-10 pt-8 border-t border-border/20">
      <h4 className="font-display text-lg font-bold tracking-wide text-foreground text-center mb-2">
        Rank Progression
      </h4>
      <p className="text-xs text-muted-foreground text-center mb-6 font-body">Tap a rank to reveal its <span className="text-accent font-bold">exclusive rewards</span></p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {RANKS.map((rank, i) => {
          const Icon = rank.icon;
          const isActive = activeRank === i;
          return (
            <motion.div
              key={rank.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              <motion.div
                onClick={() => {
                  const opening = !isActive;
                  setActiveRank(opening ? i : null);
                  if (opening) {
                    setConfettiIdx(i);
                    playCelebrationChime();
                    setTimeout(() => setConfettiIdx(null), 1200);
                  }
                }}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`cursor-pointer flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? `bg-gradient-to-b ${rank.gradient} border-current shadow-lg shadow-current/10 ring-1 ring-current/20`
                    : "bg-muted/10 border-border/20 hover:border-primary/30"
                } ${rank.color}`}
              >
                <motion.div
                  animate={isActive ? { rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.3, 1.1] } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className={`w-7 h-7 mb-2 ${rank.color} ${isActive ? "drop-shadow-lg" : ""}`} />
                </motion.div>
                <span className={`text-xs font-display font-bold tracking-wider ${rank.color}`}>{rank.name}</span>
                <span className="text-sm font-display font-black text-accent mt-1">{rank.commission}%</span>
                <span className="text-[10px] text-muted-foreground">
                  {rank.minSales === 0 ? "Start" : `${rank.minSales}+ sales`}
                </span>
                <ConfettiBurst trigger={confettiIdx === i} intensity={i} />
                {!isActive && (
                  <motion.div
                    className={`absolute inset-0 rounded-xl border ${rank.color} pointer-events-none`}
                    animate={{ opacity: [0, 0.3, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    style={{ borderColor: "currentColor" }}
                  />
                )}
              </motion.div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`absolute z-50 left-1/2 -translate-x-1/2 top-full mt-3 w-[260px] rounded-2xl border border-border/30 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/30 p-5`}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-background/95 border-l border-t border-border/30" />
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-5 h-5 ${rank.color}`} />
                    <span className={`font-display font-black text-sm tracking-wider ${rank.color}`}>{rank.name}</span>
                    <span className="ml-auto text-xs font-display font-bold text-accent">{rank.commission}%</span>
                  </div>
                  <p className="text-[11px] font-display font-bold tracking-wide text-foreground/80 mb-3 pb-2 border-b border-border/15">
                    {rank.tagline}
                  </p>
                  <ul className="space-y-1.5">
                    {rank.perks.map((perk, pi) => (
                      <motion.li
                        key={perk}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: pi * 0.05 }}
                        className="flex items-start gap-2 text-[11px] font-body text-muted-foreground"
                      >
                        <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${rank.color.replace("text-", "bg-")}`} />
                        {perk}
                      </motion.li>
                    ))}
                  </ul>
                  {rank.minSales > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/15">
                      <p className="text-[10px] font-display tracking-wider text-muted-foreground/60 text-center">
                        Reach <span className="text-accent font-bold">{rank.minSales} sales</span> to unlock
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* Edit Dialog for admin */
const levelLabels = ["Founder", "Director", "Manager", "Team Lead", "Associate", "Member"];

function NodeEditDialog({ open, onOpenChange, editing, setEditing, onSave, allNodes }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Partial<PyramidNode> | null;
  setEditing: (v: Partial<PyramidNode> | null) => void;
  onSave: () => void;
  allNodes: PyramidNode[];
}) {
  if (!editing) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{editing.id ? "Edit Node" : "Add Node"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Level</Label>
              <Select value={String(editing.level ?? 0)} onValueChange={v => setEditing({ ...editing, level: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levelLabels.map((label, i) => <SelectItem key={i} value={String(i)}>{label} (Level {i})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Parent</Label>
              <Select value={editing.parent_id || "none"} onValueChange={v => setEditing({ ...editing, parent_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root)</SelectItem>
                  {allNodes.filter(n => n.id !== editing.id && !n.is_placeholder).map(n => (
                    <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Earnings (€)</Label>
              <Input type="number" step="0.01" value={editing.earnings ?? 0} onChange={e => setEditing({ ...editing, earnings: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Sales</Label>
              <Input type="number" value={editing.total_transactions ?? 0} onChange={e => setEditing({ ...editing, total_transactions: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Position</Label>
              <Input type="number" value={editing.position ?? 0} onChange={e => setEditing({ ...editing, position: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Avatar URL</Label>
            <Input value={editing.avatar_url || ""} onChange={e => setEditing({ ...editing, avatar_url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={editing.is_placeholder ?? false} onCheckedChange={v => setEditing({ ...editing, is_placeholder: v })} />
            <Label className="text-xs text-muted-foreground">Empty placeholder slot</Label>
          </div>
          <Button onClick={onSave} className="w-full">{editing.id ? "Update" : "Create"} Node</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AffiliateNetworkPyramid() {
  const [nodes, setNodes] = useState<PyramidNode[]>([]);
  const [flatNodes, setFlatNodes] = useState<PyramidNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<Partial<PyramidNode> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadPyramid();
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(!!data);
  };

  const loadPyramid = async () => {
    const { data, error } = await supabase
      .from("affiliate_pyramid")
      .select("*")
      .order("level")
      .order("position");

    if (!error && data) {
      setFlatNodes(data as PyramidNode[]);
      const tree = buildTree(data as PyramidNode[]);
      setNodes(tree);
    }
    setLoading(false);
  };

  const handleEdit = (node: PyramidNode) => {
    setEditing({ ...node });
    setDialogOpen(true);
  };

  const handleAdd = (parentId: string, level: number) => {
    setEditing({
      name: "",
      title: "",
      avatar_url: "",
      level,
      position: 0,
      parent_id: parentId,
      earnings: 0,
      total_transactions: 0,
      is_placeholder: false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this node? Children will be unlinked.")) return;
    const { error } = await supabase.from("affiliate_pyramid").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Node deleted");
    loadPyramid();
  };

  const handleSave = async () => {
    if (!editing?.name) { toast.error("Name is required"); return; }
    const payload = {
      name: editing.name,
      title: editing.title || null,
      avatar_url: editing.avatar_url || null,
      level: editing.level ?? 0,
      position: editing.position ?? 0,
      parent_id: editing.parent_id || null,
      earnings: editing.earnings ?? 0,
      total_transactions: editing.total_transactions ?? 0,
      is_placeholder: editing.is_placeholder ?? false,
    };

    if (editing.id) {
      const { error } = await supabase.from("affiliate_pyramid").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Node updated");
    } else {
      const { error } = await supabase.from("affiliate_pyramid").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Node added");
    }
    setDialogOpen(false);
    setEditing(null);
    loadPyramid();
  };

  const appCtx: AppCtx = {
    isAdmin,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onAdd: handleAdd,
    allNodes: flatNodes,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={appCtx}>
      <div>
        {/* Header with floral ornaments */}
        <div className="relative flex flex-col items-center mb-12">
          <svg className="absolute -left-2 -top-4 w-28 h-28 text-accent/20" viewBox="0 0 120 120" fill="none">
            <path d="M10 60 C10 30, 30 10, 60 10 C45 25, 35 45, 35 60 C35 45, 25 35, 10 35 C25 45, 30 55, 30 60" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
            <path d="M15 80 C15 55, 35 40, 55 40 C42 50, 38 62, 38 75" stroke="currentColor" strokeWidth="1" fill="none"/>
            <circle cx="60" cy="10" r="3" fill="currentColor" fillOpacity="0.3"/>
            <circle cx="10" cy="35" r="2.5" fill="currentColor" fillOpacity="0.25"/>
            <circle cx="55" cy="40" r="2" fill="currentColor" fillOpacity="0.2"/>
            <path d="M5 95 Q20 85, 25 70 Q30 85, 45 90" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.05"/>
          </svg>
          <svg className="absolute -right-2 -top-4 w-28 h-28 text-primary/20 scale-x-[-1]" viewBox="0 0 120 120" fill="none">
            <path d="M10 60 C10 30, 30 10, 60 10 C45 25, 35 45, 35 60 C35 45, 25 35, 10 35 C25 45, 30 55, 30 60" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08"/>
            <path d="M15 80 C15 55, 35 40, 55 40 C42 50, 38 62, 38 75" stroke="currentColor" strokeWidth="1" fill="none"/>
            <circle cx="60" cy="10" r="3" fill="currentColor" fillOpacity="0.3"/>
            <circle cx="10" cy="35" r="2.5" fill="currentColor" fillOpacity="0.25"/>
            <circle cx="55" cy="40" r="2" fill="currentColor" fillOpacity="0.2"/>
            <path d="M5 95 Q20 85, 25 70 Q30 85, 45 90" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.05"/>
          </svg>

          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-accent" />
            <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Network Hierarchy</h3>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            Your position in the affiliate network. Make sales to climb the ranks and unlock higher commissions.
          </p>

          {/* Admin: Add root node button */}
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-2 border-accent/40 text-accent hover:bg-accent/10"
              onClick={() => handleAdd("", 0)}
            >
              <Plus className="w-4 h-4" /> Add Root Node
            </Button>
          )}

          <div className="flex items-center gap-3 mt-5 w-full max-w-md">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent/30 to-accent/10" />
            <svg className="w-8 h-8 text-accent/40" viewBox="0 0 32 32" fill="none">
              <path d="M16 4 C12 8, 10 12, 16 16 C22 12, 20 8, 16 4Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="0.8"/>
              <path d="M4 16 C8 12, 12 10, 16 16 C12 22, 8 20, 4 16Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8"/>
              <path d="M28 16 C24 12, 20 10, 16 16 C20 22, 24 20, 28 16Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8"/>
              <path d="M16 28 C12 24, 10 20, 16 16 C22 20, 20 24, 16 28Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="0.8"/>
              <circle cx="16" cy="16" r="2.5" fill="currentColor" fillOpacity="0.5"/>
            </svg>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/30 to-primary/10" />
          </div>
        </div>

        {/* Pyramid chart */}
        <div className="relative overflow-x-auto pb-8">
          <svg className="absolute left-0 top-1/4 w-12 h-40 text-accent/10 pointer-events-none" viewBox="0 0 40 140" fill="none">
            <path d="M20 0 C20 30, 5 50, 5 70 C5 90, 15 110, 20 140" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M5 35 C-5 28, -2 18, 8 25" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15"/>
            <path d="M5 65 C-8 58, -4 45, 8 55" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.12"/>
            <path d="M10 95 C0 88, 2 78, 14 85" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
          </svg>
          <svg className="absolute right-0 top-1/4 w-12 h-40 text-primary/10 pointer-events-none scale-x-[-1]" viewBox="0 0 40 140" fill="none">
            <path d="M20 0 C20 30, 5 50, 5 70 C5 90, 15 110, 20 140" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M5 35 C-5 28, -2 18, 8 25" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.15"/>
            <path d="M5 65 C-8 58, -4 45, 8 55" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.12"/>
            <path d="M10 95 C0 88, 2 78, 14 85" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1"/>
          </svg>

          <div className="flex justify-center min-w-[700px]">
            {nodes.map(root => (
              <PyramidCard key={root.id} node={root} />
            ))}
          </div>
        </div>

        <RankProgression />

        <div className="flex flex-wrap items-center justify-center gap-5 mt-8 pt-6 border-t border-border/20">
          {[
            { label: "Founder", color: "bg-accent/30 border-accent/50" },
            { label: "Director", color: "bg-primary/30 border-primary/50" },
            { label: "Manager", color: "bg-[hsl(45_93%_47%)]/20 border-[hsl(45_93%_47%)]/40" },
            { label: "Available Slot", color: "bg-muted/10 border-border/30 border-dashed" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-sm border ${item.color}`} />
              <span className="text-[11px] font-display tracking-wider text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Admin Edit Dialog */}
        <NodeEditDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editing={editing}
          setEditing={setEditing}
          onSave={handleSave}
          allNodes={flatNodes}
        />
      </div>
    </AppContext.Provider>
  );
}
