import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientStats } from "@/components/crm/ClientStats";
import { ClientTable, type ClientConnection } from "@/components/crm/ClientTable";
import { AddClientDialog } from "@/components/crm/AddClientDialog";
import { B2BDealDialog } from "@/components/crm/B2BDealDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Building2, Copy, Sparkles, Loader2 } from "lucide-react";
import ClientPitchDialog from "@/components/business/ClientPitchDialog";

function getClientStatusLabel(lastOrderAt: string | null): string {
  if (!lastOrderAt) return "New";
  const days = (Date.now() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 30) return "Active";
  if (days <= 90) return "At Risk";
  return "Inactive";
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
      .select("*")
      .eq("original_affiliate_id", affiliate?.id)
      .order("created_at", { ascending: false });
    setClients((data as unknown as ClientConnection[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (affiliate?.id) fetchClients();
  }, [affiliate?.id]);

  const addClient = async (form: { email: string; account_type: string; notes: string }) => {
    if (!form.email) return void toast.error("Email is required");
    const { error } = await supabase.from("client_connections").insert({
      client_email: form.email.toLowerCase().trim(),
      original_affiliate_id: affiliate.id,
      account_type: form.account_type,
      notes: form.notes || null,
    } as any);
    if (error) return void toast.error(error.message);
    toast.success("Client locked to your portfolio!");
    fetchClients();
  };

  const addB2BDeal = async (form: { email: string; company: string; volume: string; discount: string }) => {
    if (!form.email || !form.company) return void toast.error("Email & company required");
    const discount = Math.min(40, Math.max(0, Number(form.discount)));
    const { error } = await supabase.from("client_connections").insert({
      client_email: form.email.toLowerCase().trim(),
      original_affiliate_id: affiliate.id,
      account_type: "B2B_Corporate",
      company_name: form.company,
      expected_volume: form.volume || null,
      discount_pct: discount,
    } as any);
    if (error) return void toast.error(error.message);
    toast.success("B2B deal created with pre-negotiated link!");
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
    active: clients.filter((c) => getClientStatusLabel(c.last_order_at) === "Active").length,
    atRisk: clients.filter((c) => getClientStatusLabel(c.last_order_at) === "At Risk").length,
    b2b: clients.filter((c) => c.account_type === "B2B_Corporate").length,
    revenue: clients.reduce((s, c) => s + c.total_spent, 0),
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black tracking-wider text-foreground">
            Client CRM
          </h2>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Your Scent-Lock portfolio — persistent attribution
          </p>
        </div>
        <div className="flex gap-2">
          <AddClientDialog onAdd={addClient} />
          <B2BDealDialog onAdd={addB2BDeal} />
        </div>
      </div>

      <ClientStats
        total={stats.total}
        active={stats.active}
        atRisk={stats.atRisk}
        b2b={stats.b2b}
        revenue={stats.revenue}
      />

      <ClientTable clients={clients} loading={loading} onCopyLink={copyCheckoutLink} />
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
                    <p className="text-xs font-medium text-foreground">{c.client_email}</p>
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
