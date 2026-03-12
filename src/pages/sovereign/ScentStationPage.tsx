import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, QrCode, Plus, Percent, BarChart3, Building2, Scissors, Dumbbell, Briefcase, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";

const BUSINESS_TYPES = [
  { value: "barbershop", label: "Barbershop", icon: Scissors },
  { value: "salon", label: "Salon", icon: Scissors },
  { value: "gym", label: "Gym", icon: Dumbbell },
  { value: "office", label: "Office", icon: Briefcase },
  { value: "retail", label: "Retail", icon: Store },
];

export default function ScentStationPage() {
  const { user } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    business_type: "barbershop",
    address: "",
    commission_split_pct: 10,
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("affiliate_partners")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      setMyProfile(profile);

      if (profile) {
        const { data } = await supabase
          .from("scent_stations")
          .select("*")
          .eq("affiliate_id", profile.id)
          .order("created_at", { ascending: false });
        setStations(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!myProfile || !form.business_name) return;

    const { error } = await supabase.from("scent_stations").insert({
      affiliate_id: myProfile.id,
      user_id: user!.id,
      business_name: form.business_name,
      business_type: form.business_type,
      address: form.address || null,
      commission_split_pct: form.commission_split_pct,
    });

    if (error) {
      toast.error("Failed to create station");
    } else {
      toast.success("Scent Station deployed!");
      setShowAdd(false);
      setForm({ business_name: "", business_type: "barbershop", address: "", commission_split_pct: 10 });
      loadData();
    }
  };

  const getQRUrl = (qrCode: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `https://www.lenzohariri.com/store?station=${qrCode}`
    )}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalScans = stations.reduce((a, s) => a + s.total_scans, 0);
  const totalConversions = stations.reduce((a, s) => a + s.total_conversions, 0);
  const conversionRate = totalScans > 0 ? ((totalConversions / totalScans) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 flex items-center justify-center border border-blue-500/30">
              <MapPin className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Scent Stations</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Deploy physical QR nodes across your territory</p>
            </div>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Deploy Station</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deploy New Scent Station</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs">Business Name</Label>
                  <Input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Gold's Gym Downtown" />
                </div>
                <div>
                  <Label className="text-xs">Business Type</Label>
                  <Select value={form.business_type} onValueChange={(v) => setForm({ ...form, business_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((bt) => (
                        <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Address (optional)</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
                </div>
                <div>
                  <Label className="text-xs">Commission Split to Host: {form.commission_split_pct}%</Label>
                  <Slider
                    value={[form.commission_split_pct]}
                    min={5}
                    max={25}
                    step={1}
                    onValueChange={([v]) => setForm({ ...form, commission_split_pct: v })}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                    <span>5%</span>
                    <span className="text-amber-500">You keep {50 - form.commission_split_pct}%</span>
                    <span>25%</span>
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={!form.business_name}>
                  Deploy Station
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Territory Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Stations", value: stations.filter((s) => s.is_active).length, icon: MapPin },
            { label: "Total Scans", value: totalScans, icon: QrCode },
            { label: "Conversions", value: totalConversions, icon: BarChart3 },
            { label: "Conversion Rate", value: `${conversionRate}%`, icon: Percent },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-[hsl(var(--border))]">
                <CardContent className="pt-4 pb-4">
                  <stat.icon className="w-4 h-4 text-[hsl(var(--muted-foreground))] mb-1" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Territory Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station, i) => {
            const TypeIcon = BUSINESS_TYPES.find((b) => b.value === station.business_type)?.icon || Building2;
            return (
              <motion.div key={station.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-[hsl(var(--border))] overflow-hidden">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <div>
                          <p className="font-semibold text-sm">{station.business_name}</p>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">{station.address || station.business_type}</p>
                        </div>
                      </div>
                      <Badge variant={station.is_active ? "default" : "secondary"} className="text-[10px]">
                        {station.is_active ? "Live" : "Paused"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <img src={getQRUrl(station.qr_code_data)} alt="QR" className="w-16 h-16 rounded-lg border border-[hsl(var(--border))]" />
                      <div className="grid grid-cols-2 gap-2 flex-1 text-center">
                        <div>
                          <p className="text-lg font-bold">{station.total_scans}</p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Scans</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-emerald-500">{station.total_conversions}</p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Conversions</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-[hsl(var(--border)/0.5)] pt-2">
                      <span className="text-[hsl(var(--muted-foreground))]">Host Split: {station.commission_split_pct}%</span>
                      <span className="text-amber-500 font-medium">Your Cut: {50 - station.commission_split_pct}%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {stations.length === 0 && (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-lg font-semibold mb-2">No Stations Deployed</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
              Deploy QR code stations at partner businesses to expand your physical territory.
            </p>
            <Button onClick={() => setShowAdd(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Deploy Your First Station
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
