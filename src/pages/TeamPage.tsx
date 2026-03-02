import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail, Phone, ChevronDown, ChevronRight } from "lucide-react";
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
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  hierarchy_level: number;
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

  // Sort children by hierarchy_level then sort_order
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.hierarchy_level - b.hierarchy_level);
    nodes.forEach(n => sortChildren(n.children));
  };
  sortChildren(roots);
  return roots;
}

function OrgNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const initials = node.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const sizeClass = depth === 0
    ? "p-5 min-w-[280px]"
    : depth === 1
    ? "p-4 min-w-[240px]"
    : "p-3 min-w-[200px]";

  const avatarSize = depth === 0 ? "w-16 h-16 text-lg" : depth === 1 ? "w-12 h-12 text-sm" : "w-10 h-10 text-xs";

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.05 }}
        className={`relative glass-surface rounded-xl border border-border/30 ${sizeClass} cursor-pointer group hover:border-primary/40 transition-all`}
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ borderLeftColor: node.department?.color || "hsl(var(--border))", borderLeftWidth: "3px" }}
      >
        <div className="flex items-center gap-3">
          {node.avatar_url ? (
            <img src={node.avatar_url} alt={node.full_name} className={`${avatarSize} rounded-full object-cover ring-2 ring-border/30`} />
          ) : (
            <div className={`${avatarSize} rounded-full flex items-center justify-center font-display font-bold ring-2 ring-border/30`}
              style={{ backgroundColor: node.department?.color ? `${node.department.color}22` : "hsl(var(--muted))", color: node.department?.color || "hsl(var(--primary))" }}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className={`font-display font-bold text-foreground truncate ${depth === 0 ? "text-lg" : "text-sm"}`}>{node.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{node.job_title}</p>
            {node.department && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: `${node.department.color}22`, color: node.department.color }}>
                {node.department.name}
              </span>
            )}
          </div>
          {hasChildren && (
            <div className="text-muted-foreground">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          )}
        </div>

        {/* Contact info on hover */}
        {(node.email || node.phone) && (
          <div className="mt-2 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {node.email && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{node.email}</p>}
            {node.phone && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{node.phone}</p>}
          </div>
        )}

        {hasChildren && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground bg-muted px-1.5 rounded-full">
            {node.children.length}
          </div>
        )}
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Connector line */}
            <div className="flex justify-center">
              <div className="w-px h-6 bg-border/50" />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {node.children.map(child => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-3 bg-border/50" />
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

          {/* Department Legend */}
          {departments.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {departments.map(d => (
                <div key={d.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
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
