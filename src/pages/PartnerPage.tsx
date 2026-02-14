import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Package, ShoppingCart, Mail, Building2, Phone, Send, CheckCircle, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const BENEFITS = [
  { icon: Tag, title: "Partner Pricing", description: "Exclusive rates reserved for our approved partners. No tiers, no complexity." },
  { icon: Package, title: "Bespoke Labelling", description: "Your identity on every bottle — designed with the same care as the fragrance within." },
  { icon: ShoppingCart, title: "Order Portal", description: "A dedicated space to manage, reorder, and track every composition." },
  { icon: Users, title: "Direct Atelier Access", description: "Work directly with our perfumers on formulation, sourcing, and logistics." },
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.contactName || !form.email) {
      toast.error("Please complete all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("partner_applications").insert({
        company_name: form.companyName,
        contact_name: form.contactName,
        email: form.email,
        phone: form.phone || null,
        website: form.website || null,
        business_type: form.businessType || null,
        estimated_volume: form.estimatedVolume || null,
        message: form.message || null,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Application received.", { description: "Our team will be in touch within 48 hours." });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
            <span className="text-xs font-display tracking-wider text-primary">PRIVATE PARTNERSHIP</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-wider gradient-text mb-4">
            A Private Perfumery Experience
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto">
            We work with a select number of partners who share our commitment to craftsmanship.
            Each collaboration is individually considered.
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
              All custom compositions at partner rates. Produced weekly in our atelier.
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
                  disabled={isSubmitting}
                  className="w-full glow-primary font-display tracking-wider text-sm"
                >
                  {isSubmitting ? "Submitting…" : <><Send className="w-4 h-4 mr-2" /> Submit Application<ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground font-body tracking-wide">
          © 2026 The Perfume Lab — Each composition is blended individually in our atelier.
        </p>
      </footer>
    </div>
  );
};

export default PartnerPage;
