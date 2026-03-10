import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClientStats } from "@/components/crm/ClientStats";
import { ClientTable, type ClientConnection } from "@/components/crm/ClientTable";
import { AddClientDialog } from "@/components/crm/AddClientDialog";
import { B2BDealDialog } from "@/components/crm/B2BDealDialog";

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
    </div>
  );
}
