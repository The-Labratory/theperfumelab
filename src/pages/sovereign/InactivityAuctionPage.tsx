import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Gavel, UserX, ArrowRightLeft, AlertTriangle, Building2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function InactivityAuctionPage() {
  const [lapsedAffiliates, setLapsedAffiliates] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Find affiliates inactive for 30+ days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: lapsed } = await supabase
        .from("affiliate_partners")
        .select("*, client_connections(count)")
        .lt("last_active_at", thirtyDaysAgo.toISOString())
        .eq("status", "active");

      setLapsedAffiliates(lapsed || []);

      const { data: auctionData } = await supabase
        .from("portfolio_auctions")
        .select("*")
        .order("created_at", { ascending: false });
      setAuctions(auctionData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const liquidatePortfolio = async (affiliateId: string, toCompanyHouse: boolean) => {
    try {
      if (toCompanyHouse) {
        // Reassign all client_connections to company house (null affiliate)
        const { error } = await supabase
          .from("client_connections")
          .update({ original_affiliate_id: null, notes: "Orphaned — reassigned to Company House" })
          .eq("original_affiliate_id", affiliateId);

        if (error) throw error;

        // Mark affiliate as inactive
        await supabase
          .from("affiliate_partners")
          .update({ status: "inactive", is_compliant: false })
          .eq("id", affiliateId);

        toast.success("Portfolio liquidated to Company House");
      } else {
        // Create auction listing
        const { data: clients } = await supabase
          .from("client_connections")
          .select("total_spent")
          .eq("original_affiliate_id", affiliateId);

        const clientCount = clients?.length || 0;
        const totalValue = clients?.reduce((a, c) => a + Number(c.total_spent), 0) || 0;

        const { error } = await supabase.from("portfolio_auctions").insert({
          source_affiliate_id: affiliateId,
          client_count: clientCount,
          total_portfolio_value: totalValue,
          credit_cost: Math.round(totalValue * 0.1), // 10% of portfolio value in credits
          status: "listed",
        });

        if (error) throw error;

        await supabase
          .from("affiliate_partners")
          .update({ status: "suspended" })
          .eq("id", affiliateId);

        toast.success("Portfolio listed for auction!");
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Gavel className="w-6 h-6 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inactivity Auction</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Manage lapsed portfolios and redistribute orphaned customers
          </p>
        </div>
      </div>

      {/* Lapsed Affiliates */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserX className="w-5 h-5 text-destructive" />
            Lapsed Portfolios
            <Badge variant="destructive">{lapsedAffiliates.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lapsedAffiliates.length === 0 ? (
            <p className="text-center text-[hsl(var(--muted-foreground))] py-8">No lapsed affiliates. Network is healthy.</p>
          ) : (
            <div className="space-y-3">
              {lapsedAffiliates.map((aff, i) => {
                const daysSince = Math.floor(
                  (Date.now() - new Date(aff.last_active_at).getTime()) / 86400000
                );
                return (
                  <motion.div
                    key={aff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-xl border border-destructive/20 bg-destructive/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{aff.display_name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{aff.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Inactive {daysSince} days
                          </span>
                          <span className="text-xs">
                            Sales: ${aff.total_sales.toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => liquidatePortfolio(aff.id, false)}
                        >
                          <Gavel className="w-3 h-3" /> Auction
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1 text-xs"
                          onClick={() => liquidatePortfolio(aff.id, true)}
                        >
                          <Building2 className="w-3 h-3" /> To Company
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Auctions */}
      <Card className="border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRightLeft className="w-5 h-5 text-[hsl(var(--primary))]" />
            Active Auctions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auctions.length === 0 ? (
            <p className="text-center text-[hsl(var(--muted-foreground))] py-8">No active auctions.</p>
          ) : (
            <div className="space-y-2">
              {auctions.map((auction) => (
                <div key={auction.id} className="p-3 rounded-lg border border-[hsl(var(--border))] flex items-center justify-between">
                  <div>
                    <p className="font-medium">{auction.client_count} customers</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Value: ${auction.total_portfolio_value.toFixed(0)} | Cost: {auction.credit_cost} credits
                    </p>
                  </div>
                  <Badge variant={auction.status === "listed" ? "default" : "secondary"}>
                    {auction.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
