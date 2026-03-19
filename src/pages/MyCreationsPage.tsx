import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, ShoppingBag, Sparkles, Clock, Heart, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface SavedBlend {
  id: string;
  blend_number: number;
  name: string | null;
  scent_notes: any;
  concentration: string;
  volume: number;
  harmony_score: number | null;
  story_text: string | null;
  created_at: string;
  is_public: boolean | null;
  like_count: number | null;
}

interface OrderRow {
  id: string;
  order_number: number;
  created_at: string;
  status: string;
  total: number;
  currency: string | null;
  items: any;
}

export default function MyCreationsPage() {
  const [blends, setBlends] = useState<SavedBlend[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { setLoading(false); return; }

      const [blendsRes, ordersRes] = await Promise.all([
        supabase
          .from("saved_blends")
          .select("id, blend_number, name, scent_notes, concentration, volume, harmony_score, story_text, created_at, is_public, like_count")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("id, order_number, created_at, status, total, currency, items")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false }),
      ]);

      setBlends((blendsRes.data ?? []) as SavedBlend[]);
      setOrders((ordersRes.data ?? []) as OrderRow[]);
      setLoading(false);
    };
    load();
  }, []);

  const statusColor = (s: string) => {
    if (s === "completed" || s === "delivered") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (s === "pending") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={20} />
      <div className="pt-20 pb-16 px-4 max-w-5xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold gradient-text">My Collection</h1>
          <p className="text-muted-foreground mt-1">Your created perfumes and purchase history — all in one place.</p>
        </div>

        <Tabs defaultValue="creations" className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="creations" className="flex-1 gap-2">
              <FlaskConical className="w-4 h-4" /> My Creations ({blends.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 gap-2">
              <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="creations" className="mt-6">
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading your creations...</div>
            ) : blends.length === 0 ? (
              <div className="text-center py-16">
                <FlaskConical className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">No creations yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Head to the Formulation Lab to create your first perfume.</p>
                <Button asChild>
                  <Link to="/formulation">Open Formulation Lab</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {blends.map((blend) => {
                  const notes = Array.isArray(blend.scent_notes) ? blend.scent_notes : [];
                  return (
                    <Card key={blend.id} className="border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-mono">#{blend.blend_number}</p>
                            <h3 className="font-display font-semibold text-foreground text-lg">{blend.name || "Untitled"}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {blend.harmony_score != null && (
                              <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                                <Sparkles className="w-3 h-3 mr-1" /> {blend.harmony_score}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">{blend.concentration}</Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {notes.slice(0, 6).map((n: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] border-border/30">
                              {n.name || n.emoji || "?"}
                            </Badge>
                          ))}
                          {notes.length > 6 && (
                            <Badge variant="outline" className="text-[10px] border-border/30">+{notes.length - 6}</Badge>
                          )}
                        </div>

                        {blend.story_text && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 italic">{blend.story_text}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(blend.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-3">
                            {(blend.like_count ?? 0) > 0 && (
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{blend.like_count}</span>
                            )}
                            <span>{blend.volume}ml</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Visit the store to discover our signature collection.</p>
                <Button asChild>
                  <Link to="/store">Browse Store</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  return (
                    <Card key={order.id} className="border-border/40 bg-card/50 backdrop-blur-sm">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-display font-semibold text-foreground">Order #{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${statusColor(order.status)}`}>{order.status}</Badge>
                            <span className="font-display font-bold text-foreground">
                              {order.currency || "EUR"} {Number(order.total).toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {items.slice(0, 4).map((item: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {item.title || item.name || `Item ${i + 1}`}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
