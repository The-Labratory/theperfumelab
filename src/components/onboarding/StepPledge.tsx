import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  displayName: string;
  onSign: (pledgeText: string) => void;
}

const DEFAULT_PLEDGE =
  "I pledge to complete the Quick Win Plan and visit 20 shops in the next 48 hours.";

const StepPledge = ({ displayName, onSign }: Props) => {
  const [pledgeText, setPledgeText] = useState(DEFAULT_PLEDGE);
  const [shareWithCohort, setShareWithCohort] = useState(true);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-2">
          Your Public Micro-Pledge
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Public commitment increases follow-through. Make it real.
        </p>
      </div>

      <div className="glass-surface rounded-2xl p-5 border border-border/50 space-y-4">
        <p className="font-display text-sm text-foreground">
          I, <span className="text-accent font-bold">{displayName}</span>, hereby pledge:
        </p>
        <Textarea
          value={pledgeText}
          onChange={(e) => setPledgeText(e.target.value)}
          rows={3}
          className="bg-card/50 border-border/50 font-body text-sm"
          maxLength={500}
        />

        <div className="flex items-start gap-3">
          <Checkbox
            id="share-cohort"
            checked={shareWithCohort}
            onCheckedChange={(c) => setShareWithCohort(c === true)}
          />
          <label htmlFor="share-cohort" className="font-body text-xs text-muted-foreground cursor-pointer">
            Share my anonymized pledge progress with my cohort feed
          </label>
        </div>
      </div>

      <div className="glass-surface rounded-xl p-3 border border-accent/30 bg-accent/5 text-center flex items-center justify-center gap-2">
        <Award className="w-4 h-4 text-accent" />
        <p className="font-body text-xs text-foreground">
          <span className="font-bold">Pledge badge unlocked</span> upon signing
        </p>
      </div>

      <Button
        size="lg"
        disabled={!pledgeText.trim()}
        onClick={() => onSign(pledgeText)}
        className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm"
      >
        Sign My Pledge →
      </Button>
    </motion.div>
  );
};

export default StepPledge;
