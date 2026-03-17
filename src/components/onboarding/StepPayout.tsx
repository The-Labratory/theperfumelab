import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  onSave: () => void;
}

const StepPayout = ({ onSave }: Props) => {
  const [method, setMethod] = useState("bank");
  const [iban, setIban] = useState("");
  const [holderName, setHolderName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [commissionTerms, setCommissionTerms] = useState(false);

  const isValid = termsAccepted && commissionTerms && holderName.trim().length > 2;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <CreditCard className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-2">
          Payout Setup & Legal
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Set up your payout method. Payouts are processed weekly.
        </p>
      </div>

      <div className="glass-surface rounded-2xl p-5 border border-border/50 space-y-4">
        <div className="space-y-2">
          <label className="font-display text-xs tracking-wider text-muted-foreground">PAYOUT METHOD</label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="bg-card/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank Transfer (IBAN)</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="wise">Wise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="font-display text-xs tracking-wider text-muted-foreground">ACCOUNT HOLDER NAME</label>
          <Input
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Full legal name"
            className="bg-card/50 border-border/50 font-body text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="font-display text-xs tracking-wider text-muted-foreground">
            {method === "bank" ? "IBAN" : method === "paypal" ? "PAYPAL EMAIL" : "WISE EMAIL"}
          </label>
          <Input
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder={method === "bank" ? "DE89 3704 0044 0532 0130 00" : "email@example.com"}
            className="bg-card/50 border-border/50 font-body text-sm"
          />
        </div>

        {/* Commission example */}
        <div className="glass-surface rounded-xl p-3 border border-accent/20 bg-accent/5">
          <p className="font-display text-xs tracking-wider text-muted-foreground mb-2">PAYOUT EXAMPLE</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-display text-sm font-bold text-foreground">€180</p>
              <p className="font-body text-[9px] text-muted-foreground">Weekly sales</p>
            </div>
            <div>
              <p className="font-display text-sm font-bold text-accent">40%</p>
              <p className="font-body text-[9px] text-muted-foreground">Your rate</p>
            </div>
            <div>
              <p className="font-display text-sm font-bold text-green-500">€72</p>
              <p className="font-body text-[9px] text-muted-foreground">Your payout</p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c === true)} />
            <label htmlFor="terms" className="font-body text-xs text-foreground cursor-pointer">
              <Shield className="w-3.5 h-3.5 inline mr-1 text-accent" />
              I accept the <span className="font-bold">Partner Terms & Conditions</span> and the 14-day buyback policy.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="commission" checked={commissionTerms} onCheckedChange={(c) => setCommissionTerms(c === true)} />
            <label htmlFor="commission" className="font-body text-xs text-foreground cursor-pointer">
              I understand the commission structure, weekly payout cadence, and minimum weekly sales requirement (5 units) to unlock payouts.
            </label>
          </div>
        </div>
      </div>

      <Button
        size="lg"
        disabled={!isValid}
        onClick={onSave}
        className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm"
      >
        Save Payout Details & Continue →
      </Button>
    </motion.div>
  );
};

export default StepPayout;
