import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GitBranch, Crown, Users, AlertTriangle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TreeNode {
  user_id: string;
  parent_user_id: string | null;
  depth: number;
  display_name: string;
  referral_code: string;
  total_sales?: number;
  total_clients?: number;
  status?: string;
  children: TreeNode[];
}

export default function NetworkTreePage() {
  const { user } = useAuth();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [stats, setStats] = useState({ totalNodes: 0, totalRevenue: 0, powerNodes: 0, churnRisk: 0 });
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: downline } = await supabase.rpc("get_downline", {
        _user_id: user!.id,
        _max_depth: 5,
      });

      if (downline) {
        const nodeMap = new Map<string, TreeNode>();
        const roots: TreeNode[] = [];

        // Build nodes
        downline.forEach((d: any) => {
          nodeMap.set(d.user_id, {
            ...d,
            children: [],
            total_sales: 0,
            total_clients: 0,
            status: "active",
          });
        });

        // Build tree
        downline.forEach((d: any) => {
          const node = nodeMap.get(d.user_id)!;
          if (d.parent_user_id === user!.id) {
            roots.push(node);
          } else {
            const parent = nodeMap.get(d.parent_user_id);
            if (parent) parent.children.push(node);
          }
        });

        setTree(roots);
        setStats({
          totalNodes: downline.length,
          totalRevenue: 0,
          powerNodes: 0,
          churnRisk: 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isPowerNode = (node.total_clients || 0) >= 50;
    const isChurnRisk = node.status === "at_risk";

    return (
      <motion.div
        key={node.user_id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.05 }}
        className="ml-6 relative"
      >
        {/* Connector line */}
        <div className="absolute left-[-16px] top-0 bottom-0 w-px bg-[hsl(var(--border))]" />
        <div className="absolute left-[-16px] top-5 w-4 h-px bg-[hsl(var(--border))]" />

        <div
          className={`p-3 rounded-lg border mb-2 ${
            isPowerNode
              ? "border-amber-500/40 bg-amber-500/5"
              : isChurnRisk
              ? "border-destructive/40 bg-destructive/5"
              : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPowerNode && <Crown className="w-4 h-4 text-amber-500" />}
              {isChurnRisk && <AlertTriangle className="w-4 h-4 text-destructive" />}
              <div>
                <p className="text-sm font-semibold">{node.display_name || "Unknown"}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{node.referral_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPowerNode && (
                <Badge className="text-[10px] bg-amber-500/20 text-amber-500 border-amber-500/30">
                  POWER NODE
                </Badge>
              )}
              {isChurnRisk && (
                <Badge variant="destructive" className="text-[10px]">HIGH CHURN</Badge>
              )}
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Depth {node.depth}</span>
            </div>
          </div>
        </div>

        {node.children.length > 0 && (
          <div>{node.children.map((child) => renderNode(child, level + 1))}</div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <GitBranch className="w-6 h-6 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Network Tree</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Visualize the flow of your distribution network
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Nodes", value: stats.totalNodes, icon: Users, color: "text-[hsl(var(--primary))]" },
          { label: "Network Revenue", value: `$${stats.totalRevenue}`, icon: Zap, color: "text-emerald-500" },
          { label: "Power Nodes", value: stats.powerNodes, icon: Crown, color: "text-amber-500" },
          { label: "Churn Risk", value: stats.churnRisk, icon: AlertTriangle, color: "text-destructive" },
        ].map((stat) => (
          <Card key={stat.label} className="border-[hsl(var(--border))]">
            <CardContent className="pt-4 pb-4">
              <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tree Visualization */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="text-lg">Scent-Tree</CardTitle>
        </CardHeader>
        <CardContent>
          {tree.length === 0 ? (
            <div className="text-center py-16">
              <GitBranch className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--muted-foreground))]" />
              <p className="text-[hsl(var(--muted-foreground))]">No network nodes yet. Start recruiting to see your tree grow.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Root node (you) */}
              <div className="p-3 rounded-lg border-2 border-amber-500/50 bg-amber-500/10 mb-4 inline-block">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span className="font-bold">You (Sovereign Manager)</span>
                </div>
              </div>
              {tree.map((node) => renderNode(node))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
