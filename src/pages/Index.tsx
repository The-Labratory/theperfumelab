import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Beaker, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlowOrb from "@/components/GlowOrb";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";
import heroOrb from "@/assets/hero-orb.jpg";

const Index = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Sparkles, title: t("features.identity"), description: t("features.identityDesc") },
    { icon: Globe, title: t("features.worlds"), description: t("features.worldsDesc") },
    { icon: Beaker, title: t("features.atelier"), description: t("features.atelierDesc") },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <ParticleField count={25} />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 z-0">
          <img src={heroOrb} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex justify-center mb-6">
              <div className="glass-surface rounded-full px-4 py-1.5 flex items-center gap-2 border border-primary/20">
                <Lock className="w-3 h-3 text-primary" />
                <span className="font-display text-[9px] tracking-[0.3em] text-primary uppercase">{t("hero.badge")}</span>
              </div>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-wider mb-2">
              <span className="gradient-text">{t("hero.title")}</span>
            </h1>
            <p className="font-display text-sm md:text-base tracking-[0.3em] text-primary/80 mb-8 uppercase">{t("hero.subtitle")}</p>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 font-body">
            {t("hero.description")}
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="text-sm text-foreground/50 font-body italic mb-10">
            {t("hero.note")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="glow-primary font-display tracking-wider text-sm">
              <Link to="/access">{t("hero.cta")} <Lock className="ml-2 w-4 h-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-display tracking-wider text-sm border-border hover:border-primary/50 hover:bg-primary/5">
              <Link to="/onboarding">{t("hero.journey")} <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </div>

        <GlowOrb className="absolute bottom-20 right-10 w-32 h-32 opacity-30 hidden lg:block" />
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-surface rounded-xl p-8 group hover:border-primary/30 transition-colors">
                <f.icon className="w-8 h-8 text-primary mb-4 group-hover:drop-shadow-[0_0_12px_hsl(185_80%_55%/0.5)] transition-all" />
                <h3 className="font-display text-base font-semibold tracking-wide mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="inline-block mb-6">
            <Beaker className="w-12 h-12 text-primary drop-shadow-[0_0_24px_hsl(185_80%_55%/0.6)]" />
          </motion.div>
          <h2 className="font-display text-2xl sm:text-4xl font-black tracking-wider gradient-text mb-4">{t("cta.title")}</h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-xl mx-auto mb-4 leading-relaxed">{t("cta.description")}</p>
          <p className="text-sm text-foreground/60 font-display tracking-wider mb-8 italic">{t("cta.note")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="glow-primary font-display tracking-wider text-sm">
              <Link to="/lab">{t("cta.lab")} <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-display tracking-wider text-sm border-border hover:border-primary/50 hover:bg-primary/5">
              <Link to="/collection">{t("cta.browse")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground font-body tracking-wide">{t("footer.copyright")}</p>
      </footer>
    </div>
  );
};

export default Index;
