import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Users, ArrowRight, FlaskConical, Handshake, Trophy, TrendingUp } from "lucide-react";
import ParticleField from "@/components/ParticleField";
import lhaririLogo from "@/assets/lhariri-logo.png";
import WalkingAlchemist from "@/components/WalkingAlchemist";


interface TopAffiliate {
  id: string;
  display_name: string;
  tier: string;
  total_sales: number;
  total_referrals: number;
}

const tierColors: Record<string, string> = {
  platinum: "from-purple-400 to-purple-600",
  gold: "from-yellow-400 to-amber-600",
  silver: "from-gray-300 to-gray-500",
  bronze: "from-orange-400 to-orange-600",
  high_achiever: "from-primary to-accent"
};

const tierEmoji: Record<string, string> = {
  bronze: "🥉", silver: "🥈", gold: "🥇", platinum: "💎", high_achiever: "👑"
};

const GatewayPage = () => {
  const topAffiliates: TopAffiliate[] = [
    { id: "1", display_name: "Mariam El-Atassi", tier: "platinum", total_sales: 9240, total_referrals: 47 },
    { id: "2", display_name: "Youssef Hariri", tier: "platinum", total_sales: 7185, total_referrals: 38 },
    { id: "3", display_name: "Layla Benkirane", tier: "gold", total_sales: 3120, total_referrals: 22 },
    { id: "4", display_name: "Omar Chtioui", tier: "gold", total_sales: 1340, total_referrals: 14 },
    { id: "5", display_name: "Sofia Mansouri", tier: "silver", total_sales: 815, total_referrals: 9 },
    { id: "6", display_name: "Karim Tazi", tier: "silver", total_sales: 490, total_referrals: 7 },
    { id: "7", display_name: "Nadia Ouazzani", tier: "bronze", total_sales: 375, total_referrals: 5 },
    { id: "8", display_name: "Amine Fassi", tier: "bronze", total_sales: 310, total_referrals: 4 },
    { id: "9", display_name: "Hana Kettani", tier: "bronze", total_sales: 245, total_referrals: 3 },
    { id: "10", display_name: "Reda Alaoui", tier: "bronze", total_sales: 218, total_referrals: 2 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.3, 0.9, 1] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(185 80% 55%), transparent 70%)" }} />
        
        <motion.div
          animate={{ x: [0, -60, 50, 0], y: [0, 50, -70, 0], scale: [1, 0.85, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
          className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full opacity-15 blur-[120px]"
          style={{ background: "radial-gradient(circle, hsl(35 90% 55%), transparent 70%)" }} />
        
        <motion.div
          animate={{ x: [0, 40, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.15, 0.95, 1] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] rounded-full opacity-10 blur-[100px]"
          style={{ background: "radial-gradient(circle, hsl(270 60% 50%), transparent 70%)" }} />
        
      </div>

      {/* Video background */}
      <div className="absolute inset-0 z-0">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-35">
          <source src="/videos/ugc-content.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
      style={{
        backgroundImage: "linear-gradient(hsl(185 80% 55%) 1px, transparent 1px), linear-gradient(90deg, hsl(185 80% 55%) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />
      

      <ParticleField count={20} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 mb-12">
        <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
          <img src={lhaririLogo} alt="The Perfume Lab" className="h-24 sm:h-36 w-auto mx-auto drop-shadow-[0_0_40px_hsl(185_80%_55%/0.4)]" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.2em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-[10px] font-display text-muted-foreground uppercase mt-4 text-center">
          
          Choose Your Path
        </motion.p>
      </motion.div>

      {/* Two Cards */}
      <div className="relative z-10 grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl w-full">
        {/* Customize Perfume */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <Link to="/home" className="group block glass-surface rounded-2xl p-8 sm:p-10 text-center hover:border-primary/40 transition-all duration-500 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-primary/10 transition-all duration-500 rounded-2xl" />
            <div className="relative z-10">
              <motion.div animate={{ rotate: [0, 5, -5, 0], y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:shadow-[0_0_40px_hsl(185_80%_55%/0.3)] transition-all duration-500">
                  <FlaskConical className="w-9 h-9 text-primary group-hover:drop-shadow-[0_0_16px_hsl(185_80%_55%/0.6)] transition-all" />
                </div>
              </motion.div>
              <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider gradient-text mb-3">Customise Your Perfume</h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">Create your signature scent from 200+ molecular ingredients. Designed by you, blended by artisans.</p>
              <div className="inline-flex items-center gap-2 text-primary font-display text-xs tracking-[0.2em] uppercase group-hover:gap-3 transition-all duration-300">
                <Sparkles className="w-3.5 h-3.5" />
                Start Creating
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Sign Up Now */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.6 }}>
          <Link to="/affiliate-signup" className="group block glass-surface rounded-2xl p-8 sm:p-10 text-center hover:border-accent/40 transition-all duration-500 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:via-transparent group-hover:to-accent/10 transition-all duration-500 rounded-2xl" />
            <div className="relative z-10">
              <motion.div animate={{ rotate: [0, -5, 5, 0], y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto group-hover:bg-accent/20 group-hover:border-accent/40 group-hover:shadow-[0_0_40px_hsl(35_90%_55%/0.3)] transition-all duration-500">
                  <Handshake className="w-9 h-9 text-accent group-hover:drop-shadow-[0_0_16px_hsl(35_90%_55%/0.6)] transition-all" />
                </div>
              </motion.div>
              <h2 className="font-display text-xl sm:text-2xl font-black tracking-wider text-foreground mb-3">
                <span className="text-foreground">Become a </span><span className="text-accent">Partner!</span>
              </h2>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">Join our affiliate network. Share, promote, and earn up to 50% commission on every sale.</p>
              <div className="inline-flex items-center gap-2 text-accent font-display text-xs tracking-[0.2em] uppercase group-hover:gap-3 transition-all duration-300">
                <Users className="w-3.5 h-3.5" />
                Sign Up Now
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Top 10 Affiliate Networks */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 mt-12 w-full max-w-3xl">
        
          <div className="flex items-center gap-2 mb-5 justify-center">
            <Trophy className="w-4 h-4 text-accent" />
            <h3 className="font-display text-sm tracking-[0.2em] uppercase text-foreground font-bold">Top 10 Partners</h3>
            <Trophy className="w-4 h-4 text-accent" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {topAffiliates.map((a, i) =>
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="glass-surface rounded-xl p-4 text-center border border-border/30 hover:border-accent/30 transition-all relative overflow-hidden group">
            
                {i === 0 &&
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            }
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tierColors[a.tier] || "from-muted to-muted"} flex items-center justify-center mx-auto mb-2 text-sm font-display font-black text-background`}>
                    {i + 1}
                  </div>
                  <p className="font-display text-xs font-bold text-foreground truncate">{a.display_name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{tierEmoji[a.tier] || "🥉"} {a.tier?.toUpperCase()}</p>
                  <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-primary font-display font-bold">
                    <TrendingUp className="w-3 h-3" />
                    €{a.total_sales.toFixed(0)}
                  </div>
                </div>
              </motion.div>
          )}
          </div>
        </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 text-[10px] text-muted-foreground/50 font-display tracking-[0.2em] uppercase mt-12">
        
        © 2026 The Perfume Lab
      </motion.p>
    </div>);

};

export default GatewayPage;