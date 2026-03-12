import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Coins, Heart, ShoppingBag, Sparkles, Users, ChevronRight, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { buildReferralCodeLink } from "@/lib/referralLinks";

interface DashboardState {
  displayName: string;
  referralCode: string | null;
  growthCredits: number;
  favoritesCount: number;
  ordersCount: number;
  referralsCount: number;
  unreadNotifications: number;
  latestNotifications: Array<{ id: string; title: string; message: string; created_at: string }>;
}

const initialState: DashboardState = {
  displayName: "Creator",
  referralCode: null,
  growthCredits: 0,
  favoritesCount: 0,
  ordersCount: 0,
  referralsCount: 0,
  unreadNotifications: 0,
  latestNotifications: [],
};

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const userId = session.user.id;
      const [profileRes, creditsRes, favoritesRes, ordersRes, referralsRes, notificationsRes] = await Promise.all([
        supabase.from("profiles").select("display_name, referral_code").eq("user_id", userId).maybeSingle(),
        supabase.from("growth_credits").select("amount").eq("user_id", userId),
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("referrals").select("id", { count: "exact", head: true }).eq("referrer_user_id", userId),
        supabase
          .from("notifications")
          .select("id, title, message, created_at, is_read")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

      const creditBalance = (creditsRes.data ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
      const unreadCount = (notificationsRes.data ?? []).filter((n) => !n.is_read).length;

      setState({
        displayName:
          profileRes.data?.display_name ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "Creator",
        referralCode: profileRes.data?.referral_code ?? null,
        growthCredits: creditBalance,
        favoritesCount: favoritesRes.count ?? 0,
        ordersCount: ordersRes.count ?? 0,
        referralsCount: referralsRes.count ?? 0,
        unreadNotifications: unreadCount,
        latestNotifications: (notificationsRes.data ?? []).map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          created_at: n.created_at,
        })),
      });

      setLoading(false);
    };

    loadDashboard();
  }, []);

  const referralLink = useMemo(() => {
    if (!state.referralCode) return "";
    return buildReferralCodeLink(state.referralCode);
  }, [state.referralCode]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={8} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black tracking-wider text-foreground">Welcome back, {state.displayName}</h1>
            <p className="text-sm text-muted-foreground">Your Perfume Lab dashboard is ready.</p>
          </div>

          <Button variant="outline" onClick={() => setShowNotifications((prev) => !prev)} className="relative gap-2">
            <Bell className="w-4 h-4" /> Notifications
            {state.unreadNotifications > 0 && (
              <Badge className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 text-[10px]">
                {state.unreadNotifications}
              </Badge>
            )}
          </Button>
        </div>

        {showNotifications && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-display">Latest notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {state.latestNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                state.latestNotifications.map((item) => (
                  <div key={item.id} className="border border-border/50 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/30">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Growth Credits</p>
              <p className="font-display text-4xl font-black text-primary flex items-center gap-2">
                <Coins className="w-7 h-7" /> {state.growthCredits.toFixed(0)}
              </p>
            </div>
            <Button asChild className="font-display tracking-wider">
              <Link to="/catalog">Browse perfumes <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Favorites</p>
              <p className="font-display text-2xl font-bold text-foreground">{state.favoritesCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="font-display text-2xl font-bold text-foreground">{state.ordersCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Referrals</p>
              <p className="font-display text-2xl font-bold text-foreground">{state.referralsCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Scent Quiz</p>
              <p className="font-display text-2xl font-bold text-foreground">Ready</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button asChild variant="outline" className="justify-start gap-2"><Link to="/catalog"><ShoppingBag className="w-4 h-4" /> Browse Perfumes</Link></Button>
          <Button asChild variant="outline" className="justify-start gap-2"><Link to="/favorites"><Heart className="w-4 h-4" /> My Favorites</Link></Button>
          <Button asChild variant="outline" className="justify-start gap-2"><Link to="/orders"><Gift className="w-4 h-4" /> My Orders</Link></Button>
          <Button asChild variant="outline" className="justify-start gap-2"><Link to="/scent-quiz"><Sparkles className="w-4 h-4" /> Scent Quiz</Link></Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2"><Users className="w-4 h-4" /> Refer a friend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.referralCode ? (
              <>
                <p className="text-xs text-muted-foreground">Your referral link</p>
                <code className="block text-xs rounded-lg bg-muted/40 border border-border/50 p-3 break-all text-foreground">{referralLink}</code>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Your referral code will appear here after profile setup.</p>
            )}
          </CardContent>
        </Card>

        {loading && <p className="text-sm text-muted-foreground">Loading dashboard…</p>}
      </div>
    </div>
  );
}
