import { motion } from "framer-motion";
import { Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onAccept: () => void;
}

const TASKS = [
  { label: "Claim your 15-unit Starter Pack (small refundable deposit)", time: "2 min" },
  { label: "Watch a 2-minute demo and run a 3-question quiz", time: "3 min" },
  { label: "Book your first 20 shops (we'll give a territory list)", time: "5 min" },
  { label: "Do a 60-second 'owner pitch' in 3 shops, collect one commitment", time: "30 min" },
  { label: "Run a 1-hour sampling promo in shop #1", time: "60 min" },
  { label: "Log results in your tracker", time: "2 min" },
];

const StepQuickWin = ({ onAccept }: Props) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
    <div className="text-center">
      <Target className="w-8 h-8 text-accent mx-auto mb-3" />
      <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-2">
        Your first €100+ in 48 hours — the exact steps
      </h2>
      <p className="font-body text-sm text-muted-foreground">
        Follow these 6 micro-tasks and you'll have your first payout ready.
      </p>
    </div>

    <div className="space-y-2">
      {TASKS.map((task, i) => (
        <div key={i} className="glass-surface rounded-xl p-3 border border-border/50 flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <span className="font-display text-xs font-bold text-accent">{i + 1}</span>
          </div>
          <div className="flex-1">
            <p className="font-body text-sm text-foreground">{task.label}</p>
          </div>
          <span className="font-display text-[10px] text-muted-foreground shrink-0">{task.time}</span>
        </div>
      ))}
    </div>

    <div className="glass-surface rounded-xl p-4 border border-accent/30 bg-accent/5">
      <p className="font-body text-xs text-foreground text-center">
        <span className="font-bold">Conservative estimate:</span> If shop accepts 15-unit pack + 8 customers buy:
        you earn <span className="text-accent font-bold">€3.60 × 8 + activation bonus = €48.80+</span> in 48h
      </p>
    </div>

    <Button
      size="lg"
      onClick={onAccept}
      className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm"
    >
      Reserve my Starter Pack & Start Quick Plan →
    </Button>
  </motion.div>
);

export default StepQuickWin;
