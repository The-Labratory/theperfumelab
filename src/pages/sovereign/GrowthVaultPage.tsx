import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Vault, ArrowRight, Coins, TrendingUp, Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function GrowthVaultPage() {
  const { user } = useAuth();
  const [pendingCash, setPendingCash] = useState(0);
  const [creditBalance, setCreditBalance] = useState(0);
  const [convertAmount, setConvertAmount] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get pending commissions (cash balance)
      const { data: commissions } = await supabase
        .from("commission_ledger")
        .select("commission_amount")
        .eq("user_id", user!.id)
        .eq("status", "pending");
      setPendingCash(commissions?.reduce((a, c) => a + Number(c.commission_amount), 0) || 0);

      // Get growth credits
      const { data: credits } = await supabase
        .from("growth_credits")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      setCreditBalance(credits?.reduce((a, c) => a + Number(c.amount), 0) || 0);
      setTransactions(credits || []);

      // Get available auctions
      const { data: auctionData } = await supabase
        .from("portfolio_auctions")
        .select("*")
        .eq("status", "listed")
        .order("total_portfolio_value", { ascending: false });
      setAuctions(auctionData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    const amount = parseFloat(convertAmount);
    if (!amount || amount <= 0 || amount > pendingCash) {
      toast.error("Invalid amount");
      return;
    }

    const { data, error } = await supabase.functions.invoke("convert-growth-credits", {
      body: { action: "convert", amount },
    });

    if (error || data?.error) {
      toast.error(data?.error || "Conversion failed");
    } else {
      toast.success(`Converted €${amount.toFixed(2)} → ${data.credits.toFixed(2)} Growth Credits!`);
      setConvertAmount("");
      loadData();
    }
  };

  const handleClaimAuction = async (auctionId: string, cost: number) => {
    if (creditBalance < cost) {
      toast.error("Insufficient Growth Credits");
      return;
    }

    // Deduct credits via edge function
    const { data: creditData, error: creditError } = await supabase.functions.invoke("convert-growth-credits", {
      body: { action: "spend", amount: cost },
    });

    if (creditError) {
      toast.error("Failed to process purchase");
      return;
    }

    toast.success("Portfolio claimed! Customers will be transferred to your account.");
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const previewCredits = convertAmount ? parseFloat(convertAmount) * 1.2 : 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/10 flex items-center justify-center border border-amber-500/30">
              <Vault className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Growth Vault</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Convert cash to credits at 1.2× and invest in your network
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Balances */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-[hsl(var(--border))]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Coins className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">Pending Cash</span>
                </div>
                <p className="text-3xl font-bold">${pendingCash.toFixed(2)}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Available for withdrawal or conversion</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">Growth Credits</span>
                </div>
                <p className="text-3xl font-bold text-amber-500">{creditBalance.toFixed(2)}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Use for auctions, leads & boosts</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Conversion Tool */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-[hsl(var(--border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-[hsl(var(--primary))]" />
                Convert Cash → Growth Credits
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">1.2× BONUS</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">Cash Amount ($)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(e.target.value)}
                    max={pendingCash}
                    min={0}
                  />
                </div>
                <ArrowRight className="w-5 h-5 text-[hsl(var(--muted-foreground))] shrink-0 hidden sm:block" />
                <div className="flex-1 w-full">
                  <label className="text-xs text-[hsl(var(--muted-foreground))] mb-1 block">You Receive (Credits)</label>
                  <div className="h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] flex items-center">
                    <span className="text-amber-500 font-bold">{previewCredits.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleConvert}
                  disabled={!convertAmount || parseFloat(convertAmount) <= 0}
                  className="shrink-0"
                >
                  Convert
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Auction Marketplace */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-[hsl(var(--border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="w-5 h-5 text-[hsl(var(--primary))]" />
                Portfolio Auction
                <Badge variant="secondary">{auctions.length} Available</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auctions.length === 0 ? (
                <p className="text-center text-[hsl(var(--muted-foreground))] py-8">
                  No portfolios available for auction right now.
                </p>
              ) : (
                <div className="space-y-3">
                  {auctions.map((auction) => (
                    <div
                      key={auction.id}
                      className="p-4 rounded-xl border border-[hsl(var(--border))] flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold">{auction.client_count} Locked Customers</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          Portfolio Value: ${auction.total_portfolio_value.toFixed(0)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">Cost</p>
                          <p className="font-bold text-amber-500">{auction.credit_cost} Credits</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleClaimAuction(auction.id, auction.credit_cost)}
                          disabled={creditBalance < auction.credit_cost}
                        >
                          Claim
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-[hsl(var(--border))]">
              <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border)/0.5)] last:border-0">
                      <div>
                        <p className="text-sm font-medium">{tx.notes || tx.credit_type}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-bold ${Number(tx.amount) > 0 ? "text-emerald-500" : "text-destructive"}`}>
                        {Number(tx.amount) > 0 ? "+" : ""}{Number(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
