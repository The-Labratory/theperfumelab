import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Video, MessageSquare, Camera, Package, HelpCircle, Mail,
  ArrowRight, Sparkles, BookOpen, Play, Download, ChevronDown,
  Send, FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const TIKTOK_SCRIPTS = [
  { title: "The Mystery Hook", script: `"Nobody asked, but I'm gonna tell you my #1 perfume secret anyway. This brand lets you literally BUILD your own scent molecule by molecule. Not kidding. Link in bio."` },
  { title: "The Before & After", script: `"Before: smelling like everyone else. After: wearing a custom-blended luxury scent nobody else has. The glow up is real. @theperfumelab made it happen."` },
  { title: "The Challenge", script: `"Let's see if this niche perfume brand can actually beat Dior Sauvage. *opens package* Okay the bottle alone is gorgeous... *sprays* Wait. WAIT. This is insane."` },
  { title: "The Storytime", script: `"So I got this perfume sample kit and decided to test it on a date. Three hours in, they literally said 'you smell incredible, what is that?' That's when I knew this brand was different."` },
  { title: "The GRWM", script: `"Get ready with me but the star of today is my new fragrance. I'm layering two scents from The Perfume Lab — cedar base with a citrus top. Trust me, this combination is *chef's kiss*."` },
  { title: "The Education Drop", script: `"Fun fact: designer perfumes cost about €3 to make and sell for €120. Niche brands like The Perfume Lab actually use premium ingredients and hand-blend every bottle. The difference? You can SMELL it."` },
  { title: "The Reaction Video", script: `"Asking strangers to rate my perfume 1-10. *approaches people* Excuse me, can you rate how I smell? *reactions* See? That's the power of quality fragrance."` },
  { title: "The Whisper ASMR", script: `"*whisper* Let me show you the most aesthetic perfume unboxing ever. *opens box slowly* Look at this packaging. *spritz sound* And the scent... it's giving luxury hotel lobby vibes."` },
];

const INSTAGRAM_CAPTIONS = [
  `Some people collect shoes. I collect scents. And this latest addition from @theperfumelab just became my signature. 🖤`,
  `Fragrance tip: spray on pulse points AND in your hair. Thank me later. ✨ #PerfumeLab #ScentOfTheDay`,
  `Not every perfume needs to be expensive. But every perfume should be GOOD. Found both in one place → link in bio 🌹`,
  `My morning routine isn't complete without this. One spray. All day confidence. That's it. That's the post. 🔥`,
  `"You always smell so good" — best compliment I keep receiving since switching to @theperfumelab 💫`,
  `Creating my own fragrance was a bucket list thing. Didn't know it could be THIS easy (and this affordable). Mind = blown. 🤯`,
  `Style is what you wear. Scent is who you are. Choose wisely. 🖤 #LuxuryPerfume #FragranceCommunity`,
  `Plot twist: the compliment I got today wasn't about my outfit — it was about my perfume. @theperfumelab wins again. ✨`,
];

const UNBOXING_SCRIPT = `
📦 UNBOXING SCRIPT — The Perfume Lab

INTRO (0-3 sec):
"Okay, this just arrived and I'm SO excited to open it."

REVEAL (3-10 sec):
*Show the package* "Look at this packaging — it feels premium before you even open it."
*Open slowly* "The box has this magnetic close... very satisfying."

FIRST LOOK (10-20 sec):
*Pull out bottle* "The bottle design is gorgeous. Minimalist but luxurious."
*Show label* "It has the blend number and concentration type right here."

THE SPRAY (20-30 sec):
*Spray on wrist* "Let me give this a test... *pause* ...okay wow."
"This is giving [describe: fresh/warm/sweet/woody]."

VERDICT (30-45 sec):
"On a scale of 1-10, this is easily a [number]. The quality difference between this and regular perfume is night and day."
"Link in bio if you want to try it yourself. Trust me on this one."

END CARD:
"Follow for more perfume content! 🖤"
`.trim();

