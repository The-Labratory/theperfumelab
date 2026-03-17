import { motion } from "framer-motion";
import { Sparkles, Clock, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  displayName: string;
  onStart: () => void;
}

const StepWelcome = ({ displayName, onStart }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-lg mx-auto text-center space-y-6"
  >
    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
      <Sparkles className="w-8 h-8 text-accent" />
    </div>

    <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground">
      Welcome, {displayName} — Your Local Partner Journey Starts Here
    </h1>

    <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
      Do this onboarding once and you'll be set for your first payout in the next 48 hours.
      We'll give you the scripts, proof, and a guaranteed quick win.
    </p>

    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
      {[
        { icon: Clock, text: "Quick: 15 minutes to finish" },
        { icon: Trophy, text: "Guaranteed first-48hr plan + starter pack" },
        { icon: Sparkles, text: "Short quiz to unlock activation bonus" },
        { icon: Users, text: "Weekly coaching & local cohort support" },
      ].map((item) => (
        <div
          key={item.text}
          className="glass-surface rounded-xl p-3 border border-border/50 text-left flex items-start gap-2"
        >
          <item.icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
          <span className="font-body text-xs text-foreground">{item.text}</span>
        </div>
      ))}
    </div>

    <Button
      size="lg"
      onClick={onStart}
      className="bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90 w-full max-w-sm"
    >
      I'm ready — Start now (takes 15 mins)
    </Button>
  </motion.div>
);

export default StepWelcome;
