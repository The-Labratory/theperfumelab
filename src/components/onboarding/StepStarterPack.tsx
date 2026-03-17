import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  affiliateId?: string;
  onClaim: (data: Record<string, unknown>) => void;
}

const StepStarterPack = ({ affiliateId, onClaim }: Props) => {
  const { t } = useTranslation();
  const [pickupOption, setPickupOption] = useState<"pickup" | "ship">("pickup");
  const [shopTarget, setShopTarget] = useState("");
  const [promoDate, setPromoDate] = useState("");
  const [buybackAccepted, setBuybackAccepted] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!affiliateId) {
      onClaim({ pickupOption, shopTarget, promoDate });
      return;
    }

    setClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke("claim-starter-pack", {
        body: {
          affiliate_id: affiliateId,
          pickup_option: pickupOption,
          shop_target: shopTarget,
          promo_date: promoDate,
        },
      });

      if (error) throw error;
      if (data?.error && !data?.already_claimed) throw new Error(data.error);

      onClaim({ pickupOption, shopTarget, promoDate, claimed_via_edge: true });
    } catch (err: any) {
      toast.error(t("affiliateOnboarding.starterPackError"));
      console.error("Starter pack claim error:", err);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <Package className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-2">
          {t("affiliateOnboarding.starterPackTitle")}
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          {t("affiliateOnboarding.starterPackDesc")}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="font-display text-xs tracking-wider text-muted-foreground">
            {t("affiliateOnboarding.deliveryMethod")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(["pickup", "ship"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setPickupOption(opt)}
                className={`glass-surface rounded-xl p-3 border text-center transition-all ${
                  pickupOption === opt ? "border-accent/50 bg-accent/5" : "border-border/50"
                }`}
              >
                <p className="font-display text-sm font-bold text-foreground">
                  {opt === "pickup" ? t("affiliateOnboarding.pickUp") : t("affiliateOnboarding.shipToMe")}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-display text-xs tracking-wider text-muted-foreground">
            {t("affiliateOnboarding.shopTarget")}
          </label>
          <Input
            value={shopTarget}
            onChange={(e) => setShopTarget(e.target.value)}
            placeholder={t("affiliateOnboarding.shopTargetPlaceholder")}
            className="bg-card/50 border-border/50 font-body text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="font-display text-xs tracking-wider text-muted-foreground">
            {t("affiliateOnboarding.promoDate")}
          </label>
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
              {t("affiliateOnboarding.buybackTerms")}
            </label>
          </div>
        </div>
      </div>

      <div className="glass-surface rounded-xl p-3 border border-accent/30 bg-accent/5 text-center">
        <p className="font-body text-xs text-foreground">
          🎁 <span className="font-bold">{t("affiliateOnboarding.instantReward")}</span>
        </p>
      </div>

      <Button
        size="lg"
        disabled={!buybackAccepted || claiming}
        onClick={handleClaim}
        className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm"
      >
        {claiming ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("affiliateOnboarding.claiming")}</>
        ) : (
          t("affiliateOnboarding.claimCta")
        )}
      </Button>
    </motion.div>
  );
};

export default StepStarterPack;
