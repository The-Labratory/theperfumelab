import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Users, ArrowRight, FlaskConical, Handshake } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import lhaririLogo from "@/assets/lhariri-logo.png";

const GatewayPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      <ParticleField count={15} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-12"
      >
        <img src={lhaririLogo} alt="The Perfume Lab" className="h-14 sm:h-20 w-auto mx-auto" />
        <p className="text-[10px] font-display tracking-[0.4em] text-muted-foreground uppercase mt-3 text-center">
          Choose Your Path
        </p>
      </motion.div>

      {/* Two Cards */}
      <div className="relative z-10 grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl w-full">
        {/* Customize Perfume */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Link
            to="/home"
            className="group block glass-surface rounded-2xl p-8 sm:p-10 text-center hover:border-primary/40 transition-all duration-300 h-full"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
                <FlaskConical className="w-9 h-9 text-primary group-hover:drop-shadow-[0_0_16px_hsl(185_80%_55%/0.6)] transition-all" />
              </div>
            </motion.div>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider gradient-text mb-3">
              Customise Your Perfume
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
              Create your signature scent from 200+ molecular ingredients. Designed by you, blended by artisans.
            </p>
            <div className="inline-flex items-center gap-2 text-primary font-display text-xs tracking-[0.2em] uppercase group-hover:gap-3 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              Start Creating
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </motion.div>

        {/* Become a Partner */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <Link
            to="/affiliate"
            className="group block glass-surface rounded-2xl p-8 sm:p-10 text-center hover:border-accent/40 transition-all duration-300 h-full"
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto group-hover:bg-accent/20 group-hover:border-accent/40 transition-colors">
                <Handshake className="w-9 h-9 text-accent group-hover:drop-shadow-[0_0_16px_hsl(35_90%_55%/0.6)] transition-all" />
              </div>
            </motion.div>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-3">
              Become a <span className="text-accent">Partner</span>
            </h2>
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
              Join our affiliate network. Share, promote, and earn up to 25% commission on every sale.
            </p>
            <div className="inline-flex items-center gap-2 text-accent font-display text-xs tracking-[0.2em] uppercase group-hover:gap-3 transition-all">
              <Users className="w-3.5 h-3.5" />
              Join Now
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 text-[10px] text-muted-foreground/50 font-display tracking-[0.2em] uppercase mt-12"
      >
        © 2026 The Perfume Lab
      </motion.p>
    </div>
  );
};

export default GatewayPage;
