import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Upload, FileText, CreditCard, Clock, Check, X } from "lucide-react";
import { z } from "zod";

const requestSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

interface EmployeeRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  rejection_reason: string | null;
}

export default function EmployeeOnboardingPage() {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const { data } = await supabase
      .from("employee_requests")
      .select("id, full_name, email, phone, status, created_at, rejection_reason")
      .order("created_at", { ascending: false });
    setRequests((data as EmployeeRequest[]) || []);
  };

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("employee-documents").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = requestSchema.safeParse({ full_name: fullName, email, phone, notes });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload documents if provided
      let idDocUrl: string | null = null;
      let bankCardUrl: string | null = null;

      if (idFile) {
        idDocUrl = await uploadFile(idFile, "id-documents");
        if (!idDocUrl && idFile) throw new Error("ID document upload failed");
      }

      if (bankFile) {
        bankCardUrl = await uploadFile(bankFile, "bank-cards");
        if (!bankCardUrl && bankFile) throw new Error("Bank card upload failed");
      }

      const { error } = await supabase.from("employee_requests").insert({
        requested_by: user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        id_document_url: idDocUrl,
        bank_card_url: bankCardUrl,
        notes: notes.trim() || null,
      });
      if (error) throw error;

      toast.success("Employee request submitted for CEO approval");
      setFullName("");
      setEmail("");
      setPhone("");
      setNotes("");
      setIdFile(null);
      setBankFile(null);
      loadRequests();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    approved: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-2">Employee Onboarding</h1>
      <p className="text-sm text-muted-foreground mb-6">Submit new employee requests. All requests require CEO approval before activation.</p>

      {/* Submission Form */}
      <div className="glass-surface rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-display font-semibold">New Employee Request</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Full Name *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} required maxLength={200} placeholder="Employee full name" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} placeholder="employee@email.com" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} maxLength={50} placeholder="+49 123 456 7890" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" /> ID Document
              </Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={e => setIdFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {idFile && <p className="text-xs text-primary mt-1">{idFile.name}</p>}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <CreditCard className="w-3 h-3" /> Bank Card Information
              </Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={e => setBankFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {bankFile && <p className="text-xs text-primary mt-1">{bankFile.name}</p>}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000} rows={2} placeholder="Additional information..." />
          </div>

          <Button type="submit" disabled={loading} className="gap-2">
            <Upload className="w-4 h-4" />
            {loading ? "Submitting…" : "Submit for CEO Approval"}
          </Button>
        </form>
      </div>

      {/* Previous Requests */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-3">My Submitted Requests</h2>
        <div className="glass-surface rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.full_name}</TableCell>
                  <TableCell className="text-sm">{req.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[req.status] || ""}>
                      {req.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                      {req.status === "approved" && <Check className="w-3 h-3 mr-1" />}
                      {req.status === "rejected" && <X className="w-3 h-3 mr-1" />}
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {req.rejection_reason || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No requests submitted yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
