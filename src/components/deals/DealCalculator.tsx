import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

/**
 * DealCalculator — B2B Pricing Calculator (Module C)
 *
 * Shows a live breakdown of:
 *  - Wholesale price after 40% discount
 *  - Expected B2B commission (10–20%) on the discounted total
 *  - Tier 2 parent referrer override (5%) — informational only
 */
export function DealCalculator() {
  const [retailPrice, setRetailPrice] = useState(500);
  const [units, setUnits] = useState(10);
  const WHOLESALE_DISCOUNT = 0.4; // 40% wholesale discount (fixed)

  const orderTotal = retailPrice * units;
  const wholesaleTotal = orderTotal * (1 - WHOLESALE_DISCOUNT);

  // B2C commission on full retail (50%)
  const b2cCommission = orderTotal * 0.5;

  // B2B commission rate: tiered by wholesale total
  const b2bCommissionPct = wholesaleTotal >= 500 ? 20 : wholesaleTotal >= 200 ? 15 : 10;
  const b2bCommission = (wholesaleTotal * b2bCommissionPct) / 100;

  // Tier 2: 5% of the order total (capped at 1 level up)
  const tier2Commission = orderTotal * 0.05;

  return (
    <div className="glass-surface rounded-xl border border-border/30 p-5 space-y-5">
      <h3 className="font-display text-sm font-bold tracking-wider text-foreground">
        💎 B2B Pricing Calculator
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-display text-muted-foreground tracking-wider">
            UNIT RETAIL PRICE (€)
          </Label>
          <Input
            type="number"
            min={1}
            value={retailPrice}
            onChange={(e) => setRetailPrice(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-display text-muted-foreground tracking-wider">
            UNITS
          </Label>
          <Input
            type="number"
            min={1}
            value={units}
            onChange={(e) => setUnits(Math.max(1, Number(e.target.value)))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-display text-muted-foreground tracking-wider">
          WHOLESALE DISCOUNT (FIXED 40%)
        </Label>
        <Slider value={[40]} min={40} max={40} disabled className="opacity-60" />
      </div>

      <div className="space-y-2 rounded-lg bg-muted/20 p-4 text-xs font-body">
        <Row label="Retail Total" value={`€${orderTotal.toFixed(2)}`} />
        <Row
          label="Wholesale Total (–40%)"
          value={`€${wholesaleTotal.toFixed(2)}`}
          sub="Client pays this"
        />
        <div className="border-t border-border/20 my-2" />
        <Row
          label="B2C Commission (50%)"
          value={`€${b2cCommission.toFixed(2)}`}
          highlight
        />
        <Row
          label={`B2B Commission (${b2bCommissionPct}% on wholesale)`}
          value={`€${b2bCommission.toFixed(2)}`}
          highlight
        />
        <Row
          label="Tier 2 Override (5% for parent referrer)"
          value={`€${tier2Commission.toFixed(2)}`}
          sub="Capped at 1 level"
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className={`text-muted-foreground ${highlight ? "font-semibold text-foreground" : ""}`}>
        {label}
        {sub && <span className="block text-[10px] text-muted-foreground font-normal">{sub}</span>}
      </span>
      <span
        className={`font-display font-bold shrink-0 ${
          highlight ? "text-primary text-sm" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
