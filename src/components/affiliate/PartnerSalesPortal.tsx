import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ClipboardList, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

interface PartnerSalesPortalProps {
  affiliatePartnerId: string;
  userId: string;
}

export default function PartnerSalesPortal({ affiliatePartnerId, userId }: PartnerSalesPortalProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    product_name: "",
    quantity: 1,
    sale_amount: 0,
    customer_name: "",
    customer_email: "",
    sale_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReports();
  }, [affiliatePartnerId]);

  const loadReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("partner_sales_reports")
      .select("*")
      .eq("affiliate_partner_id", affiliatePartnerId)
      .order("created_at", { ascending: false })
      .limit(50);
    setReports(data || []);
    setLoading(false);
  };

  const submitReport = async () => {
    if (!form.product_name.trim()) return toast.error("Product name required");
    if (form.sale_amount <= 0) return toast.error("Sale amount must be > 0");
    setSubmitting(true);
    try {
      const { error } = await supabase.from("partner_sales_reports").insert({
        affiliate_partner_id: affiliatePartnerId,
        user_id: userId,
        product_name: form.product_name.trim(),
        quantity: form.quantity,
        sale_amount: form.sale_amount,
        customer_name: form.customer_name.trim() || null,
        customer_email: form.customer_email.trim() || null,
        sale_date: form.sale_date,
        notes: form.notes.trim() || null,
      });
      if (error) throw error;
      toast.success("Sale reported successfully!");
      setDialogOpen(false);
      setForm({ product_name: "", quantity: 1, sale_amount: 0, customer_name: "", customer_email: "", sale_date: new Date().toISOString().split("T")[0], notes: "" });
      loadReports();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPending = reports.filter(r => r.status === "pending").reduce((s, r) => s + Number(r.sale_amount), 0);
  const totalApproved = reports.filter(r => r.status === "approved").reduce((s, r) => s + Number(r.sale_amount), 0);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-surface rounded-xl p-4 text-center">
          <ClipboardList className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-foreground">{reports.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Reports</p>
        </div>
        <div className="glass-surface rounded-xl p-4 text-center">
          <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-green-500">€{totalApproved.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">Approved</p>
        </div>
        <div className="glass-surface rounded-xl p-4 text-center">
          <Calendar className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-amber-500">€{totalPending.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </div>
      </div>

      {/* Add Report Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" /> Report a Sale
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Report New Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Product Name *</Label>
              <Input value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Custom Blend #42" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Quantity</Label>
                <Input type="number" min={1} value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sale Amount (€) *</Label>
                <Input type="number" min={0} step={0.01} value={form.sale_amount} onChange={e => setForm({ ...form, sale_amount: Number(e.target.value) })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Customer Name</Label>
                <Input value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Sale Date</Label>
                <Input type="date" value={form.sale_date} onChange={e => setForm({ ...form, sale_date: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any additional details..." className="mt-1 min-h-[60px]" />
            </div>
            <Button onClick={submitReport} disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Sale Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Table */}
      <div className="glass-surface rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : reports.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No sales reported yet. Start by reporting your first sale!</TableCell></TableRow>
            ) : reports.map(r => (
              <TableRow key={r.id}>
                <TableCell className="text-xs text-muted-foreground">{new Date(r.sale_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm font-medium text-foreground">{r.product_name}</TableCell>
                <TableCell className="text-sm">{r.quantity}</TableCell>
                <TableCell className="text-sm font-medium">€{Number(r.sale_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
