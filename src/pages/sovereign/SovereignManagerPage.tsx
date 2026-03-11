import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Users, Zap, Shield, TrendingUp, Clock, AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SubAffiliate {
  id: string;
  display_name: string;
  email: string;
  referral_code: string;
  total_sales: number;
  status: string;
  margin_pct: number;
}

export default function SovereignManagerPage() {
  const { user } = useAuth();
  const [subAffiliates, setSubAffiliates] = useState<SubAffiliate[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [compliance, setCompliance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [margins, setMargins] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load own affiliate profile
      const { data: profile } = await supabase
        .from("affiliate_partners")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      setMyProfile(profile);

      if (profile) {
        // Load sub-affiliates via referral_relationships
        const { data: downline } = await supabase.rpc("get_downline", {
          _user_id: user!.id,
          _max_depth: 1,
        });

        if (downline && downline.length > 0) {
          const subIds = downline.map((d: any) => d.user_id);
          const { data: subs } = await supabase
            .from("affiliate_partners")
            .select("*")
            .in("user_id", subIds);

          // Load margin settings
          const { data: marginData } = await supabase
            .from("sub_affiliate_margins")
            .select("*")
            .eq("manager_user_id", user!.id);

          const marginMap: Record<string, number> = {};
          marginData?.forEach((m: any) => {
            marginMap[m.sub_affiliate_id] = m.margin_pct;
          });

          const enriched = (subs || []).map((s: any) => ({
            ...s,
            margin_pct: marginMap[s.id] || 30,
          }));
          setSubAffiliates(enriched);
          setMargins(marginMap);
        }

        // Load compliance
        const { data: comp } = await supabase
          .from("affiliate_compliance")
          .select("*")
          .eq("affiliate_id", profile.id)
          .order("week_start", { ascending: false })
          .limit(1)
          .maybeSingle();
        setCompliance(comp);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    if (!myProfile) return;
    const link = `${window.location.origin}/affiliate-signup?ref=${myProfile.referral_code}`;
    navigator.clipboard.writeText(link);
    setInviteLinkCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setInviteLinkCopied(false), 2000);
  };

  const updateMargin = async (subAffiliateId: string, newMargin: number) => {
    if (!user) return;
    const { error } = await supabase
      .from("sub_affiliate_margins")
      .upsert({
        manager_user_id: user.id,
        sub_affiliate_id: subAffiliateId,
        margin_pct: newMargin,
        updated_at: new Date().toISOString(),
      }, { onConflict: "manager_user_id,sub_affiliate_id" });

    if (error) {
      toast.error("Failed to update margin");
    } else {
      toast.success(`Margin updated to ${newMargin}%`);
      setSubAffiliates((prev) =>
        prev.map((s) => (s.id === subAffiliateId ? { ...s, margin_pct: newMargin } : s))
      );
    }
  };

  const weekSales = compliance?.sales_count || 0;
  const salesTarget = 5;
  const salesProgress = Math.min((weekSales / salesTarget) * 100, 100);
  const salesDeficit = Math.max(salesTarget - weekSales, 0);

  // Calculate countdown to Monday
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
  nextMonday.setHours(0, 0, 0, 0);
  const hoursLeft = Math.max(0, Math.floor((nextMonday.getTime() - now.getTime()) / 3600000));

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--card))]">
          <CardContent className="pt-6 text-center">
            <Crown className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Become a Sovereign Manager</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
              You need an active affiliate profile to access the Sovereign Manager Portal.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = "/affiliate-signup"}>
              Apply Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30">
              <Crown className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Sovereign Manager</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Command your distribution network
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Active Pulse - Compliance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`border ${!compliance?.is_compliant ? "border-destructive/50 bg-destructive/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {!compliance?.is_compliant ? (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                ) : (
                  <Shield className="w-5 h-5 text-emerald-500" />
                )}
                Active Pulse — Weekly Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Weekly Sales Progress</p>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold">{weekSales}</span>
                    <span className="text-sm text-[hsl(var(--muted-foreground))] mb-1">/ {salesTarget} bottles</span>
                  </div>
                  <Progress value={salesProgress} className="h-2" />
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Status</p>
                  <Badge variant={compliance?.is_compliant ? "default" : "destructive"} className="text-sm">
                    {compliance?.is_compliant ? "✓ COMPLIANT" : "⚠ AT RISK"}
                  </Badge>
                  {salesDeficit > 0 && (
                    <p className="text-xs text-destructive mt-2 font-medium">
                      Sell {salesDeficit} more bottles or lose commission on your locked customers
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Countdown to Reset</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-bold font-mono">{hoursLeft}h</span>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Until Monday compliance scan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Recruitment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-[hsl(var(--border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
                Team Recruitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Your Invite Link</p>
                  <code className="text-xs break-all block mb-3 text-[hsl(var(--foreground))]">
                    {window.location.origin}/affiliate-signup?ref={myProfile.referral_code}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyInviteLink} className="gap-2">
                    {inviteLinkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {inviteLinkCopied ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">Team Stats</p>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <p className="text-2xl font-bold">{subAffiliates.length}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Sub-Affiliates</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-500">
                        {subAffiliates.length > 0
                          ? Math.round(subAffiliates.reduce((a, s) => a + (50 - s.margin_pct), 0) / subAffiliates.length)
                          : 0}%
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Avg Spread</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sub-Affiliate Margin Control */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-[hsl(var(--border))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Network Command — Margin Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subAffiliates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--muted-foreground))]" />
                  <p className="text-[hsl(var(--muted-foreground))]">No sub-affiliates yet. Share your invite link to build your team.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subAffiliates.map((sub) => {
                    const spread = 50 - sub.margin_pct;
                    return (
                      <div key={sub.id} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-[hsl(var(--foreground))]">{sub.display_name}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{sub.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                              {sub.status}
                            </Badge>
                            <div className="text-right">
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Sales</p>
                              <p className="font-bold">${sub.total_sales.toFixed(0)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-[hsl(var(--muted-foreground))]">Their Margin</span>
                              <span className="font-bold text-emerald-500">{sub.margin_pct}%</span>
                            </div>
                            <Slider
                              value={[sub.margin_pct]}
                              min={30}
                              max={40}
                              step={1}
                              onValueCommit={([val]) => updateMargin(sub.id, val)}
                              className="cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                              <span>30%</span>
                              <span>40%</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Your Spread</p>
                              <p className="text-xl font-bold text-amber-500">{spread}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Passive Income</p>
                              <p className="text-xl font-bold text-[hsl(var(--primary))]">
                                ${((sub.total_sales * spread) / 100).toFixed(0)}
                              </p>
                            </div>
                            {sub.margin_pct < 40 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                                onClick={() => updateMargin(sub.id, Math.min(sub.margin_pct + 5, 40))}
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Promote
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
