import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Beaker, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlowOrb from "@/components/GlowOrb";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import heroOrb from "@/assets/hero-orb.jpg";

const features = [
{
  icon: Sparkles,
  title: "Discover Your Scent DNA",
  description: "Enter a story-driven origin experience to uncover your unique fragrance personality."
},
{
  icon: Globe,
  title: "Explore Scent Worlds",
  description: "Journey through six immersive realms — from enchanted forests to neon night cities."
},
{
  icon: Beaker,
  title: "The Scent Lab",
  description: "Blend notes with precision sliders. Watch your creation come alive in real-time."
}];


const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <ParticleField count={25} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={heroOrb} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-wider mb-2">
              <span className="gradient-text">Perfumer Lab </span>
            </h1>
            <p className="font-display text-sm md:text-base tracking-[0.3em] text-primary/80 mb-8 uppercase">
              Design · Blend · Evolve
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-body">

            Become a Scent Alchemist. Craft custom fragrances by exploring worlds, 
            mastering combinations, and unlocking rare ingredients.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">

            <Button asChild size="lg" className="glow-primary font-display tracking-wider text-sm">
              <Link to="/onboarding">
                Begin Your Journey <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-display tracking-wider text-sm border-border hover:border-primary/50 hover:bg-primary/5">
              <Link to="/lab">Enter Scent Lab</Link>
            </Button>
          </motion.div>
        </div>

        {/* Floating orb decoration */}
        <GlowOrb className="absolute bottom-20 right-10 w-32 h-32 opacity-30 hidden lg:block" />
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8">

            {features.map((f, i) =>
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-surface rounded-xl p-8 group hover:border-primary/30 transition-colors">

                <f.icon className="w-8 h-8 text-primary mb-4 group-hover:drop-shadow-[0_0_12px_hsl(185_80%_55%/0.5)] transition-all" />
                <h3 className="font-display text-base font-semibold tracking-wide mb-2 text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground font-body tracking-wide">
          © 2026 SCENTRA — Your scent, your world.
        </p>
      </footer>
    </div>);

};

export default Index;