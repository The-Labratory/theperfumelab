import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  onClaim: (data: Record<string, unknown>) => void;
}

const StepStarterPack = ({ onClaim }: Props) => {
  const [pickupOption, setPickupOption] = useState<"pickup" | "ship">("pickup");
  const [shopTarget, setShopTarget] = useState("");
  const [promoDate, setPromoDate] = useState("");
  const [buybackAccepted, setBuybackAccepted] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <Package className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-2">
          Claim Your Starter Pack
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Reserve your 15-unit Starter Pack. Protected by our 14-day buyback guarantee — no risk to the shop.
        </p>
      </div>

      <div className="space-y-4">
        {/* Delivery option */}
        <div className="space-y-2">
          <p className="font-display text-xs tracking-wider text-muted-foreground">DELIVERY METHOD</p>
          <div className="grid grid-cols-2 gap-2">
            {(["pickup", "ship"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setPickupOption(opt)}
                className={`glass-surface rounded-xl p-3 border text-center transition-all ${
                  pickupOption === opt ? "border-accent/50 bg-accent/5" : "border-border/50"
                }`}
              >
                <p className="font-display text-sm font-bold text-foreground capitalize">{opt === "pickup" ? "Pick Up" : "Ship to Me"}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-display text-xs tracking-wider text-muted-foreground">FIRST SHOP TARGET</label>
          <Input
            value={shopTarget}
            onChange={(e) => setShopTarget(e.target.value)}
            placeholder="Shop name or area you'll visit first"
            className="bg-card/50 border-border/50 font-body text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="font-display text-xs tracking-wider text-muted-foreground">PLANNED PROMO DATE</label>
          <Input
            type="date"
            value={promoDate}
            onChange={(e) => setPromoDate(e.target.value)}
            className="bg-card/50 border-border/50 font-body text-sm"
          />
        </div>

        <div className="glass-surface rounded-xl p-4 border border-border/50">
          <div className="flex items-start gap-3">
            <Checkbox
              id="buyback"
              checked={buybackAccepted}
              onCheckedChange={(c) => setBuybackAccepted(c === true)}
            />
            <label htmlFor="buyback" className="font-body text-xs text-foreground leading-relaxed cursor-pointer">
              <Shield className="w-3.5 h-3.5 inline mr-1 text-accent" />
              I understand the <span className="font-bold">14-day buyback guarantee</span>: unsold units can be returned within 14 days for a full refund. No risk to the shop or to me.
            </label>
          </div>
        </div>
      </div>

      <div className="glass-surface rounded-xl p-3 border border-accent/30 bg-accent/5 text-center">
        <p className="font-body text-xs text-foreground">
          🎁 <span className="font-bold">Instant reward:</span> €20 promo credit added to your account upon claiming
        </p>
      </div>

      <Button
        size="lg"
        disabled={!buybackAccepted}
        onClick={() => onClaim({ pickupOption, shopTarget, promoDate })}
        className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm"
      >
        Claim Starter Pack & Earn €20 Credit →
      </Button>
    </motion.div>
  );
};

export default StepStarterPack;