const FAQ_ITEMS = [
  { q: "How do I request a free sample kit?", a: "Fill out the sample request form below with your social media links. We review requests within 48 hours and ship to approved creators within 5 business days." },
  { q: "What content should I create?", a: "Authentic, genuine content works best. Unboxings, reviews, GRWM videos, and comparison posts perform really well. Use our script library for inspiration." },
  { q: "How much can I earn as a creator?", a: "You earn 50% commission on every B2C sale through your link. B2B partners earn 20% on every order and reorder. Top creators earn €500-€2,000/month." },
  { q: "Can I use the product photos for my content?", a: "Absolutely! All photos and assets in the Starter Pack are free to use. We encourage you to mix them with your own content for authenticity." },
  { q: "How do I track my performance?", a: "Your Affiliate Dashboard shows real-time stats: clicks, sales, commission earned, and your current rank." },
  { q: "Do I need a minimum following?", a: "No! We work with creators of all sizes. Micro-influencers often have higher engagement and conversion rates." },
  { q: "How long does my affiliate link last?", a: "Your link never expires. Once someone clicks it, there's a 30-day cookie window for attribution." },
  { q: "Can I promote on multiple platforms?", a: "Yes. Use your link on TikTok, Instagram, YouTube, Twitter, blogs, newsletters — anywhere your audience lives." },
];

