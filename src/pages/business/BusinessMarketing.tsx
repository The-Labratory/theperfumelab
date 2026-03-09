import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, CheckCircle, Share2, MessageCircle, Mail, Twitter, QrCode, Link2, Instagram, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function BusinessMarketing() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/?ref=${affiliate?.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareChannels = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[hsl(142_70%_40%)]/10 border-[hsl(142_70%_40%)]/20 text-[hsl(142_70%_40%)]",
      url: `https://wa.me/?text=${encodeURIComponent(`Check out The Perfume Lab — create your own signature scent! ${referralLink}`)}`,
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      color: "bg-primary/10 border-primary/20 text-primary",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Create your own signature scent at The Perfume Lab 🧪✨")}&url=${encodeURIComponent(referralLink)}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-muted/30 border-border text-muted-foreground",
      url: `mailto:?subject=${encodeURIComponent("Create Your Signature Scent — The Perfume Lab")}&body=${encodeURIComponent(`I've been using The Perfume Lab and thought you'd love it!\n\nJoin here: ${referralLink}`)}`,
    },
  ];

  const scripts = [
    { title: "Instagram Story", text: `🧪 I just created my own signature perfume with @ThePerfumeLab! Use my link to create yours: ${referralLink}` },
    { title: "WhatsApp Message", text: `Hey! I've been using The Perfume Lab to create custom fragrances and it's amazing. You should try it: ${referralLink}` },
    { title: "Email Intro", text: `Hi there,\n\nI wanted to share something I've been loving — The Perfume Lab lets you design your own luxury fragrance from scratch.\n\nCheck it out: ${referralLink}\n\nYou won't be disappointed!` },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-display text-xl font-black tracking-wider text-foreground">Marketing Tools</h2>
        <p className="text-xs text-muted-foreground font-body mt-1">Share, promote, and grow your network</p>
      </div>

      {/* Referral Link */}
      <div className="glass-surface rounded-xl p-6 border border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-5 h-5 text-primary" />
          <h3 className="font-display text-sm font-bold tracking-wider text-foreground">Your Referral Link</h3>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-muted/30 rounded-lg px-4 py-3 text-sm font-body text-foreground/70 overflow-x-auto whitespace-nowrap border border-border">
            {referralLink}
          </div>
          <Button onClick={copyLink} variant="outline" className="font-display tracking-wider text-xs shrink-0">
            {copied ? <CheckCircle className="w-4 h-4 text-primary mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/60 mt-2">Code: <span className="text-foreground font-mono">{affiliate?.referral_code}</span></p>
      </div>

      {/* Share Buttons */}
      <div>
        <h3 className="font-display text-xs tracking-[0.2em] text-muted-foreground mb-4">SHARE ON</h3>
        <div className="flex flex-wrap gap-3">
          {shareChannels.map(ch => (
            <a key={ch.name} href={ch.url} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border ${ch.color} hover:opacity-80 transition-opacity font-display text-sm tracking-wider`}>
              <ch.icon className="w-5 h-5" />
              {ch.name}
            </a>
          ))}
          <button
            onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Link copied! Paste in your Instagram bio."); }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border bg-accent/10 border-accent/20 text-accent hover:opacity-80 transition-opacity font-display text-sm tracking-wider"
          >
            <Share2 className="w-5 h-5" />
            Instagram
          </button>
        </div>
      </div>

      {/* Ready-Made Scripts */}
      <div>
        <h3 className="font-display text-xs tracking-[0.2em] text-muted-foreground mb-4">READY-MADE SCRIPTS</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {scripts.map((script) => (
            <motion.div key={script.title} whileHover={{ scale: 1.02 }}
              className="glass-surface rounded-xl p-5 border border-border/30 cursor-pointer"
              onClick={() => { navigator.clipboard.writeText(script.text); toast.success(`${script.title} script copied!`); }}
            >
              <h4 className="font-display text-xs font-bold text-foreground mb-2">{script.title}</h4>
              <p className="text-[11px] text-muted-foreground font-body leading-relaxed line-clamp-4">{script.text}</p>
              <div className="flex items-center gap-1 mt-3 text-primary text-[10px] font-display tracking-wider">
                <Copy className="w-3 h-3" /> Click to copy
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Assets */}
      <div className="glass-surface rounded-xl p-6 border border-border/30">
        <h3 className="font-display text-sm font-bold tracking-wider text-foreground mb-4">📦 Starter Pack & Assets</h3>
        <p className="text-xs text-muted-foreground font-body mb-4">Download marketing materials, product photos, and brand guidelines.</p>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => window.open("/affiliate-starter-pack", "_blank")} className="font-display text-xs tracking-wider">
            <Download className="w-4 h-4 mr-1" /> View Starter Pack
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open("/creator-portal", "_blank")} className="font-display text-xs tracking-wider">
            <Share2 className="w-4 h-4 mr-1" /> Creator Portal
          </Button>
        </div>
      </div>
    </div>
  );
}
