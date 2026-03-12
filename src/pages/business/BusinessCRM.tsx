import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Building2, Copy, Sparkles, Loader2 } from "lucide-react";
import ClientPitchDialog from "@/components/business/ClientPitchDialog";

interface ClientConnection {
  id: string;
  client_email: string;
  account_type: string;
  company_name: string | null;
  expected_volume: string | null;
  discount_pct: number;
  checkout_link_code: string;
  last_order_at: string | null;
  total_orders: number;
  total_spent: number;
  acquisition_date: string;
  notes: string | null;
}

function maskEmail(email: string): string {
  if (!email) return "***";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 2)}***@${domain}`;
}

function getClientStatus(lastOrderAt: string | null): { label: string; color: string } {
  if (!lastOrderAt) return { label: "New", color: "bg-muted text-muted-foreground" };
  const days = (Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 30) return { label: "Active", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  if (days <= 90) return { label: "At Risk", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  return { label: "Inactive", color: "bg-muted text-muted-foreground border-muted" };
}

export default function BusinessCRM() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [clients, setClients] = useState<ClientConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showB2B, setShowB2B] = useState(false);
  const [form, setForm] = useState({ email: "", account_type: "B2C", notes: "" });
  const [b2bForm, setB2bForm] = useState({ email: "", company: "", volume: "", discount: "20" });
  const [pitchData, setPitchData] = useState<{ open: boolean; pitch: string; businessName: string; loading: boolean }>({
    open: false, pitch: "", businessName: "", loading: false,
  });

  const fetchClients = async () => {
    const { data } = await supabase
      .from("client_connections")
      .select("id, original_affiliate_id, account_type, company_name, expected_volume, discount_pct, checkout_link_code, last_order_at, total_orders, total_spent, acquisition_date, notes")
      .eq("original_affiliate_id", affiliate?.id)
      .order("created_at", { ascending: false });
    setClients((data as unknown as ClientConnection[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (affiliate?.id) fetchClients();
  }, [affiliate?.id]);

  const addClient = async () => {
    if (!form.email) return toast.error("Email is required");
    const { error } = await supabase.from("client_connections").insert({
      client_email: form.email.toLowerCase().trim(),
      original_affiliate_id: affiliate.id,
      account_type: form.account_type,
      notes: form.notes || null,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("Client locked to your portfolio!");
    setForm({ email: "", account_type: "B2C", notes: "" });
    setShowAdd(false);
    fetchClients();
  };

  const addB2BDeal = async () => {
    if (!b2bForm.email || !b2bForm.company) return toast.error("Email & company required");
    const discount = Math.min(40, Math.max(0, Number(b2bForm.discount)));
    const { error } = await supabase.from("client_connections").insert({
      client_email: b2bForm.email.toLowerCase().trim(),
      original_affiliate_id: affiliate.id,
      account_type: "B2B_Corporate",
      company_name: b2bForm.company,
      expected_volume: b2bForm.volume || null,
      discount_pct: discount,
    } as any);
    if (error) return toast.error(error.message);
    toast.success("B2B deal created with pre-negotiated link!");
    setB2bForm({ email: "", company: "", volume: "", discount: "20" });
    setShowB2B(false);
    fetchClients();
  };

  const generatePitch = async (client: ClientConnection) => {
    if (!client.company_name) return toast.error("Company name is required to generate a pitch");
    setPitchData({ open: true, pitch: "", businessName: client.company_name, loading: true });

    try {
      const { data, error } = await supabase.functions.invoke("generate-b2b-pitch", {
        body: {
          businessName: client.company_name,
          businessType: client.notes || "Business",
          affiliateName: affiliate?.display_name || "Partner",
          discount: client.discount_pct || 20,
          expectedVolume: client.expected_volume,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPitchData(prev => ({ ...prev, pitch: data.pitch, loading: false }));
    } catch (e: any) {
      toast.error(e.message || "Failed to generate pitch");
      setPitchData(prev => ({ ...prev, loading: false, open: false }));
    }
  };

  const copyCheckoutLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/store?ref=${code}`);
    toast.success("Checkout link copied!");
  };

  const stats = {
    total: clients.length,
    active: clients.filter(c => getClientStatus(c.last_order_at).label === "Active").length,
    atRisk: clients.filter(c => getClientStatus(c.last_order_at).label === "At Risk").length,
    b2b: clients.filter(c => c.account_type === "B2B_Corporate").length,
    revenue: clients.reduce((s, c) => s + c.total_spent, 0),
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black tracking-wider text-foreground">Client CRM</h2>
          <p className="text-xs text-muted-foreground font-body mt-1">Your Scent-Lock portfolio — persistent attribution</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 text-xs"><UserPlus className="w-3.5 h-3.5" />Add Client</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display tracking-wider">Lock New Client</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Client email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                <Select value={form.account_type} onValueChange={v => setForm(p => ({ ...p, account_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B2C">B2C Retail</SelectItem>
                    <SelectItem value="B2B_Corporate">B2B Corporate</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                <Button onClick={addClient} className="w-full">Lock Client</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showB2B} onOpenChange={setShowB2B}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs"><Building2 className="w-3.5 h-3.5" />B2B Deal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-display tracking-wider">B2B Deal Builder</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Contact email" value={b2bForm.email} onChange={e => setB2bForm(p => ({ ...p, email: e.target.value }))} />
                <Input placeholder="Company name" value={b2bForm.company} onChange={e => setB2bForm(p => ({ ...p, company: e.target.value }))} />
                <Input placeholder="Expected volume (e.g. 200 units/month)" value={b2bForm.volume} onChange={e => setB2bForm(p => ({ ...p, volume: e.target.value }))} />
                <div>
                  <label className="text-xs font-display text-muted-foreground mb-1 block">Discount % (max 40%)</label>
                  <Input type="number" min={0} max={40} value={b2bForm.discount} onChange={e => setB2bForm(p => ({ ...p, discount: e.target.value }))} />
                </div>
                <div className="rounded-lg bg-accent/10 p-3 text-xs text-accent font-body">
                  <p className="font-bold">Commission: 10-20% on B2B orders</p>
                  <p className="text-muted-foreground mt-1">A unique pre-negotiated checkout link will be generated automatically.</p>
                </div>
                <Button onClick={addB2BDeal} className="w-full">Create Deal & Generate Link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "TOTAL CLIENTS", value: stats.total, accent: false },
          { label: "ACTIVE", value: stats.active, accent: false },
          { label: "AT RISK", value: stats.atRisk, accent: false },
          { label: "B2B DEALS", value: stats.b2b, accent: false },
          { label: "TOTAL REVENUE", value: `€${stats.revenue.toFixed(0)}`, accent: true },
        ].map(s => (
          <div key={s.label} className="glass-surface rounded-xl p-3 border border-border/30 text-center">
            <p className={`font-display text-lg font-black ${s.accent ? "text-primary" : "text-foreground"}`}>{s.value}</p>
            <p className="text-[8px] font-display tracking-widest text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Client Table */}
      <div className="glass-surface rounded-xl border border-border/30 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30">
              <TableHead className="text-xs font-display tracking-wider">STATUS</TableHead>
              <TableHead className="text-xs font-display tracking-wider">CLIENT</TableHead>
              <TableHead className="text-xs font-display tracking-wider">TYPE</TableHead>
              <TableHead className="text-xs font-display tracking-wider">ORDERS</TableHead>
              <TableHead className="text-xs font-display tracking-wider">REVENUE</TableHead>
              <TableHead className="text-xs font-display tracking-wider">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : clients.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-xs text-muted-foreground py-8">No clients yet. Lock your first client above.</TableCell></TableRow>
            ) : clients.map(c => {
              const status = getClientStatus(c.last_order_at);
              return (
                <TableRow key={c.id} className="border-border/20">
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${status.color}`}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-medium text-foreground">{maskEmail(c.client_email)}</p>
                    {c.company_name && <p className="text-[10px] text-muted-foreground">{c.company_name}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {c.account_type === "B2B_Corporate" ? "B2B" : "B2C"}
                      {c.discount_pct > 0 && ` · ${c.discount_pct}% off`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-display font-bold text-foreground">{c.total_orders}</TableCell>
                  <TableCell className="text-xs font-display font-bold text-primary">€{c.total_spent.toFixed(0)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyCheckoutLink(c.checkout_link_code)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      {c.account_type === "B2B_Corporate" && c.company_name && (
                        <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[10px] text-primary hover:text-primary" onClick={() => generatePitch(c)}>
                          <Sparkles className="w-3.5 h-3.5" />
                          Pitch
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ClientPitchDialog
        open={pitchData.open}
        onOpenChange={(open) => setPitchData(prev => ({ ...prev, open }))}
        pitch={pitchData.pitch}
        businessName={pitchData.businessName}
        loading={pitchData.loading}
      />
    </div>
  );
}
