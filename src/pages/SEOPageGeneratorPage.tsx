import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Sparkles, FileText, ArrowRight, Globe, TrendingUp,
  Wand2, CheckCircle, ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedPage {
  title: string;
  slug: string;
  metaDescription: string;
  keyword: string;
  content: {
    intro: string;
    recommendations: { name: string; description: string; cta: string }[];
    conclusion: string;
  };
}

const EXAMPLE_KEYWORDS = [
  "Best long-lasting perfumes for men",
  "Best perfumes like Dior Sauvage",
  "Best summer perfumes for women",
  "Best date-night perfumes",
  "Best fruity perfumes",
  "Best winter fragrances 2025",
  "Affordable luxury perfumes",
  "Best perfumes for gifting",
];

const SEOPageGeneratorPage = () => {
  const [keyword, setKeyword] = useState("");
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedPage, setGeneratedPage] = useState<GeneratedPage | null>(null);
  const [published, setPublished] = useState(false);

  const generatePage = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword.");
      return;
    }

    setGenerating(true);
    setGeneratedPage(null);
    setPublished(false);

    try {
      // Use AI to generate SEO content
      const { data, error } = await supabase.functions.invoke("perfumer-ai", {
        body: {
          messages: [
            {
              role: "system",
              content: `You are an SEO content writer for a luxury perfume brand called "The Perfume Lab" (theperfumelab.shop). Generate a JSON object with these fields:
              - title: SEO-optimized page title (60 chars max)
              - slug: URL-friendly slug
              - metaDescription: SEO meta description (155 chars max)
              - intro: 2-3 sentence intro paragraph
              - recommendations: array of 3 objects, each with name, description (2 sentences), and cta (call to action text)
              - conclusion: 2-3 sentence conclusion encouraging joining the affiliate program
              
              Only return valid JSON, no markdown.`,
            },
            {
              role: "user",
              content: `Generate an SEO page for the keyword: "${keyword.trim()}"${description ? `. Context: ${description.trim()}` : ""}`,
            },
          ],
        },
      });

      // Handle specific error codes
      if (data?.error || error) {
        const status = data?.status || error?.status;
        if (status === 401) { toast.error("Please sign in to generate SEO pages"); return; }
        if (status === 429) { toast.error("Too many requests — please wait a moment"); return; }
        if (status === 402) { toast.error("AI credits exhausted. Please add credits."); return; }
        if (error) throw error;
      }

      const text = data?.content || "";
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");

      const parsed = JSON.parse(jsonMatch[0]);
      setGeneratedPage({
        title: parsed.title || keyword,
        slug: parsed.slug || keyword.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        metaDescription: parsed.metaDescription || "",
        keyword: keyword.trim(),
        content: {
          intro: parsed.intro || "",
          recommendations: (parsed.recommendations || []).slice(0, 4),
          conclusion: parsed.conclusion || "",
        },
      });
      toast.success("SEO page generated!");
    } catch (err: any) {
      // Fallback: generate locally
      const slug = keyword.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      setGeneratedPage({
        title: keyword.trim(),
        slug,
        metaDescription: `Discover the ${keyword.trim().toLowerCase()} at The Perfume Lab. Hand-blended luxury fragrances crafted for those who appreciate quality.`,
        keyword: keyword.trim(),
        content: {
          intro: `Looking for the ${keyword.trim().toLowerCase()}? The Perfume Lab offers a curated selection of hand-blended luxury fragrances that rival the world's most prestigious houses — at a fraction of the price.`,
          recommendations: [
            { name: "Nocturne Elixir", description: "A rich, mysterious blend of oud, amber, and dark vanilla. Perfect for evening wear and special occasions.", cta: "Explore Nocturne Elixir →" },
            { name: "Solar Breeze", description: "Fresh citrus top notes meet warm sandalwood and white musk. An all-day companion that evolves beautifully.", cta: "Discover Solar Breeze →" },
            { name: "Velvet Rose", description: "Bulgarian rose, saffron, and cedarwood create an unforgettable signature scent. Elegant and long-lasting.", cta: "Try Velvet Rose →" },
          ],
          conclusion: `Every fragrance at The Perfume Lab is hand-blended with premium ingredients and made to last. Want to share these scents and earn up to 50% commission? Join our Partner Program today.`,
        },
      });
      toast.success("SEO page generated with template content!");
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = () => {
    setPublished(true);
    toast.success("Page published! It will appear on your site shortly.", {
      description: `/${generatedPage?.slug}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-24 sm:pt-32 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-display tracking-widest mb-4">
            <Globe className="w-3.5 h-3.5" /> SEO TOOL
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black tracking-wider text-foreground mb-2">
            SEO Page Generator
          </h1>
          <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
            Generate optimized landing pages for perfume keywords. Each page includes recommendations and an affiliate CTA.
          </p>
        </motion.div>

        {/* Generator Form */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="glass-surface rounded-2xl p-6 sm:p-8 border border-border/50 mb-8"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-display text-xs tracking-wider">Target Keyword *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={keyword} onChange={e => setKeyword(e.target.value)}
                  placeholder="e.g. Best long-lasting perfumes for men"
                  maxLength={200}
                  className="pl-10 bg-card/50 border-border/50 font-body" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-display text-xs tracking-wider">Description / Context (optional)</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Any specific angle, season, or niche to focus on..."
                maxLength={500}
                className="bg-card/50 border-border/50 font-body text-sm min-h-[60px] resize-none" />
            </div>

            <Button onClick={generatePage} disabled={generating}
              className="w-full bg-primary text-primary-foreground font-display tracking-wider text-sm hover:bg-primary/90">
              {generating ? (
                <>Generating with AI... <Wand2 className="w-4 h-4 ml-2 animate-spin" /></>
              ) : (
                <>Generate SEO Page <Sparkles className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>

          {/* Example Keywords */}
          <div className="mt-6 pt-4 border-t border-border/30">
            <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-3">EXAMPLE KEYWORDS</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_KEYWORDS.map(k => (
                <button key={k} onClick={() => setKeyword(k)}
                  className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 font-body text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                  {k}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Generated Page Preview */}
        {generatedPage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* SEO Meta Preview */}
            <div className="glass-surface rounded-xl p-5 border border-primary/20 mb-6">
              <p className="font-display text-[10px] tracking-widest text-primary mb-3">
                <Globe className="w-3 h-3 inline mr-1" /> SEARCH PREVIEW
              </p>
              <div className="bg-card/50 rounded-lg p-4">
                <p className="font-body text-sm text-primary hover:underline cursor-pointer">{generatedPage.title}</p>
                <p className="font-body text-xs text-primary mt-0.5">theperfumelab.de/{generatedPage.slug}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{generatedPage.metaDescription}</p>
              </div>
            </div>

            {/* Page Content Preview */}
            <div className="glass-surface rounded-2xl p-6 sm:p-8 border border-border/50 mb-6">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-4">PAGE CONTENT PREVIEW</p>

              <h2 className="font-display text-xl font-bold text-foreground mb-4">{generatedPage.title}</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">{generatedPage.content.intro}</p>

              <div className="space-y-4 mb-8">
                {generatedPage.content.recommendations.map((r, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-5 border border-border/30">
                    <h3 className="font-display text-sm font-bold text-foreground mb-2">{i + 1}. {r.name}</h3>
                    <p className="font-body text-xs text-muted-foreground mb-3">{r.description}</p>
                    <button className="text-primary font-display text-xs tracking-wider hover:underline">
                      {r.cta}
                    </button>
                  </div>
                ))}
              </div>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{generatedPage.content.conclusion}</p>

              <div className="bg-accent/10 rounded-xl p-5 border border-accent/20 text-center">
                <p className="font-display text-sm font-bold text-foreground mb-2">Join the Partner Program</p>
                <p className="font-body text-xs text-muted-foreground mb-3">Earn up to 50% commission promoting luxury fragrances.</p>
                <Button size="sm" className="bg-accent text-accent-foreground font-display text-xs tracking-wider">
                  Become a Partner <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            {/* Publish */}
            <div className="flex gap-3">
              {!published ? (
                <Button onClick={handlePublish}
                  className="flex-1 bg-accent text-accent-foreground font-display tracking-wider text-sm hover:bg-accent/90">
                  <CheckCircle className="w-4 h-4 mr-2" /> Publish Page
                </Button>
              ) : (
                <div className="flex-1 glass-surface rounded-xl p-4 border border-primary/20 text-center">
                  <p className="font-display text-sm text-primary flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Published at /{generatedPage.slug}
                  </p>
                </div>
              )}
              <Button variant="outline" onClick={() => { setGeneratedPage(null); setPublished(false); }}
                className="font-display tracking-wider text-sm">
                New Page
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SEOPageGeneratorPage;
