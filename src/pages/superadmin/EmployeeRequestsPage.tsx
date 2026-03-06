import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Eye, Shield, UserPlus, FileText, CreditCard } from "lucide-react";

interface EmployeeRequest {
  id: string;
  requested_by: string;
  full_name: string;
  email: string;
  phone: string | null;
  id_document_url: string | null;
  bank_card_url: string | null;
  status: string;
  assigned_role: string | null;
  assigned_department_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

const roleLabels: Record<string, string> = {
  user: "User",
  admin: "Admin",
  team_admin: "Team Admin",
  agent: "Agent",
  viewer: "Viewer",
};

export default function EmployeeRequestsPage() {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [assignedRole, setAssignedRole] = useState<string>("user");
  const [assignedDept, setAssignedDept] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    loadData();
    // Realtime subscription
    const channel = supabase
      .channel("employee-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "employee_requests" }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async () => {
    const [reqRes, deptRes] = await Promise.all([
      supabase.from("employee_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("departments").select("id, name").order("name"),
    ]);
    setRequests((reqRes.data as EmployeeRequest[]) || []);
    setDepartments((deptRes.data as Department[]) || []);
  };

  const openReview = (req: EmployeeRequest) => {
    setSelectedRequest(req);
    setAssignedRole(req.assigned_role || "user");
    setAssignedDept(req.assigned_department_id || "");
    setRejectionReason(req.rejection_reason || "");
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update request status
      const { error } = await supabase.from("employee_requests").update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        assigned_role: assignedRole as any,
        assigned_department_id: assignedDept || null,
      }).eq("id", selectedRequest.id);
      if (error) throw error;

      // Find or default Sales department
      let deptId = assignedDept;
      if (!deptId) {
        const salesDept = departments.find(d => d.name.toLowerCase() === "sales");
        deptId = salesDept?.id || "";
      }

      // Create employee record
      const { error: empError } = await supabase.from("employees").insert({
        full_name: selectedRequest.full_name,
        job_title: "New Employee",
        email: selectedRequest.email,
        phone: selectedRequest.phone,
        department_id: deptId || null,
        hierarchy_level: 4, // Staff level
        is_active: true,
        joined_at: new Date().toISOString().split("T")[0],
      });
      if (empError) throw empError;

      toast.success(`Approved ${selectedRequest.full_name} — employee record created`);
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("employee_requests").update({
        status: "rejected",
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason.trim(),
      }).eq("id", selectedRequest.id);
      if (error) throw error;

      toast.success(`Rejected request for ${selectedRequest.full_name}`);
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDocUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("employee-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const getSignedUrl = async (path: string) => {
    const { data, error } = await supabase.storage.from("employee-documents").createSignedUrl(path, 300);
    if (error) { toast.error("Cannot access document"); return null; }
    return data.signedUrl;
  };

  const viewDocument = async (path: string | null, label: string) => {
    if (!path) { toast.error(`No ${label} uploaded`); return; }
    const url = await getSignedUrl(path);
    if (url) window.open(url, "_blank");
  };

  const filteredRequests = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    approved: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Employee Onboarding Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Review, approve, or reject new employee onboarding requests</p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs">
              {f} {f !== "all" && `(${requests.filter(r => r.status === f).length})`}
            </Button>
          ))}
        </div>
      </div>

      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map(req => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.full_name}</TableCell>
                <TableCell className="text-sm">{req.email}</TableCell>
                <TableCell className="text-sm">{req.phone || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[req.status] || ""}>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {req.id_document_url && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewDocument(req.id_document_url, "ID Document")}>
                        <FileText className="w-3.5 h-3.5 text-primary" />
                      </Button>
                    )}
                    {req.bank_card_url && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewDocument(req.bank_card_url, "Bank Card")}>
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                      </Button>
                    )}
                    {!req.id_document_url && !req.bank_card_url && <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(req.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openReview(req)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No {filter !== "all" ? filter : ""} requests
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Review: {selectedRequest?.full_name}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5">
              {/* Employee Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="text-sm font-medium">{selectedRequest.full_name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <p className="text-sm">{selectedRequest.phone || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Current Status</Label>
                  <Badge variant="outline" className={statusColors[selectedRequest.status] || ""}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Uploaded Documents</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!selectedRequest.id_document_url} onClick={() => viewDocument(selectedRequest.id_document_url, "ID")} className="gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5" /> View ID Document
                  </Button>
                  <Button variant="outline" size="sm" disabled={!selectedRequest.bank_card_url} onClick={() => viewDocument(selectedRequest.bank_card_url, "Bank Card")} className="gap-2 text-xs">
                    <CreditCard className="w-3.5 h-3.5" /> View Bank Card
                  </Button>
                </div>
              </div>

              {selectedRequest.status === "pending" && (
                <>
                  {/* Role & Department Assignment */}
                  <div className="border-t border-border/30 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <Label className="text-sm font-semibold">Assign Permissions</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Role</Label>
                        <Select value={assignedRole} onValueChange={setAssignedRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(roleLabels).map(([val, label]) => (
                              <SelectItem key={val} value={val}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Department</Label>
                        <Select value={assignedDept} onValueChange={setAssignedDept}>
                          <SelectTrigger><SelectValue placeholder="Default: Sales" /></SelectTrigger>
                          <SelectContent>
                            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Rejection Reason (required to reject)</Label>
                    <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={2} placeholder="Reason for rejection..." />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button onClick={handleApprove} disabled={loading} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4" /> Approve & Create Employee
                    </Button>
                    <Button onClick={handleReject} disabled={loading} variant="destructive" className="flex-1 gap-2">
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.status === "approved" && (
                <div className="border-t border-border/30 pt-4 text-center">
                  <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-green-500 font-medium">Approved</p>
                  <p className="text-xs text-muted-foreground">
                    Role: {roleLabels[selectedRequest.assigned_role || "user"] || selectedRequest.assigned_role}
                    {selectedRequest.approved_at && ` • ${new Date(selectedRequest.approved_at).toLocaleString()}`}
                  </p>
                </div>
              )}

              {selectedRequest.status === "rejected" && (
                <div className="border-t border-border/30 pt-4 text-center">
                  <X className="w-8 h-8 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-destructive font-medium">Rejected</p>
                  {selectedRequest.rejection_reason && (
                    <p className="text-xs text-muted-foreground mt-1">Reason: {selectedRequest.rejection_reason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
