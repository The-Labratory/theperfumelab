import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ChevronDown, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

interface Employee {
  id: string;
  full_name: string;
  job_title: string;
  department_id: string | null;
  manager_id: string | null;
  avatar_url: string | null;
  bio: string | null;
  hierarchy_level: number;
  sort_order: number | null;
  is_active: boolean;
}

interface TreeNode extends Employee {
  children: TreeNode[];
  department?: Department;
}

function buildTree(employees: Employee[], departments: Department[]): TreeNode[] {
  const deptMap = new Map(departments.map(d => [d.id, d]));
  const nodeMap = new Map<string, TreeNode>();
  employees.forEach(emp => {
    nodeMap.set(emp.id, { ...emp, children: [], department: emp.department_id ? deptMap.get(emp.department_id) : undefined });
  });

  const roots: TreeNode[] = [];
  nodeMap.forEach(node => {
    if (node.manager_id && nodeMap.has(node.manager_id)) {
      nodeMap.get(node.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.hierarchy_level - b.hierarchy_level);
    nodes.forEach(n => sortChildren(n.children));
  };
  sortChildren(roots);
  return roots;
}

function OrgNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const initials = node.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const isRoot = depth === 0;
  const avatarSize = isRoot ? "w-14 h-14 text-base" : depth === 1 ? "w-11 h-11 text-sm" : "w-9 h-9 text-xs";

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.04 }}
        className={`relative rounded-xl border border-border/30 bg-card/80 backdrop-blur-sm cursor-pointer group hover:border-primary/40 transition-all shadow-sm hover:shadow-md ${
          isRoot ? "px-6 py-5 min-w-[260px]" : depth === 1 ? "px-5 py-4 min-w-[220px]" : "px-4 py-3 min-w-[180px]"
        }`}
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ borderLeftColor: node.department?.color || "hsl(var(--border))", borderLeftWidth: "3px" }}
      >
        <div className="flex items-center gap-3">
          {node.avatar_url ? (
            <img src={node.avatar_url} alt={node.full_name} className={`${avatarSize} rounded-full object-cover ring-2 ring-border/30`} />
          ) : (
            <div
              className={`${avatarSize} rounded-full flex items-center justify-center font-display font-bold ring-2 ring-border/30 shrink-0`}
              style={{
                backgroundColor: node.department?.color ? `${node.department.color}18` : "hsl(var(--muted))",
                color: node.department?.color || "hsl(var(--primary))",
              }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className={`font-display font-bold text-foreground truncate ${isRoot ? "text-base" : "text-sm"}`}>
              {node.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{node.job_title}</p>
            {node.department && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block"
                style={{ backgroundColor: `${node.department.color}18`, color: node.department.color }}
              >
                {node.department.name}
              </span>
            )}
          </div>
          {hasChildren && (
            <div className="text-muted-foreground shrink-0">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          )}
        </div>

        {node.bio && (
          <p className="mt-2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
            {node.bio}
          </p>
        )}

        {hasChildren && (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground bg-muted border border-border/30 px-1.5 py-0.5 rounded-full leading-none">
            {node.children.length}
          </div>
        )}
      </motion.div>

      {/* Children tree */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex justify-center">
              <div className="w-px h-8 bg-border/40" />
            </div>

            {/* Horizontal connector bar */}
            {node.children.length > 1 && (
              <div className="flex justify-center px-8">
                <div className="h-px bg-border/40 w-full max-w-[calc(100%-2rem)]" />
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-6 pt-0">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border/40" />
                  <OrgNode node={child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [empRes, deptRes] = await Promise.all([
      supabase.from("employees").select("*").eq("is_active", true).order("hierarchy_level").order("sort_order"),
      supabase.from("departments").select("*").order("sort_order"),
    ]);
    setEmployees((empRes.data as Employee[]) || []);
    setDepartments((deptRes.data as Department[]) || []);
    setLoading(false);
  };

  const tree = useMemo(() => buildTree(employees, departments), [employees, departments]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">Our Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">Organization Chart</h1>
            <p className="text-muted-foreground max-w-md mx-auto">Meet the people behind The Perfume Lab</p>
          </motion.div>

          {departments.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {departments.map(d => (
                <div key={d.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No team members added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-8">
              <div className="flex flex-col items-center gap-2 min-w-fit mx-auto">
                {tree.map(root => (
                  <OrgNode key={root.id} node={root} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
