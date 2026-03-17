import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  onComplete: (tasks: string[]) => void;
}

const DAY_1_TASKS = [
  "Visit 10 shops in your territory",
  "Demo product in 6 shops",
  "Book 1 sampling promo session",
];

const DAY_2_TASKS = [
  "Visit 10 more shops",
  "Demo product in 8 shops",
  "Sign 2 shops for starter packs",
];

const DAY_3_TASKS = [
  "Follow up with interested shops",
  "Run sampling promo event",
  "Log all results in tracker",
];

const StepTasks = ({ onComplete }: Props) => {
  const allTasks = [...DAY_1_TASKS, ...DAY_2_TASKS, ...DAY_3_TASKS];
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (task: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(task)) next.delete(task);
      else next.add(task);
      return next;
    });
  };

  const renderDay = (label: string, tasks: string[]) => (
    <div className="space-y-2">
      <p className="font-display text-xs tracking-widest text-muted-foreground">{label}</p>
      {tasks.map((t) => (
        <div key={t} className="glass-surface rounded-xl p-3 border border-border/50 flex items-center gap-3">
          <Checkbox checked={checked.has(t)} onCheckedChange={() => toggle(t)} />
          <span className={`font-body text-sm ${checked.has(t) ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {t}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl font-black tracking-wider text-foreground mb-2">
          Your First 48-Hour Task Plan
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Check the tasks you commit to completing. You can track progress from your dashboard later.
        </p>
      </div>

      {renderDay("DAY 1", DAY_1_TASKS)}
      {renderDay("DAY 2", DAY_2_TASKS)}
      {renderDay("DAY 3", DAY_3_TASKS)}

      <Button
        size="lg"
        disabled={checked.size < 3}
        onClick={() => onComplete(Array.from(checked))}
        className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm"
      >
        Commit to {checked.size} tasks & Continue →
      </Button>
    </motion.div>
  );
};

export default StepTasks;