const CreatorPortalPage = () => {
  const [sampleForm, setSampleForm] = useState({ name: "", email: "", instagram: "", tiktok: "", message: "" });
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sampleSubmitting, setSampleSubmitting] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleSampleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleForm.name || !sampleForm.email || (!sampleForm.instagram && !sampleForm.tiktok)) {
      toast.error("Please fill in your name, email, and at least one social media handle.");
      return;
    }
    setSampleSubmitting(true);
    setTimeout(() => {
      toast.success("Sample request submitted! We'll review it within 48 hours.");
      setSampleForm({ name: "", email: "", instagram: "", tiktok: "", message: "" });
      setSampleSubmitting(false);
    }, 1000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setContactSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
      setContactSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={8} />

      <div className="relative z-10 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-display tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> CREATOR HUB
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
            Creator Resource Portal
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
            Scripts, captions, images, and everything you need to create killer content and earn commissions.
          </p>
        </motion.div>

        <Tabs defaultValue="scripts" className="w-full">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6 mb-8 bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="scripts" className="font-display text-[10px] tracking-wider">Scripts</TabsTrigger>
            <TabsTrigger value="captions" className="font-display text-[10px] tracking-wider">Captions</TabsTrigger>
            <TabsTrigger value="photos" className="font-display text-[10px] tracking-wider">Photos</TabsTrigger>
            <TabsTrigger value="unboxing" className="font-display text-[10px] tracking-wider">Unboxing</TabsTrigger>
            <TabsTrigger value="sample" className="font-display text-[10px] tracking-wider">Sample Kit</TabsTrigger>
            <TabsTrigger value="faq" className="font-display text-[10px] tracking-wider">FAQ</TabsTrigger>
          </TabsList>

          {/* TikTok Script Library */}
          <TabsContent value="scripts">
            <div className="flex items-center gap-3 mb-6">
              <Video className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">TikTok Script Library</h2>
            </div>
            <div className="space-y-4">
              {TIKTOK_SCRIPTS.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass-surface rounded-xl p-5 border border-border/50"
                >
                  <p className="font-display text-xs font-bold text-primary tracking-wider mb-2">{s.title}</p>
                  <p className="font-body text-sm text-muted-foreground italic leading-relaxed">{s.script}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Instagram Captions */}
          <TabsContent value="captions">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Instagram Caption Library</h2>
            </div>
            <div className="space-y-3">
              {INSTAGRAM_CAPTIONS.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="glass-surface rounded-xl p-5 border border-border/50"
                >
                  <p className="font-body text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{c}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Photos */}
          <TabsContent value="photos">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Free Perfume Images</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center hover:border-primary/30 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-muted-foreground/30" />
                </div>
              ))}
            </div>
            <p className="font-body text-xs text-muted-foreground text-center">
              Right-click to save individual images. Full pack available in the{" "}
              <Link to="/affiliate-starter-pack" className="text-primary hover:underline">Starter Pack</Link>.
            </p>
          </TabsContent>

          {/* Unboxing Script */}
          <TabsContent value="unboxing">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Sample Unboxing Script</h2>
            </div>
            <div className="glass-surface rounded-xl p-6 border border-border/50">
              <pre className="font-body text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {UNBOXING_SCRIPT}
              </pre>
            </div>
          </TabsContent>

          {/* Sample Kit Request */}
          <TabsContent value="sample">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-5 h-5 text-accent" />
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Request a Free Sample Kit</h2>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-6">
              Creators who post authentic content can receive a complimentary fragrance sample kit. Tell us about yourself below.
            </p>
            <form onSubmit={handleSampleRequest} className="glass-surface rounded-xl p-6 border border-border/50 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display text-xs tracking-wider">Name *</Label>
                  <Input value={sampleForm.name} onChange={e => setSampleForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name" maxLength={100} className="bg-card/50 border-border/50 font-body" />
                </div>
                <div className="space-y-2">
                  <Label className="font-display text-xs tracking-wider">Email *</Label>
                  <Input type="email" value={sampleForm.email} onChange={e => setSampleForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com" maxLength={255} className="bg-card/50 border-border/50 font-body" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display text-xs tracking-wider">Instagram *</Label>
                  <Input value={sampleForm.instagram} onChange={e => setSampleForm(p => ({ ...p, instagram: e.target.value }))}
                    placeholder="@handle" maxLength={100} className="bg-card/50 border-border/50 font-body" />
                </div>
                <div className="space-y-2">
                  <Label className="font-display text-xs tracking-wider">TikTok</Label>
                  <Input value={sampleForm.tiktok} onChange={e => setSampleForm(p => ({ ...p, tiktok: e.target.value }))}
                    placeholder="@handle" maxLength={100} className="bg-card/50 border-border/50 font-body" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-display text-xs tracking-wider">Why should we send you a kit?</Label>
                <Textarea value={sampleForm.message} onChange={e => setSampleForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your content and audience..." maxLength={500}
                  className="bg-card/50 border-border/50 font-body text-sm min-h-[80px] resize-none" />
              </div>
              <Button type="submit" disabled={sampleSubmitting}
                className="w-full bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90">
                {sampleSubmitting ? "Submitting..." : "Request Sample Kit"} <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>

            {/* Contact Support */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-5 h-5 text-primary" />
                <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Contact Support</h2>
              </div>
              <form onSubmit={handleContactSubmit} className="glass-surface rounded-xl p-6 border border-border/50 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-display text-xs tracking-wider">Name *</Label>
                    <Input value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your name" maxLength={100} className="bg-card/50 border-border/50 font-body" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-display text-xs tracking-wider">Email *</Label>
                    <Input type="email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="your@email.com" maxLength={255} className="bg-card/50 border-border/50 font-body" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-display text-xs tracking-wider">Subject</Label>
                  <Input value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="What's this about?" maxLength={200} className="bg-card/50 border-border/50 font-body" />
                </div>
                <div className="space-y-2">
                  <Label className="font-display text-xs tracking-wider">Message *</Label>
                  <Textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="How can we help?" maxLength={1000}
                    className="bg-card/50 border-border/50 font-body text-sm min-h-[100px] resize-none" />
                </div>
                <Button type="submit" disabled={contactSubmitting} variant="outline"
                  className="w-full font-display tracking-wider text-sm">
                  {contactSubmitting ? "Sending..." : "Send Message"} <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">Creator FAQ</h2>
            </div>
            <div className="space-y-3">
              {FAQ_ITEMS.map((f, i) => (
                <details key={i} className="glass-surface rounded-xl border border-border/50 group">
                  <summary className="px-5 py-4 cursor-pointer font-display text-sm font-semibold text-foreground tracking-wide list-none flex items-center justify-between">
                    {f.q}
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{f.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorPortalPage;
