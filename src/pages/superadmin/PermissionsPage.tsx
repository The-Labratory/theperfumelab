import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Plus, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ROLES = ["super_admin", "admin", "team_admin", "agent", "user"] as const;
const AUTHORITY_MAP: Record<string, number> = {
  super_admin: 100,
  admin: 80,
  team_admin: 60,
  agent: 40,
  user: 10,
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  admin: "bg-primary/10 text-primary border-primary/30",
  team_admin: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  agent: "bg-green-500/10 text-green-500 border-green-500/30",
  user: "bg-muted text-muted-foreground border-border",
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newRole, setNewRole] = useState<string>("user");
  const [newPermission, setNewPermission] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPermissions = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from("system_permissions" as any) as any)
      .select("*")
      .order("role")
      .order("permission");
    if (error) toast.error(error.message);
    setPermissions(data || []);
    setLoading(false);
  };

  useEffect(() => { loadPermissions(); }, []);

  const filtered = filterRole === "all"
    ? permissions
    : permissions.filter(p => p.role === filterRole);

  const handleAdd = async () => {
    if (!newPermission.trim()) { toast.error("Permission name required"); return; }
    setSaving(true);
    try {
      const { error } = await (supabase.from("system_permissions" as any) as any).insert([{
        role: newRole,
        permission: newPermission.trim(),
        description: newDescription.trim() || null,
      }]);
      if (error) throw error;
      toast.success("Permission added");
      setShowAdd(false);
      setNewPermission("");
      setNewDescription("");
      loadPermissions();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase.from("system_permissions" as any) as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Permission removed");
    loadPermissions();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-display font-bold text-foreground">Permissions & Roles</h1>
      </div>

      {/* Role Hierarchy Overview */}
      <div className="glass-surface rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500" /> Role Hierarchy
        </h2>
        <div className="flex flex-wrap gap-3">
          {ROLES.map(role => (
            <div key={role} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${ROLE_COLORS[role]}`}>
              <span className="text-sm font-medium">{role.replace("_", " ")}</span>
              <Badge variant="outline" className="text-[10px]">Level {AUTHORITY_MAP[role]}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Table */}
      <div className="glass-surface rounded-xl p-4 mb-4">
        <div className="flex gap-3 items-end">
          <div className="w-48">
            <Label className="text-xs text-muted-foreground">Filter by Role</Label>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map(r => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add Permission
          </Button>
        </div>
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No permissions found</TableCell></TableRow>
            ) : (
              filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[p.role] || ""}>{p.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{p.permission}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.description || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Permission Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Permission</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Permission Key</Label>
              <Input value={newPermission} onChange={e => setNewPermission(e.target.value)} placeholder="e.g. orders:export" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="What this permission allows" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving}>{saving ? "Saving…" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
