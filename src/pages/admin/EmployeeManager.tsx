import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Department {
  id: string;
  name: string;
  description: string | null;
  color: string;
  sort_order: number;
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
  sort_order: number;
  is_active: boolean;
  joined_at: string | null;
}

const defaultEmployee: Partial<Employee> = {
  full_name: "",
  job_title: "",
  department_id: null,
  manager_id: null,
  email: "",
  phone: "",
  avatar_url: "",
  bio: "",
  hierarchy_level: 0,
  sort_order: 0,
  is_active: true,
  joined_at: null,
};

const defaultDept: Partial<Department> = {
  name: "",
  description: "",
  color: "#6366f1",
  sort_order: 0,
};

export default function EmployeeManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);
  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [empRes, deptRes] = await Promise.all([
      supabase.from("employees").select("*").order("hierarchy_level").order("sort_order"),
      supabase.from("departments").select("*").order("sort_order"),
    ]);
    setEmployees((empRes.data as Employee[]) || []);
    setDepartments((deptRes.data as Department[]) || []);
  };

  // Employee CRUD
  const saveEmployee = async () => {
    if (!editingEmployee?.full_name || !editingEmployee?.job_title) {
      toast.error("Name and job title are required");
      return;
    }
    const payload = {
      full_name: editingEmployee.full_name,
      job_title: editingEmployee.job_title,
      department_id: editingEmployee.department_id || null,
      manager_id: editingEmployee.manager_id || null,
      email: editingEmployee.email || null,
      phone: editingEmployee.phone || null,
      avatar_url: editingEmployee.avatar_url || null,
      bio: editingEmployee.bio || null,
      hierarchy_level: editingEmployee.hierarchy_level ?? 0,
      sort_order: editingEmployee.sort_order ?? 0,
      is_active: editingEmployee.is_active ?? true,
      joined_at: editingEmployee.joined_at || null,
    };

    if (editingEmployee.id) {
      const { error } = await supabase.from("employees").update(payload).eq("id", editingEmployee.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Employee updated");
    } else {
      const { error } = await supabase.from("employees").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Employee added");
    }
    setEmpDialogOpen(false);
    setEditingEmployee(null);
    loadData();
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("Delete this employee?")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Employee deleted");
    loadData();
  };

  // Department CRUD
  const saveDept = async () => {
    if (!editingDept?.name) { toast.error("Name required"); return; }
    const payload = {
      name: editingDept.name,
      description: editingDept.description || null,
      color: editingDept.color || "#6366f1",
      sort_order: editingDept.sort_order ?? 0,
    };

    if (editingDept.id) {
      const { error } = await supabase.from("departments").update(payload).eq("id", editingDept.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Department updated");
    } else {
      const { error } = await supabase.from("departments").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Department added");
    }
    setDeptDialogOpen(false);
    setEditingDept(null);
    loadData();
  };

  const deleteDept = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Department deleted");
    loadData();
  };

  const getDeptName = (id: string | null) => departments.find(d => d.id === id)?.name ?? "—";
  const getManagerName = (id: string | null) => employees.find(e => e.id === id)?.full_name ?? "—";

  const hierarchyLabels = ["C-Suite", "Director", "Manager", "Team Lead", "Staff", "Intern"];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Employee & Org Chart</h1>

      <Tabs defaultValue="employees">
        <TabsList className="mb-4">
          <TabsTrigger value="employees" className="gap-2"><Users className="w-4 h-4" /> Employees</TabsTrigger>
          <TabsTrigger value="departments" className="gap-2"><Building2 className="w-4 h-4" /> Departments</TabsTrigger>
        </TabsList>

        {/* EMPLOYEES TAB */}
        <TabsContent value="employees">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingEmployee({ ...defaultEmployee }); setEmpDialogOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> Add Employee
            </Button>
          </div>
          <div className="glass-surface rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Reports To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.full_name}</TableCell>
                    <TableCell>{emp.job_title}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {hierarchyLabels[emp.hierarchy_level] || `Level ${emp.hierarchy_level}`}
                      </span>
                    </TableCell>
                    <TableCell>{getDeptName(emp.department_id)}</TableCell>
                    <TableCell>{getManagerName(emp.manager_id)}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${emp.is_active ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                        {emp.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingEmployee(emp); setEmpDialogOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteEmployee(emp.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {employees.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No employees yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* DEPARTMENTS TAB */}
        <TabsContent value="departments">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setEditingDept({ ...defaultDept }); setDeptDialogOpen(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> Add Department
            </Button>
          </div>
          <div className="glass-surface rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Color</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell><div className="w-5 h-5 rounded-full" style={{ backgroundColor: dept.color }} /></TableCell>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{dept.description || "—"}</TableCell>
                    <TableCell>{dept.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingDept(dept); setDeptDialogOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteDept(dept.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Employee Dialog */}
      <Dialog open={empDialogOpen} onOpenChange={setEmpDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee?.id ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name *</Label>
                <Input value={editingEmployee?.full_name || ""} onChange={e => setEditingEmployee(prev => ({ ...prev!, full_name: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Job Title *</Label>
                <Input value={editingEmployee?.job_title || ""} onChange={e => setEditingEmployee(prev => ({ ...prev!, job_title: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <Select value={editingEmployee?.department_id || "none"} onValueChange={v => setEditingEmployee(prev => ({ ...prev!, department_id: v === "none" ? null : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reports To</Label>
                <Select value={editingEmployee?.manager_id || "none"} onValueChange={v => setEditingEmployee(prev => ({ ...prev!, manager_id: v === "none" ? null : v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {employees.filter(e => e.id !== editingEmployee?.id).map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Hierarchy Level</Label>
                <Select value={String(editingEmployee?.hierarchy_level ?? 0)} onValueChange={v => setEditingEmployee(prev => ({ ...prev!, hierarchy_level: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {hierarchyLabels.map((label, i) => <SelectItem key={i} value={String(i)}>{label} (Level {i})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sort Order</Label>
                <Input type="number" value={editingEmployee?.sort_order ?? 0} onChange={e => setEditingEmployee(prev => ({ ...prev!, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input type="email" value={editingEmployee?.email || ""} onChange={e => setEditingEmployee(prev => ({ ...prev!, email: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input value={editingEmployee?.phone || ""} onChange={e => setEditingEmployee(prev => ({ ...prev!, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Avatar URL</Label>
              <Input value={editingEmployee?.avatar_url || ""} onChange={e => setEditingEmployee(prev => ({ ...prev!, avatar_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea value={editingEmployee?.bio || ""} onChange={e => setEditingEmployee(prev => ({ ...prev!, bio: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Joined Date</Label>
                <Input type="date" value={editingEmployee?.joined_at || ""} onChange={e => setEditingEmployee(prev => ({ ...prev!, joined_at: e.target.value }))} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editingEmployee?.is_active ?? true} onChange={e => setEditingEmployee(prev => ({ ...prev!, is_active: e.target.checked }))} className="rounded" />
                  Active
                </label>
              </div>
            </div>
            <Button onClick={saveEmployee} className="w-full">{editingEmployee?.id ? "Update" : "Create"} Employee</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Department Dialog */}
      <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingDept?.id ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Name *</Label>
              <Input value={editingDept?.name || ""} onChange={e => setEditingDept(prev => ({ ...prev!, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Textarea value={editingDept?.description || ""} onChange={e => setEditingDept(prev => ({ ...prev!, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Color</Label>
                <Input type="color" value={editingDept?.color || "#6366f1"} onChange={e => setEditingDept(prev => ({ ...prev!, color: e.target.value }))} className="h-10 p-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sort Order</Label>
                <Input type="number" value={editingDept?.sort_order ?? 0} onChange={e => setEditingDept(prev => ({ ...prev!, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <Button onClick={saveDept} className="w-full">{editingDept?.id ? "Update" : "Create"} Department</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
