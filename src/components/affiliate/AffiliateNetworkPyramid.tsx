import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, User, UserPlus, DollarSign, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
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

  // Sort children by position
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

  if (node.is_placeholder) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: depth * 0.05 }}
        className="flex flex-col items-center"
      >
        <div className="w-full max-w-[180px] rounded-xl border-2 border-dashed border-border/30 bg-muted/5 p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/10 border border-border/20 mx-auto mb-2 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-muted-foreground/30" />
          </div>
          <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground/40 uppercase">Available</p>
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
        className={`w-full max-w-[220px] rounded-xl border ${style.border} ${style.bg} p-4 text-center relative cursor-pointer transition-all hover:scale-[1.02] ${style.glow ? `shadow-lg ${style.glow}` : ""}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center border ${style.border} ${style.bg}`}>
          {node.avatar_url ? (
            <img src={node.avatar_url} alt={node.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <style.icon className={`w-5 h-5 ${style.text}`} />
          )}
        </div>

        {/* Name */}
        <h4 className="font-display text-sm font-bold tracking-wide text-foreground">{node.name}</h4>
        {node.title && (
          <p className="text-[9px] font-display tracking-[0.15em] text-muted-foreground mt-0.5">{node.title}</p>
        )}

        {/* Earnings */}
        <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-border/20">
          <div className="text-center">
            <p className={`font-display text-sm font-black ${style.text}`}>€{node.earnings.toFixed(2)}</p>
            <p className="text-[8px] font-display tracking-wider text-muted-foreground/60">EARNED</p>
          </div>
          <div className="w-px h-6 bg-border/20" />
          <div className="text-center">
            <p className={`font-display text-sm font-black ${style.text}`}>{node.total_transactions}</p>
            <p className="text-[8px] font-display tracking-wider text-muted-foreground/60">TXN</p>
          </div>
        </div>

        {/* Expand indicator */}
        {hasChildren && (
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border border-border/30 flex items-center justify-center">
            {expanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* Connector line */}
      {hasChildren && expanded && (
        <>
          <div className="w-px h-6 bg-border/30" />
          <div className="relative">
            {/* Horizontal connector */}
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-border/30" 
                style={{ width: `${Math.max((node.children!.length - 1) * 200, 100)}px` }} />
            )}
            <div className="flex gap-4 items-start pt-0">
              {node.children!.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border/30" />
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
        <TrendingUp className="w-5 h-5 text-accent" />
        <h3 className="font-display text-base font-semibold tracking-wide text-foreground">Network Hierarchy</h3>
      </div>
      <p className="text-xs text-muted-foreground font-body mb-8">
        Your position in the affiliate network. Each node shows earnings per transaction.
      </p>

      <div className="overflow-x-auto pb-8">
        <div className="flex justify-center min-w-[600px]">
          {nodes.map(root => (
            <PyramidCard key={root.id} node={root} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-border/20">
        {[
          { label: "Founder", color: "bg-accent/30 border-accent/50" },
          { label: "Director", color: "bg-primary/30 border-primary/50" },
          { label: "Manager", color: "bg-[hsl(45_93%_47%)]/20 border-[hsl(45_93%_47%)]/40" },
          { label: "Available Slot", color: "bg-muted/10 border-border/30 border-dashed" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm border ${item.color}`} />
            <span className="text-[10px] font-display tracking-wider text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
