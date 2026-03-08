import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Camera, Video, FileText, MessageSquare, BookOpen,
  Download, ArrowRight, Sparkles, Instagram, Play
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Button } from "@/components/ui/button";

const VIDEO_IDEAS = [
  "Unbox a Perfume Lab package and share your first impressions",
  "Rate 3 scents blindfolded and reveal your favorite",
  "'Which Perfume Lab scent matches your zodiac sign?' challenge",
  "Day vs. Night scent routine using two different fragrances",
  "'Perfume that gets the most compliments' — reveal your top pick",
  "ASMR bottle reveal + cap twist + spritz close-up",
  "Get Ready With Me featuring your signature Perfume Lab scent",
  "'Luxury perfume for under €50?' — show the value proposition",
  "Scent layering tutorial: combine two fragrances for a unique blend",
  "Story time: the moment someone asked 'What are you wearing?'",
];

const SCRIPTS = [
  {
    title: "The Hook Script",
    script: `"Stop scrolling if you love perfume. I just discovered a brand that lets you CREATE your own scent — and it actually smells luxury. Link in bio, you need to see this."`,
  },
  {
    title: "The Comparison",
    script: `"Everyone's paying €120 for designer perfume. I found something better for half the price. This brand hand-blends each bottle and the quality is insane. Use my link for a surprise."`,
  },
  {
    title: "The Story",
    script: `"So someone stopped me in the elevator today and asked what I was wearing. I told them it's a custom blend I designed myself. Their face? Priceless. Here's how you can do it too."`,
  },
  {
    title: "The Urgency Script",
    script: `"They only make limited batches and my last favorite sold out in 3 days. If you've been wanting to try luxury handcrafted perfume — now's the time. Link below."`,
  },
  {
    title: "The Education Script",
    script: `"Did you know most designer perfumes use only 3-4% fragrance oil? The Perfume Lab uses up to 20%. That's why one spray lasts all day. Check the difference yourself."`,
  },
];

const CAPTIONS = [
  `This scent stopped conversations today. People kept asking what I was wearing — and honestly? I designed it myself. 🖤✨ Custom luxury perfume from @theperfumelab. Link in bio.`,
  `POV: You found a perfume brand that actually smells like luxury without the luxury price tag. Obsessed. 🤍 #PerfumeLab #FragranceReview`,
  `My signature scent era starts now. Hand-blended, custom formula, and it lasts ALL day. 🌹 Use my link for something special →`,
  `"What perfume are you wearing?" — the best compliment. Thank you @theperfumelab for making it happen. ✨`,
  `3 sprays. 12 hours. Infinite compliments. That's the Perfume Lab difference. 🔥 #LuxuryPerfume #CustomScent`,
];

const STORY_CAPTIONS = [
  `There's something about wearing a scent nobody else has. When I discovered The Perfume Lab, I realized perfume isn't just a product — it's a statement. Every bottle tells a story, and mine starts here. 🖤`,
  `I used to think all perfumes were the same until I tried a hand-blended formula for the first time. The depth, the longevity, the way it evolves on your skin throughout the day — it's an entirely different experience. Here's why I'll never go back to mass-produced fragrances.`,
  `My grandmother always said: "A woman who doesn't wear perfume has no future." I think she'd be proud of this one. Custom-crafted, one of a kind, and it smells like possibility. 🌹`,
];

const PROMO_GUIDE = [
  { step: "1", title: "Share Authentically", desc: "Post genuine reviews and experiences. Audiences trust real opinions over hard sells." },
  { step: "2", title: "Use Your Link Everywhere", desc: "Bio, stories, captions, DMs, emails — your affiliate link should be easy to find." },
  { step: "3", title: "Create Content Weekly", desc: "Consistency beats virality. Post 2-3 times per week about fragrance." },
  { step: "4", title: "Engage Your Audience", desc: "Reply to comments, ask questions, do polls. Engagement drives clicks." },
  { step: "5", title: "Track & Optimize", desc: "Check your dashboard weekly. Double down on what drives the most sales." },
];

const AffiliateStarterPackPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={8} />

      <div className="relative z-10 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-display tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> STARTER PACK
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
            Affiliate Starter Pack
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
            Everything you need to start promoting and earning. Copy, paste, post, profit.
          </p>
        </motion.div>

        {/* Product Photos Section */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Product Photos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                <Camera className="w-6 h-6 text-muted-foreground/50" />
              </div>
            ))}
          </div>
          <p className="font-body text-[10px] text-muted-foreground mt-2">
            Right-click to save, or download the full pack below.
          </p>
        </motion.section>

        {/* Video Ideas */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground">10 TikTok/Instagram Video Ideas</h2>
          </div>
          <div className="space-y-3">
            {VIDEO_IDEAS.map((idea, i) => (
              <div key={i} className="glass-surface rounded-xl px-5 py-3 border border-border/50 flex items-start gap-3">
                <span className="font-display text-xs text-accent font-bold shrink-0 mt-0.5">{i + 1}.</span>
                <p className="font-body text-sm text-muted-foreground">{idea}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Short-form Scripts */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Play className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground">5 Video Scripts</h2>
          </div>
          <div className="space-y-4">
            {SCRIPTS.map((s, i) => (
              <div key={i} className="glass-surface rounded-xl p-5 border border-border/50">
                <p className="font-display text-xs font-bold text-primary tracking-wider mb-2">{s.title}</p>
                <p className="font-body text-sm text-muted-foreground italic leading-relaxed">{s.script}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Instagram Captions */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground">5 Instagram Captions</h2>
          </div>
          <div className="space-y-3">
            {CAPTIONS.map((c, i) => (
              <div key={i} className="glass-surface rounded-xl p-5 border border-border/50">
                <p className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{c}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Storytelling Captions */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground">3 Storytelling Captions</h2>
          </div>
          <div className="space-y-4">
            {STORY_CAPTIONS.map((c, i) => (
              <div key={i} className="glass-surface rounded-xl p-5 border border-accent/10">
                <p className="font-body text-sm text-muted-foreground leading-relaxed italic">{c}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Promotion Guide */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold tracking-wider text-foreground">How to Promote & Earn More</h2>
          </div>
          <div className="space-y-4">
            {PROMO_GUIDE.map((g) => (
              <div key={g.step} className="glass-surface rounded-xl p-5 border border-border/50 flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-display text-xs font-bold text-primary">{g.step}</span>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-foreground tracking-wider mb-1">{g.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-center glass-surface rounded-2xl p-8 border border-primary/20"
        >
          <h3 className="font-display text-lg font-bold text-foreground tracking-wider mb-3">
            Ready to Start Earning?
          </h3>
          <p className="font-body text-xs text-muted-foreground mb-6">
            Use these assets, share your link, and watch commissions roll in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/affiliate">
              <Button className="bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/partner-program">
              <Button variant="outline" className="font-display tracking-wider text-sm">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateStarterPackPage;
