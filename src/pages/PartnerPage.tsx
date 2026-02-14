import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, ShoppingCart, Mail, Building2, Phone, Send, CheckCircle, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { toast } from "sonner";

const BENEFITS = [
  { icon: Tag, title: "50% Partner Discount", description: "All orders at half price — the more you order, the more you save." },
  { icon: Package, title: "Custom Private Label", description: "White-label packaging with your brand identity on every bottle." },
  { icon: ShoppingCart, title: "Order Management", description: "Dedicated dashboard to track, reorder, and manage all your B2B orders." },
  { icon: Users, title: "Priority Support", description: "Direct line to our fragrance experts for formulation and logistics." },
];

interface PartnerFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  businessType: string;
  estimatedVolume: string;
  message: string;
}

const PartnerPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<PartnerFormData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    businessType: "",
    estimatedVolume: "",
    message: "",
  });

  const handleChange = (field: keyof PartnerFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    // For now, just show success — can be wired to backend later
    setSubmitted(true);
    toast.success("Application submitted!", { description: "We'll review your application and get back to you within 48 hours." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-20 sm:pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-display tracking-wider text-primary">B2B PARTNERSHIP PROGRAM</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-wider gradient-text mb-4">
            Become a Partner
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            Join The Perfume Lab's wholesale program. Get exclusive pricing, 
            private-label options, and a dedicated portal to manage all your orders.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 sm:mb-16"
        >
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-xl p-6 text-center group hover:border-primary/30 transition-colors"
            >
              <b.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:drop-shadow-[0_0_12px_hsl(185_80%_55%/0.5)] transition-all" />
              <h3 className="font-display text-sm font-semibold tracking-wide mb-2 text-foreground">{b.title}</h3>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{b.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Pricing highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-surface rounded-2xl p-6 sm:p-8 mb-12 sm:mb-16 border border-primary/20"
        >
          <div className="text-center mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground mb-2">
              Partner Pricing
            </h2>
            <p className="text-sm text-muted-foreground font-body">
              Flat 50% discount on all custom fragrances — no minimum tiers, no complexity.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { size: "30ml", original: "25.99", partner: "13.00" },
              { size: "50ml", original: "37.99", partner: "19.00" },
              { size: "100ml", original: "59.99", partner: "30.00" },
            ].map((p) => (
              <div key={p.size} className="rounded-xl bg-muted/20 border border-border p-4 text-center">
                <span className="font-display text-lg text-foreground block">{p.size}</span>
                <span className="text-sm text-muted-foreground line-through block">€{p.original}</span>
                <span className="font-display text-2xl text-primary block">€{p.partner}</span>
                <span className="text-[10px] text-accent font-display">Parfum concentration</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Application form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-surface rounded-2xl p-6 sm:p-8 border border-border"
        >
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground mb-6 text-center">
            Apply for Partnership
          </h2>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="font-display text-lg font-bold text-foreground mb-2">Application Received!</h3>
                <p className="text-sm text-muted-foreground font-body max-w-md mx-auto mb-6">
                  Thank you for your interest in becoming a partner. Our team will review your application 
                  and reach out within 48 hours with next steps.
                </p>
                <Button
                  onClick={() => { setSubmitted(false); setForm({ companyName: "", contactName: "", email: "", phone: "", website: "", businessType: "", estimatedVolume: "", message: "" }); }}
                  variant="outline"
                  className="font-display tracking-wider"
                >
                  Submit Another Application
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-5 max-w-2xl mx-auto"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                      COMPANY NAME *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border font-body text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                        placeholder="Your company"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                      CONTACT NAME *
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={form.contactName}
                        onChange={(e) => handleChange("contactName", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border font-body text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                        placeholder="Full name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                      EMAIL *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border font-body text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                      PHONE
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/30 border border-border font-body text-sm text-foreground focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/50"
                        placeholder="+49 ..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                      BUSINESS TYPE
                    </label>
                    <select
                      value={form.businessType}
                      onChange={(e) => handleChange("businessType", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border font-body text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none"
                    >
                      <option value="">Select type...</option>
                      <option value="retail">Retail Store</option>
                      <option value="spa">Spa & Wellness</option>
                      <option value="hotel">Hotel & Hospitality</option>
                      <option value="ecommerce">E-Commerce</option>
                      <option value="distributor">Distributor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                      ESTIMATED MONTHLY VOLUME
                    </label>
                    <select
                      value={form.estimatedVolume}
                      onChange={(e) => handleChange("estimatedVolume", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border font-body text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none"
                    >
                      <option value="">Select volume...</option>
                      <option value="10-50">10–50 units</option>
                      <option value="50-100">50–100 units</option>
                      <option value="100-500">100–500 units</option>
                      <option value="500+">500+ units</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-display tracking-widest text-muted-foreground mb-1.5 block">
                    MESSAGE
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border font-body text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground/50"
                    placeholder="Tell us about your business and how you'd like to partner..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full glow-primary font-display tracking-wider text-sm"
                >
                  <Send className="w-4 h-4 mr-2" /> Submit Application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground font-body tracking-wide">
          © 2026 The Perfume Lab — Your scent, your world.
        </p>
      </footer>
    </div>
  );
};

export default PartnerPage;
