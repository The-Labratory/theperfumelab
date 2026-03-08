import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Beaker, Globe, Lock, Star, Users, FlaskConical, Quote, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlowOrb from "@/components/GlowOrb";
import ParticleField from "@/components/ParticleField";
import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";
import heroOrb from "@/assets/hero-orb.jpg";
import WalkingAlchemist from "@/components/WalkingAlchemist";

const testimonials = [
  {
    name: "Sophia L.",
    role: "Founding Creator",
    quote: "testimonials.sophia",
    rating: 5,
  },
  {
    name: "James K.",
    role: "Fragrance Collector",
    quote: "testimonials.james",
    rating: 5,
  },
  {
    name: "Amira R.",
    role: "Creative Director",
    quote: "testimonials.amira",
    rating: 5,
  },
  {
    name: "Marcus W.",
    role: "Founding Creator",
    quote: "testimonials.marcus",
    rating: 5,
  },
];

const stats = [
  { value: "2,400+", labelKey: "social.blendsCreated", icon: FlaskConical },
  { value: "98%", labelKey: "social.satisfaction", icon: Star },
  { value: "47", labelKey: "social.countries", icon: Globe },
  { value: "100", labelKey: "social.founders", icon: Users },
];

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

          <WalkingAlchemist />
        </div>

        <GlowOrb className="absolute bottom-20 right-10 w-32 h-32 opacity-30 hidden lg:block" />
      </section>

      {/* Social Proof Stats */}
      <section className="relative z-10 py-16 px-6 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2 opacity-70" />
                <p className="font-display text-3xl md:text-4xl font-black gradient-text mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-display tracking-[0.2em] uppercase">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
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

      {/* Fragrance Quiz CTA */}
      <section className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
          <div className="absolute inset-0 glass-surface" />
          <div className="relative z-10 p-10 md:p-16 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-10 h-10 text-accent drop-shadow-[0_0_20px_hsl(35_90%_55%/0.6)]" />
            </motion.div>
            <h2 className="font-display text-2xl sm:text-4xl font-black tracking-wider mb-3">
              <span className="gradient-text">{t("quiz.title")}</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-body max-w-xl mx-auto mb-3 leading-relaxed">
              {t("quiz.description")}
            </p>
            <p className="text-xs text-foreground/40 font-display tracking-[0.2em] uppercase mb-8">
              {t("quiz.duration")}
            </p>
            <Button asChild size="lg" className="glow-accent bg-accent text-accent-foreground hover:bg-accent/90 font-display tracking-wider text-sm">
              <Link to="/onboarding">{t("quiz.cta")} <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs text-primary font-display tracking-[0.3em] uppercase mb-3">{t("testimonials.badge")}</p>
            <h2 className="font-display text-2xl sm:text-4xl font-black tracking-wider gradient-text">{t("testimonials.title")}</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-surface rounded-xl p-8 group hover:border-primary/20 transition-colors relative"
              >
                <Quote className="w-6 h-6 text-primary/20 absolute top-6 right-6" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: item.rating }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 font-body leading-relaxed mb-5 italic">
                  "{t(item.quote)}"
                </p>
                <div>
                  <p className="font-display text-sm font-semibold tracking-wide text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-display tracking-wider">{item.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="relative z-10 py-12 px-6 border-y border-border/30">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {[
            { icon: Shield, label: t("trust.ssl") },
            { icon: FlaskConical, label: t("trust.handBlended") },
            { icon: Lock, label: t("trust.exclusive") },
            { icon: Star, label: t("trust.ifra") },
          ].map((badge, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <badge.icon className="w-4 h-4 text-primary/60" />
              <span className="text-[10px] font-display tracking-[0.2em] uppercase">{badge.label}</span>
            </motion.div>
          ))}
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
