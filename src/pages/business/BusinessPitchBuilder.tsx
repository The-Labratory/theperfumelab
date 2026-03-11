import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Building2, Users, FlaskConical, FileDown, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getExpansionTier, canAccessB2BSuite } from "@/lib/affiliateTiers";

const BUSINESS_TYPES = [
  { value: "barbershop", label: "Barbershop / Salon" },
  { value: "hotel", label: "Hotel / Hospitality" },
  { value: "office", label: "Corporate Office" },
  { value: "gym", label: "Gym / Fitness" },
  { value: "spa", label: "Spa / Wellness" },
  { value: "restaurant", label: "Restaurant / Café" },
  { value: "retail", label: "Retail Store" },
  { value: "other", label: "Other" },
];

const EMPLOYEE_RANGES = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "200+", label: "200+ employees" },
];

interface PitchForm {
  businessType: string;
  businessName: string;
  employeeRange: string;
  currentScent: string;
  contactName: string;
}

const INITIAL_FORM: PitchForm = {
  businessType: "",
  businessName: "",
  employeeRange: "",
  currentScent: "",
  contactName: "",
};

export default function BusinessPitchBuilder() {
  const { affiliate } = useOutletContext<{ affiliate: any }>();
  const [form, setForm] = useState<PitchForm>(INITIAL_FORM);
  const [proposal, setProposal] = useState<string>("");
  const [generating, setGenerating] = useState(false);

  const weeklySales: number = affiliate?.weekly_sales_count ?? 0;
  const tierKey = getExpansionTier(weeklySales);
  const hasAccess = canAccessB2BSuite(tierKey);

  const refCode: string = affiliate?.referral_code ?? "";
  const affiliateName: string = affiliate?.display_name ?? "Your Advisor";
  const acceptUrl = `${window.location.origin}/store?ref=${refCode}&b2b=1`;

  const setField = (key: keyof PitchForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const buildPrompt = () => {
    const bt = BUSINESS_TYPES.find((b) => b.value === form.businessType)?.label ?? form.businessType;
    const emp = form.employeeRange;
    const scent = form.currentScent ? `Their current scent/ambience: "${form.currentScent}".` : "";
    return `You are a premium B2B fragrance sales consultant writing a concise, professional business proposal for The Perfume Lab.

Write a persuasive business proposal (under 350 words, plain text, no markdown) targeting: ${form.businessName || "a business"} — a ${bt} with ${emp} employees. ${scent}

The proposal must:
1. Open with a compelling subject line and short executive summary.
2. Explain how premium workplace scenting boosts staff morale, client perception and dwell time (cite one relevant stat).
3. Clearly state the 40% Corporate Discount available exclusively through The Perfume Lab's partner programme.
4. Tailor the benefit to their specific business type (${bt}).
5. Close with a single clear call-to-action: "Accept & Order" at this unique link: ${acceptUrl}
6. Sign off from "${affiliateName}, The Perfume Lab Partner".

Tone: confident, premium, brief. No bullet points — short paragraphs only.`;
  };

  const generateProposal = async () => {
    if (!form.businessType || !form.employeeRange) {
      toast.error("Please fill in Business Type and Employee Count.");
      return;
    }
    // NOTE: VITE_OPENAI_API_KEY is intentionally accessed client-side here as this
    // app is a fully-frontend Supabase app with no dedicated backend. For a production
    // deployment, move this call to a Supabase Edge Function or server endpoint so the
    // key is never included in the browser bundle.
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
    if (!apiKey) {
      toast.error("OpenAI API key is not configured (VITE_OPENAI_API_KEY).");
      return;
    }
    setGenerating(true);
    setProposal("");
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: buildPrompt() }],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        const errBody = await res.text().catch(() => "");
        let errorMsg = `API error ${res.status}`;
        try {
          const parsed = JSON.parse(errBody) as { error?: { message?: string } };
          if (parsed?.error?.message) errorMsg = parsed.error.message;
        } catch {
          if (errBody) errorMsg = `${errorMsg}: ${errBody.slice(0, 120)}`;
        }
        throw new Error(errorMsg);
      }
      const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      const text: string = json.choices?.[0]?.message?.content ?? "";
      setProposal(text);
      toast.success("Proposal generated!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate proposal");
    } finally {
      setGenerating(false);
    }
  };

  const printProposal = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const bt = BUSINESS_TYPES.find((b) => b.value === form.businessType)?.label ?? form.businessType;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>The Perfume Lab — B2B Proposal for ${form.businessName || bt}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; padding: 48px 56px; max-width: 800px; margin: 0 auto; }
    .logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; letter-spacing: 0.2em; color: #0a0a0f; margin-bottom: 4px; }
    .logo-sub { font-size: 10px; letter-spacing: 0.4em; color: #6b7280; text-transform: uppercase; margin-bottom: 40px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .tag { display: inline-block; background: #f3e8ff; color: #7c3aed; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 999px; margin-bottom: 20px; }
    .body { font-size: 15px; line-height: 1.75; white-space: pre-wrap; }
    .cta { display: block; margin: 32px auto; width: fit-content; background: #0a0a0f; color: #fff; font-weight: 600; font-size: 14px; padding: 14px 36px; border-radius: 8px; text-decoration: none; letter-spacing: 0.05em; }
    .footer { margin-top: 48px; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { .cta { background: #0a0a0f !important; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="logo">THE PERFUME LAB</div>
  <div class="logo-sub">Fragrance Atelier &mdash; Partner Programme</div>
  <hr />
  <div class="tag">40% CORPORATE DISCOUNT</div>
  <div class="body">${proposal.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  <a class="cta" href="${acceptUrl}">ACCEPT &amp; ORDER NOW →</a>
  <hr />
  <div class="footer">Proposal prepared by ${affiliateName} &middot; The Perfume Lab Partner Programme &middot; theperfumelab.com</div>
</body>
</html>`);
    win.document.close();
    win.focus();
    // Delay allows the browser to finish rendering and load the Google Font before printing
    const PRINT_DELAY_MS = 600;
    setTimeout(() => win.print(), PRINT_DELAY_MS);
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground">AI Pitch Builder Locked</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Reach <strong>15 sales/week</strong> (Pro tier) to unlock the AI B2B Pitch Architect.
          You currently have <strong>{weeklySales} sales</strong> this week.
        </p>
        <Badge variant="outline" className="text-xs">
          {15 - weeklySales} more {15 - weeklySales === 1 ? "sale" : "sales"} needed
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
          AI B2B Pitch Architect
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate a professional, personalised PDF proposal for any business — powered by AI.
        </p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/40 glass-surface p-6 space-y-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Business type */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Business Type *
            </Label>
            <Select value={form.businessType} onValueChange={(v) => setField("businessType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type…" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((bt) => (
                  <SelectItem key={bt.value} value={bt.value}>
                    {bt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business name */}
          <div className="space-y-1.5">
            <Label htmlFor="biz-name" className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Business Name (optional)
            </Label>
            <Input
              id="biz-name"
              placeholder="e.g. The Grand Hotel, Smith Barbershop…"
              value={form.businessName}
              onChange={(e) => setField("businessName", e.target.value)}
            />
          </div>

          {/* Employee range */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Employee Count *
            </Label>
            <Select value={form.employeeRange} onValueChange={(v) => setField("employeeRange", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select range…" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEE_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current scent */}
          <div className="space-y-1.5">
            <Label htmlFor="biz-scent" className="flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Current Scent / Ambience (optional)
            </Label>
            <Input
              id="biz-scent"
              placeholder="e.g. Nothing / clean, Lavender diffuser…"
              value={form.currentScent}
              onChange={(e) => setField("currentScent", e.target.value)}
            />
          </div>
        </div>

        <Button
          className="w-full font-display tracking-wider gap-2"
          onClick={generateProposal}
          disabled={generating}
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {generating ? "GENERATING PROPOSAL…" : "DRAFT PROPOSAL"}
        </Button>
      </motion.div>

      {/* Generated proposal */}
      {proposal && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/40 glass-surface p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold tracking-wider text-foreground">
              GENERATED PROPOSAL
            </h3>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-display tracking-wider"
              onClick={printProposal}
            >
              <FileDown className="w-3.5 h-3.5" />
              DOWNLOAD / PRINT PDF
            </Button>
          </div>

          <Textarea
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            className="min-h-[280px] text-sm font-body leading-relaxed resize-y bg-background/40"
          />

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              The proposal includes an <strong>Accept &amp; Order</strong> button linked to your unique
              affiliate URL. Edit the text above if needed, then download as PDF.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
