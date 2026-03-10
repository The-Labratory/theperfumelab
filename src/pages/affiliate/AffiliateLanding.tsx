import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Users, ShoppingBag, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { getAffiliateBySlug, type AffiliateProfile } from "@/lib/affiliates";

const AffiliateLanding = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [affiliate, setAffiliate] = useState<AffiliateProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getAffiliateBySlug(slug).then((data) => {
      if (!data) navigate("/404");
      else setAffiliate(data);
      setLoading(false);
    });
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!affiliate) return null;

  const headline = affiliate.landing_headline || `Discover Luxury Fragrances with ${affiliate.display_name}`;
  const tagline = affiliate.landing_tagline || "Handcrafted scents, curated just for you. Use my personal link for an exclusive experience.";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/30 mx-auto mb-6 flex items-center justify-center overflow-hidden">
            {affiliate.avatar_url ? (
              <img src={affiliate.avatar_url} alt={affiliate.display_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-display font-black text-accent">
                {affiliate.display_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black tracking-wider text-foreground mb-3">
            {headline}
          </h1>
          <p className="font-body text-base text-muted-foreground max-w-lg mx-auto mb-8">
            {tagline}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-10">
            {[
              { icon: ShoppingBag, label: "Sales", value: affiliate.total_sales },
              { icon: Users, label: "Network", value: affiliate.total_referrals },
              { icon: Star, label: "Tier", value: affiliate.tier },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="font-display text-lg font-black text-foreground">{s.value}</p>
                <p className="font-body text-[10px] text-muted-foreground tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          {affiliate.bio && (
            <div className="glass-surface rounded-2xl p-6 border border-border/50 mb-8 text-left">
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{affiliate.bio}</p>
            </div>
          )}

          {/* Social Links */}
          {affiliate.social_links && Object.keys(affiliate.social_links).length > 0 && (
            <div className="flex justify-center gap-3 mb-8">
              {Object.entries(affiliate.social_links).map(([platform, url]) => (
                url && (
                  <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-card/50 border border-border/50 font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    {platform} <ExternalLink className="w-3 h-3" />
                  </a>
                )
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/store")}
              className="bg-accent text-accent-foreground font-display tracking-wider hover:bg-accent/90"
            >
              Shop Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/affiliate-signup")}
              className="font-display tracking-wider"
            >
              Become a Partner
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateLanding;
