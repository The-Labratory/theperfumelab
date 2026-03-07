import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Crown, DollarSign, Gift, Users, TrendingUp, Star,
  Sparkles, ArrowRight, ShieldCheck, Zap, Package, CheckCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  { icon: DollarSign, title: "20% Base Commission", desc: "Earn on every sale from day one — no minimums." },
  { icon: Crown, title: "Up to 50% Platinum", desc: "Top partners earn 50% on every referral purchase." },
  { icon: Gift, title: "Free Sample Kit", desc: "Creators who post get a complimentary fragrance kit." },
  { icon: Users, title: "Bring 3 → Get 1 Free", desc: "Recruit 3 affiliates and receive a full-size perfume." },
  { icon: Package, title: "Starter Pack Included", desc: "Get photos, scripts, captions — everything you need to sell." },
  { icon: TrendingUp, title: "Real-Time Dashboard", desc: "Track clicks, sales, commissions, and rank in real time." },
];

const TIERS = [
  { name: "Standard", commission: "20%", requirement: "Join the program", color: "border-muted-foreground/30" },
  { name: "Gold", commission: "35%", requirement: "25+ referred sales", color: "border-accent/50" },
  { name: "Platinum", commission: "50%", requirement: "100+ referred sales", color: "border-primary/50", featured: true },
];

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Beauty Creator", quote: "I earned €400 in my first month just sharing my honest reviews. The starter pack made it so easy." },
  { name: "Karim D.", role: "Fragrance Enthusiast", quote: "The 50% Platinum rate is real. I built a small team and now earn passively every week." },
  { name: "Lina T.", role: "Instagram Influencer", quote: "The free sample kit helped me create authentic content. My audience loved it and sales followed naturally." },
];

const FAQ = [
  { q: "How much can I earn?", a: "You start at 20% commission on every sale. As you grow, you can earn up to 50% as a Platinum partner. Most active affiliates earn €200–€1,000/month." },
  { q: "How do I get paid?", a: "Commissions are tracked in real time on your dashboard. You can request a payout via bank transfer once your balance reaches €50." },
  { q: "Do I need a big following?", a: "Not at all! Many of our top partners started with fewer than 500 followers. Authentic recommendations convert better than big audiences." },
  { q: "What is the 'Bring 3 Get 1 Free' offer?", a: "When you recruit 3 new affiliates who each make at least one sale, you receive a full-size luxury perfume of your choice — completely free." },
  { q: "Is there a cost to join?", a: "No. The program is 100% free. You also get a free starter pack with marketing materials to help you begin." },
  { q: "What products can I promote?", a: "You can promote our entire catalog of handcrafted luxury fragrances. Each product has a generous commission attached." },
];

const PartnerProgramPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={12} />

      {/* Hero */}
      <section className="relative z-10 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 text-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-display tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> PARTNER PROGRAM
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-wider text-foreground leading-tight mb-6">
            Earn Up To <span className="text-accent">50%</span> Commission<br />
            Promoting Luxury Perfumes
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join The Perfume Lab partner program. Share your love for fragrance, earn generous commissions, and unlock exclusive rewards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/affiliate-signup">
              <Button size="lg" className="bg-accent text-accent-foreground font-display tracking-wider text-sm px-8 hover:bg-accent/90">
                Join Now — It's Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/affiliate">
              <Button size="lg" variant="outline" className="font-display tracking-wider text-sm px-8">
                I'm Already a Partner
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Benefits Grid */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-6xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
          Why Partners Love Us
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((b, i) => (
            <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-sm font-bold text-foreground tracking-wider mb-2">{b.title}</h3>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-4xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center text-foreground mb-4">
          Commission Tiers
        </motion.h2>
        <p className="font-body text-sm text-muted-foreground text-center mb-10">
          The more you sell, the more you earn. Platinum partners unlock 50% on every sale.
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {TIERS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className={`glass-surface rounded-2xl p-6 border-2 ${t.color} text-center relative ${t.featured ? "ring-1 ring-primary/20" : ""}`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-display tracking-widest">
                  MOST POPULAR
                </div>
              )}
              <h3 className="font-display text-lg font-bold text-foreground tracking-wider mb-2">{t.name}</h3>
              <div className="font-display text-4xl font-black text-accent mb-2">{t.commission}</div>
              <p className="font-body text-xs text-muted-foreground">{t.requirement}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bring 3 Get 1 Free */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-surface rounded-3xl p-8 sm:p-12 border border-accent/20 text-center"
        >
          <Gift className="w-12 h-12 text-accent mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Bring 3 Affiliates → Get 1 <span className="text-accent">Free Perfume</span>
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Recruit 3 new partners who each make at least one sale, and we'll send you a full-size luxury fragrance — on us. No strings attached.
          </p>
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
            ))}
            <div className="flex items-center">
              <ArrowRight className="w-5 h-5 text-accent" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Gift className="w-6 h-6 text-accent" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
          What Partners Say
        </motion.h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-2xl p-6 border border-border/50"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, si) => <Star key={si} className="w-3.5 h-3.5 text-accent fill-accent" />)}
              </div>
              <p className="font-body text-sm text-muted-foreground italic mb-4">"{t.quote}"</p>
              <div>
                <p className="font-display text-xs font-bold text-foreground">{t.name}</p>
                <p className="font-body text-[10px] text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 max-w-3xl mx-auto">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="font-display text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-4">
          {FAQ.map((f, i) => (
            <motion.details key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-surface rounded-xl border border-border/50 group"
            >
              <summary className="px-6 py-4 cursor-pointer font-display text-sm font-semibold text-foreground tracking-wide list-none flex items-center justify-between">
                {f.q}
                <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-4">
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            </motion.details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-4 sm:px-6 pb-24 text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="glass-surface rounded-3xl p-10 border border-primary/20"
        >
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Ready to Start Earning?
          </h2>
          <p className="font-body text-sm text-muted-foreground mb-8 max-w-md mx-auto">
            Join hundreds of partners already earning commissions with The Perfume Lab. It only takes 60 seconds.
          </p>
          <Link to="/affiliate-signup">
            <Button size="lg" className="bg-accent text-accent-foreground font-display tracking-wider text-sm px-10 hover:bg-accent/90">
              Join the Partner Program <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default PartnerProgramPage;
