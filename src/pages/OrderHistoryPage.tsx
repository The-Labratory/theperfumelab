import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface OrderRow {
  id: string;
  created_at: string;
  status: string;
  total: number;
  currency: string | null;
  order_number: number;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("orders")
        .select("id, created_at, status, total, currency, order_number")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setOrders((data ?? []) as OrderRow[]);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={4} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Order History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading orders…</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm text-muted-foreground">No orders yet.</p>
                <Button asChild variant="outline"><Link to="/catalog">Start shopping</Link></Button>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-lg border border-border/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-display text-sm text-foreground">Order #{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">{order.status}</Badge>
                    <p className="font-display text-sm text-primary font-bold">{order.currency || "EUR"} {Number(order.total).toFixed(2)}</p>
                    <Button asChild size="sm" variant="outline" className="gap-1">
                      <Link to="/catalog"><RefreshCw className="w-4 h-4" /> Reorder</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
