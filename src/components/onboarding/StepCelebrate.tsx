import { motion } from "framer-motion";
import { PartyPopper, Calendar, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  displayName: string;
  partnerNumber: number;
  onFinish: () => void;
}

const StepCelebrate = ({ displayName, partnerNumber, onFinish }: Props) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="max-w-lg mx-auto text-center space-y-6"
  >
    <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto">
      <PartyPopper className="w-10 h-10 text-accent" />
    </div>

    <h2 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground">
      You're Live — First-48hr Plan Ready! 🚀
    </h2>

    <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
      Congratulations, <span className="text-accent font-bold">{displayName}</span>! 
      Your starter pack is reserved and your 48-hour plan is active.
    </p>

    <div className="glass-surface rounded-xl p-4 border border-accent/30 bg-accent/5 inline-block">
      <p className="font-body text-xs text-muted-foreground mb-1">You're Partner</p>
      <p className="font-display text-2xl font-black text-accent">#{partnerNumber}</p>
      <p className="font-body text-[10px] text-muted-foreground">Top partners average €2,400 in their first month</p>
    </div>

    <div className="grid gap-3 max-w-sm mx-auto">
      <div className="glass-surface rounded-xl p-3 border border-border/50 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-accent shrink-0" />
        <div className="text-left">
          <p className="font-display text-sm font-bold text-foreground">24hr Coaching Call</p>
          <p className="font-body text-xs text-muted-foreground">Book your 15-min check-in with a coach</p>
        </div>
      </div>
      <div className="glass-surface rounded-xl p-3 border border-border/50 flex items-center gap-3">
        <MessageCircle className="w-5 h-5 text-accent shrink-0" />
        <div className="text-left">
          <p className="font-display text-sm font-bold text-foreground">Cohort Chat</p>
          <p className="font-body text-xs text-muted-foreground">Join your local partner group</p>
        </div>
      </div>
      <div className="glass-surface rounded-xl p-3 border border-border/50 flex items-center gap-3">
        <Share2 className="w-5 h-5 text-accent shrink-0" />
        <div className="text-left">
          <p className="font-display text-sm font-bold text-foreground">Share Progress</p>
          <p className="font-body text-xs text-muted-foreground">Show your pledge to your cohort</p>
        </div>
      </div>
    </div>

    <div className="glass-surface rounded-xl p-3 border border-green-500/30 bg-green-500/5">
      <p className="font-body text-xs text-foreground">
        🎁 <span className="font-bold">Onboarding badge unlocked</span> + €20 promo credit + 2% commission boost for your first 2 weeks
      </p>
    </div>

    <Button
      size="lg"
      onClick={onFinish}
      className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90"
    >
      Go to My Dashboard →
    </Button>
  </motion.div>
);

export default StepCelebrate;
