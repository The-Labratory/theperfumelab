import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { QrCode, Plus, Download, Trash2, MapPin, BarChart2, Lock, Loader2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getExpansionTier, canAccessQREngine } from "@/lib/affiliateTiers";

interface AffiliateLocation {
  id: string;
  location_name: string;
  discount_pct: number;
  referral_url: string;
  total_scans: number;
  total_sales: number;
  total_revenue: number;
  is_active: boolean;
  created_at: string;
}

export default function BusinessQREngine() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [locations, setLocations] = useState<AffiliateLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ location_name: "", discount_pct: 20 });
  const qrRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const weeklySales: number = affiliate?.weekly_sales_count ?? 0;
  const tierKey = getExpansionTier(weeklySales);
  const hasAccess = canAccessQREngine(tierKey);

  const baseUrl = window.location.origin;
  const refCode: string = affiliate?.referral_code ?? "";

  useEffect(() => {
    if (hasAccess) fetchLocations();
    else setLoading(false);
  }, [affiliate?.id, hasAccess]);

  const fetchLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("affiliate_locations")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load locations");
    setLocations((data as AffiliateLocation[]) || []);
    setLoading(false);
  };

  const buildReferralUrl = (locationName: string, discount: number) => {
    const slug = locationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `${baseUrl}/store?ref=${refCode}&loc=${slug}&disc=${discount}`;
  };

  const handleAdd = async () => {
    if (!form.location_name.trim()) {
      toast.error("Location name is required");
      return;
    }
    if (form.discount_pct < 0 || form.discount_pct > 40) {
      toast.error("Discount must be between 0% and 40%");
      return;
    }
    setSaving(true);
    const referralUrl = buildReferralUrl(form.location_name, form.discount_pct);
    const { error } = await supabase.from("affiliate_locations").insert({
      affiliate_id: affiliate.id,
      location_name: form.location_name.trim(),
      discount_pct: form.discount_pct,
      referral_url: referralUrl,
    });
    if (error) {
      toast.error("Failed to create location");
    } else {
      toast.success(`Location "${form.location_name}" created!`);
      setForm({ location_name: "", discount_pct: 20 });
      setDialogOpen(false);
      fetchLocations();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete location "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("affiliate_locations")
      .delete()
      .eq("id", id);
    if (error) toast.error("Failed to delete location");
    else {
      toast.success("Location deleted");
      setLocations((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const downloadQR = (location: AffiliateLocation) => {
    const canvas = qrRefs.current[location.id];
    if (!canvas) return;

    // Create a new canvas with branding padding
    const branded = document.createElement("canvas");
    const padding = 24;
    const footerH = 56;
    branded.width = canvas.width + padding * 2;
    branded.height = canvas.height + padding * 2 + footerH;
    const ctx = branded.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, branded.width, branded.height);

    // QR code centered
    ctx.drawImage(canvas, padding, padding);

    // Brand footer
    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("THE PERFUME LAB", branded.width / 2, canvas.height + padding + 24);
    ctx.fillStyle = "#6b7280";
    ctx.font = "12px sans-serif";
    ctx.fillText(
      `${location.location_name} · ${location.discount_pct}% off`,
      branded.width / 2,
      canvas.height + padding + 44
    );

    const link = document.createElement("a");
    link.download = `tpl-qr-${location.location_name.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = branded.toDataURL("image/png");
    link.click();
    toast.success("QR code downloaded!");
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">QR Engine Locked</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Reach <strong>5 sales/week</strong> (Growth tier) to unlock the Scent-Station QR Engine.
          You currently have <strong>{weeklySales} sales</strong> this week.
        </p>
        <Badge variant="outline" className="text-xs">
          {5 - weeklySales} more {5 - weeklySales === 1 ? "sale" : "sales"} to unlock
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
            Scent-Station QR Engine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create location-based QR codes for each physical door — track scans and sales separately.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 font-display tracking-wider">
              <Plus className="w-4 h-4" />
              NEW LOCATION
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display tracking-wide">New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="loc-name">Location Name</Label>
                <Input
                  id="loc-name"
                  placeholder="e.g. Joe's Gym, The Grand Hotel…"
                  value={form.location_name}
                  onChange={(e) => setForm((f) => ({ ...f, location_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="loc-disc">
                  Discount Amount (0–40%)
                </Label>
                <Input
                  id="loc-disc"
                  type="number"
                  min={0}
                  max={40}
                  value={form.discount_pct}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discount_pct: parseInt(e.target.value) || 0 }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum corporate discount is 40%.
                </p>
              </div>
              <Button className="w-full font-display tracking-wider" onClick={handleAdd} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <QrCode className="w-4 h-4 mr-2" />
                )}
                {saving ? "CREATING…" : "CREATE & GENERATE QR"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Location cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : locations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/40 p-12 text-center text-muted-foreground">
          <QrCode className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-display text-sm tracking-wider">NO LOCATIONS YET</p>
          <p className="text-xs mt-1">Create your first location to generate a QR code.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {locations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border/40 glass-surface p-5 flex flex-col gap-4"
            >
              {/* Location info */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <p className="font-display font-bold text-sm text-foreground truncate">
                    {loc.location_name}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {loc.discount_pct}% off
                </Badge>
              </div>

              {/* QR code (hidden canvas for download) */}
              <div className="flex items-center justify-center bg-white rounded-xl p-3">
                <QRCodeCanvas
                  ref={(el) => {
                    qrRefs.current[loc.id] = el;
                  }}
                  value={loc.referral_url}
                  size={160}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: "/favicon.ico",
                    height: 24,
                    width: 24,
                    excavate: true,
                  }}
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/30 p-2">
                  <p className="font-display text-base font-black text-foreground">
                    {loc.total_scans}
                  </p>
                  <p className="text-[9px] font-display tracking-widest text-muted-foreground">SCANS</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-2">
                  <p className="font-display text-base font-black text-foreground">
                    {loc.total_sales}
                  </p>
                  <p className="text-[9px] font-display tracking-widest text-muted-foreground">SALES</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-2">
                  <p className="font-display text-base font-black text-primary">
                    €{Number(loc.total_revenue).toFixed(0)}
                  </p>
                  <p className="text-[9px] font-display tracking-widest text-muted-foreground">REV</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1.5 text-xs font-display tracking-wider"
                  onClick={() => downloadQR(loc)}
                >
                  <Download className="w-3.5 h-3.5" />
                  DOWNLOAD PNG
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive shrink-0"
                  onClick={() => handleDelete(loc.id, loc.location_name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Analytics note */}
      {locations.length > 0 && (
        <div className="rounded-xl bg-muted/20 border border-border/30 p-4 flex items-center gap-3">
          <BarChart2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Scan and sale counts update automatically when customers use your location QR codes.
            Use these numbers to see which physical door drives the most revenue.
          </p>
        </div>
      )}
    </div>
  );
}
