import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Triangle, Crown, User, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

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
}

const defaultNode: Partial<PyramidNode> = {
  name: "",
  title: "",
  avatar_url: "",
  level: 0,
  position: 0,
  parent_id: null,
  earnings: 0,
  total_transactions: 0,
  is_placeholder: false,
};

const levelLabels = ["Founder", "Director", "Manager", "Team Lead", "Associate"];

export default function PyramidManager() {
  const [nodes, setNodes] = useState<PyramidNode[]>([]);
  const [editing, setEditing] = useState<Partial<PyramidNode> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("affiliate_pyramid")
      .select("*")
      .order("level")
      .order("position");
    setNodes((data as PyramidNode[]) || []);
  };

  const save = async () => {
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
    loadData();
  };

  const deleteNode = async (id: string) => {
    if (!confirm("Delete this node? Children will be unlinked.")) return;
    const { error } = await supabase.from("affiliate_pyramid").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Node deleted");
    loadData();
  };

  const getParentName = (id: string | null) => nodes.find(n => n.id === id)?.name ?? "—";

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Affiliate Network</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing({ ...defaultNode }); setDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Node
        </Button>
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Earnings</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.map(node => (
              <TableRow key={node.id} className={node.is_placeholder ? "opacity-50" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {node.level === 0 ? <Crown className="w-4 h-4 text-accent" /> :
                     node.is_placeholder ? <UserPlus className="w-4 h-4 text-muted-foreground/40" /> :
                     <User className="w-4 h-4 text-primary" />}
                    {node.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{node.title || "—"}</TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {levelLabels[node.level] || `Level ${node.level}`}
                  </span>
                </TableCell>
                <TableCell>{getParentName(node.parent_id)}</TableCell>
                <TableCell className="font-display font-semibold">€{node.earnings.toFixed(2)}</TableCell>
                <TableCell>{node.total_transactions}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${node.is_placeholder ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
                    {node.is_placeholder ? "Placeholder" : "Active"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(node); setDialogOpen(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteNode(node.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {nodes.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No pyramid nodes yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Node" : "Add Node"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Name *</Label>
                <Input value={editing?.name || ""} onChange={e => setEditing(prev => ({ ...prev!, name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input value={editing?.title || ""} onChange={e => setEditing(prev => ({ ...prev!, title: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Level</Label>
                <Select value={String(editing?.level ?? 0)} onValueChange={v => setEditing(prev => ({ ...prev!, level: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {levelLabels.map((label, i) => <SelectItem key={i} value={String(i)}>{label} (Level {i})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Parent</Label>
                <Select value={editing?.parent_id || "none"} onValueChange={v => setEditing(prev => ({ ...prev!, parent_id: v === "none" ? null : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root)</SelectItem>
                    {nodes.filter(n => n.id !== editing?.id && !n.is_placeholder).map(n => (
                      <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Earnings (€)</Label>
                <Input type="number" step="0.01" value={editing?.earnings ?? 0} onChange={e => setEditing(prev => ({ ...prev!, earnings: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Transactions</Label>
                <Input type="number" value={editing?.total_transactions ?? 0} onChange={e => setEditing(prev => ({ ...prev!, total_transactions: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Position</Label>
                <Input type="number" value={editing?.position ?? 0} onChange={e => setEditing(prev => ({ ...prev!, position: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Avatar URL</Label>
              <Input value={editing?.avatar_url || ""} onChange={e => setEditing(prev => ({ ...prev!, avatar_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={editing?.is_placeholder ?? false} onCheckedChange={v => setEditing(prev => ({ ...prev!, is_placeholder: v }))} />
              <Label className="text-xs text-muted-foreground">Empty placeholder slot</Label>
            </div>
            <Button onClick={save} className="w-full">{editing?.id ? "Update" : "Create"} Node</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
