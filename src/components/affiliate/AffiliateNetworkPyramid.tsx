import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, User, UserPlus, TrendingUp, ChevronDown, ChevronRight, Star, Shield, Gem, Award, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

// Rank system based on total transactions (sales)
const RANKS = [
  { name: "Starter", minSales: 0, icon: Zap, color: "text-muted-foreground" },
  { name: "Bronze", minSales: 5, icon: Shield, color: "text-[hsl(30_60%_50%)]" },
  { name: "Silver", minSales: 15, icon: Star, color: "text-[hsl(220_20%_65%)]" },
  { name: "Gold", minSales: 30, icon: Award, color: "text-[hsl(45_93%_47%)]" },
  { name: "Platinum", minSales: 60, icon: Gem, color: "text-primary" },
  { name: "Diamond", minSales: 100, icon: Crown, color: "text-accent" },
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
  { bg: "bg-muted/20", border: "border-muted-foreground/30", text: "text-muted-foreground", glow: "", icon: User },
  { bg: "bg-muted/10", border: "border-border/30", text: "text-muted-foreground/60", glow: "", icon: User },
];

function PyramidCard({ node, depth = 0 }: { node: PyramidNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const style = LEVEL_STYLES[Math.min(node.level, LEVEL_STYLES.length - 1)];
  const hasChildren = node.children && node.children.length > 0;
  const rank = getRank(node.total_transactions);
  const RankIcon = rank.icon;

  if (node.is_placeholder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.05 }}
        className="flex flex-col items-center"
      >
        <div className="w-full max-w-[220px] rounded-2xl border-2 border-dashed border-border/30 bg-muted/5 p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-muted/10 border border-border/20 mx-auto mb-3 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-muted-foreground/30" />
          </div>
          <p className="text-[11px] font-display tracking-[0.2em] text-muted-foreground/40 uppercase">Available Slot</p>
          <p className="text-[9px] text-muted-foreground/30 mt-1">Join & claim this position</p>
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
        className={`w-full max-w-[280px] rounded-2xl border-2 ${style.border} ${style.bg} p-6 text-center relative cursor-pointer transition-all hover:scale-[1.03] backdrop-blur-sm ${style.glow ? `shadow-xl ${style.glow}` : ""}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className={`w-18 h-18 rounded-full mx-auto mb-3 flex items-center justify-center border-2 ${style.border} ${style.bg} shadow-lg ${style.glow}`}
          style={{ width: 72, height: 72 }}
        >
          {node.avatar_url ? (
            <img src={node.avatar_url} alt={node.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className={`font-display text-2xl font-black ${style.text}`}>
              {node.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          )}
        </div>

        {/* Name */}
        <h4 className="font-display text-base font-black tracking-wide text-foreground">{node.name}</h4>
        {node.title && (
          <p className="text-[10px] font-display tracking-[0.15em] text-muted-foreground mt-0.5">{node.title}</p>
        )}

        {/* Rank Badge */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <RankIcon className={`w-4 h-4 ${rank.color}`} />
          <span className={`text-xs font-display font-bold tracking-wider ${rank.color}`}>{rank.name}</span>
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
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/20">
          <div className="text-center">
            <p className={`font-display text-base font-black ${style.text}`}>€{node.earnings.toFixed(2)}</p>
            <p className="text-[9px] font-display tracking-wider text-muted-foreground/60">EARNED</p>
          </div>
          <div className="w-px h-7 bg-border/20" />
          <div className="text-center">
            <p className={`font-display text-base font-black ${style.text}`}>{node.total_transactions}</p>
            <p className="text-[9px] font-display tracking-wider text-muted-foreground/60">SALES</p>
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
            <div className="flex gap-6 items-start pt-0">
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
  return (
    <div className="mt-10 pt-8 border-t border-border/20">
      <h4 className="font-display text-lg font-bold tracking-wide text-foreground text-center mb-6">
        Rank Progression
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {RANKS.map((rank, i) => {
          const Icon = rank.icon;
          return (
            <motion.div
              key={rank.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center p-4 rounded-xl bg-muted/10 border border-border/20 hover:border-primary/30 transition-colors"
            >
              <Icon className={`w-6 h-6 mb-2 ${rank.color}`} />
              <span className={`text-xs font-display font-bold tracking-wider ${rank.color}`}>{rank.name}</span>
              <span className="text-[10px] text-muted-foreground mt-1">
                {rank.minSales === 0 ? "Start" : `${rank.minSales}+ sales`}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function AffiliateNetworkPyramid() {
  const [nodes, setNodes] = useState<PyramidNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPyramid();
  }, []);

  const loadPyramid = async () => {
    const { data, error } = await supabase
      .from("affiliate_pyramid")
      .select("*")
      .order("level")
      .order("position");

    if (!error && data) {
      const tree = buildTree(data as PyramidNode[]);
      setNodes(tree);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-6 h-6 text-accent" />
        <h3 className="font-display text-xl font-bold tracking-wide text-foreground">Network Hierarchy</h3>
      </div>
      <p className="text-sm text-muted-foreground font-body mb-10">
        Your position in the affiliate network. Make sales to climb the ranks and unlock higher commissions.
      </p>

      <div className="overflow-x-auto pb-8">
        <div className="flex justify-center min-w-[700px]">
          {nodes.map(root => (
            <PyramidCard key={root.id} node={root} />
          ))}
        </div>
      </div>

      {/* Rank Progression */}
      <RankProgression />

      {/* Legend */}
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
    </div>
  );
}
