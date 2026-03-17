import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onComplete: (level: string) => void;
}

const LEVELS = [
  { id: "bronze", label: "Bronze — Starter", emoji: "🥉", desc: "Just getting started, eager to learn" },
  { id: "silver", label: "Silver — Active", emoji: "🥈", desc: "Ready to commit 10+ hours/week" },
  { id: "gold", label: "Gold — Leader", emoji: "🥇", desc: "Building a team, full-time hustle" },
];

const TESTIMONIALS = [
  { name: "Sarah K.", city: "Berlin", earned: "€2,400", period: "first month", photo: "🧑‍💼" },
  { name: "Ahmed R.", city: "Dubai", earned: "€1,800", period: "first 3 weeks", photo: "👨‍💼" },
  { name: "Maria L.", city: "Milan", earned: "€3,100", period: "first month", photo: "👩‍💼" },
];

const StepIdentity = ({ onComplete }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <Users className="w-8 h-8 text-accent mx-auto mb-3" />
        <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-2">
          You're not an affiliate. You're a Local Partner.
        </h2>
        <p className="font-body text-sm text-muted-foreground">
          Local Partners build territory businesses. They get paid for real sales, coaching and territory privileges.
        </p>
      </div>

      {/* Testimonials */}
      <div className="space-y-2">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground">PARTNERS LIKE YOU</p>
        <div className="grid gap-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-surface rounded-xl p-3 border border-border/50 flex items-center gap-3">
              <span className="text-2xl">{t.photo}</span>
              <div>
                <p className="font-display text-sm font-bold text-foreground">{t.name} — {t.city}</p>
                <p className="font-body text-xs text-muted-foreground">
                  Earned <span className="text-accent font-bold">{t.earned}</span> in their {t.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Level selection */}
      <div className="space-y-2">
        <p className="font-display text-[10px] tracking-widest text-muted-foreground">CHOOSE YOUR PARTNER LEVEL</p>
        <div className="grid gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`glass-surface rounded-xl p-4 border text-left transition-all ${
                selected === l.id ? "border-accent/50 bg-accent/5" : "border-border/50 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{l.emoji}</span>
                <div>
                  <p className="font-display text-sm font-bold text-foreground">{l.label}</p>
                  <p className="font-body text-xs text-muted-foreground">{l.desc}</p>
                </div>
                {selected === l.id && <Star className="w-4 h-4 text-accent ml-auto" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        disabled={!selected}
        onClick={() => selected && onComplete(selected)}
        className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm"
      >
        Continue as {selected ? LEVELS.find((l) => l.id === selected)?.label : "..."} →
      </Button>
    </motion.div>
  );
};

export default StepIdentity;
