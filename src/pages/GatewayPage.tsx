import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Users, ArrowRight, FlaskConical, Handshake } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import lhaririLogo from "@/assets/lhariri-logo.png";
import heroOrb from "@/assets/hero-orb.jpg";
import alchemistAvatar from "@/assets/alchemist-avatar.png";

const GatewayPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(185 80% 55%), transparent 70%)" }}
        />
        <motion.div
          animate={{
            x: [0, -60, 50, 0],
            y: [0, 50, -70, 0],
            scale: [1, 0.85, 1.2, 1],
          }}
          transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(35 90% 55%), transparent 70%)" }}
        />
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(270 60% 50%), transparent 70%)" }}
        />
      </div>

      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-35"
        >
          <source src="/videos/ugc-content.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      {/* Animated grid lines */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(185 80% 55%) 1px, transparent 1px), linear-gradient(90deg, hsl(185 80% 55%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <ParticleField count={20} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-12"
      >
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <img src={lhaririLogo} alt="The Perfume Lab" className="h-24 sm:h-36 w-auto mx-auto drop-shadow-[0_0_40px_hsl(185_80%_55%/0.4)]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-[10px] font-display text-muted-foreground uppercase mt-4 text-center"
        >
          Choose Your Path
        </motion.p>
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
            className="group block glass-surface rounded-2xl p-8 sm:p-10 text-center hover:border-primary/40 transition-all duration-500 h-full relative overflow-hidden"
          >
            {/* Card glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-primary/10 transition-all duration-500 rounded-2xl" />
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_40px_hsl(185_80%_55%/0.3)] transition-all duration-500">
                  <FlaskConical className="w-9 h-9 text-primary group-hover:drop-shadow-[0_0_16px_hsl(185_80%_55%/0.6)] transition-all" />
                </div>
              </motion.div>
              <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider gradient-text mb-3">
                Customise Your Perfume
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
                Create your signature scent from 200+ molecular ingredients. Designed by you, blended by artisans.
              </p>
              <div className="inline-flex items-center gap-2 text-primary font-display text-xs tracking-[0.2em] uppercase group-hover:gap-3 transition-all duration-300">
                <Sparkles className="w-3.5 h-3.5" />
                Start Creating
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
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
            className="group block glass-surface rounded-2xl p-8 sm:p-10 text-center hover:border-accent/40 transition-all duration-500 h-full relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-transparent group-hover:to-accent/10 transition-all duration-500 rounded-2xl" />
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0], y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto group-hover:bg-accent/20 group-hover:border-accent/40 group-hover:shadow-[0_0_40px_hsl(35_90%_55%/0.3)] transition-all duration-500">
                  <Handshake className="w-9 h-9 text-accent group-hover:drop-shadow-[0_0_16px_hsl(35_90%_55%/0.6)] transition-all" />
                </div>
              </motion.div>
              <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-3">
                Become a <span className="text-accent">Partner</span>
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
                Join our affiliate network. Share, promote, and earn up to 25% commission on every sale.
              </p>
              <div className="inline-flex items-center gap-2 text-accent font-display text-xs tracking-[0.2em] uppercase group-hover:gap-3 transition-all duration-300">
                <Users className="w-3.5 h-3.5" />
                Join Now
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Walking Alchemist */}
      <motion.div
        initial={{ x: "-20vw", opacity: 0 }}
        animate={{ x: "120vw", opacity: [0, 1, 1, 1, 0] }}
        transition={{ duration: 14, repeat: Infinity, repeatDelay: 4, ease: "linear" }}
        className="fixed bottom-8 z-20 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={alchemistAvatar}
            alt="Alchemist Perfumer"
            className="h-28 sm:h-40 w-auto drop-shadow-[0_0_20px_hsl(185_80%_55%/0.4)]"
          />
        </motion.div>
        {/* Trailing particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 4 + Math.random() * 4,
              height: 4 + Math.random() * 4,
              bottom: 20 + Math.random() * 40,
              right: 30 + i * 18,
              background: i % 2 === 0
                ? "hsl(var(--primary) / 0.6)"
                : "hsl(var(--accent) / 0.6)",
            }}
            animate={{
              opacity: [0.8, 0],
              y: [0, -20 - Math.random() * 20],
              scale: [1, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.25,
              ease: "easeOut",
            }}
          />
        ))}
      </motion.div>

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
