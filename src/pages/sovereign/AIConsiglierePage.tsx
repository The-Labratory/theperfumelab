import { useState } from "react";
import { Brain, FileText, Building2, Dumbbell, Scissors, Briefcase, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const INDUSTRIES = [
  { value: "gym", label: "Gym / Fitness", icon: Dumbbell },
  { value: "salon", label: "Salon / Spa", icon: Scissors },
  { value: "corporate", label: "Corporate Office", icon: Briefcase },
  { value: "hotel", label: "Hotel / Hospitality", icon: Building2 },
];

const PERSONALITIES = [
  { value: "aggressive", label: "Aggressive — Wants ROI numbers" },
  { value: "conservative", label: "Conservative — Needs trust first" },
  { value: "luxury", label: "Luxury-Focused — Cares about brand" },
  { value: "pragmatic", label: "Pragmatic — Just wants it simple" },
];

export default function AIConsiglierePage() {
  const [industry, setIndustry] = useState("");
  const [personality, setPersonality] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [pitch, setPitch] = useState("");
  const [generating, setGenerating] = useState(false);

  const generatePitch = async () => {
    if (!industry || !personality || !businessName) {
      toast.error("Fill in all required fields");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-b2b-pitch", {
        body: {
          industry,
          personality,
          businessName,
          additionalContext,
        },
      });

      if (error) throw error;
      setPitch(data?.pitch || "Failed to generate pitch.");
      toast.success("Pitch generated!");
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
      // Fallback pitch
      setPitch(getFallbackPitch(industry, personality, businessName));
    } finally {
      setGenerating(false);
    }
  };

  const getFallbackPitch = (ind: string, pers: string, name: string) => {
    const hooks: Record<string, string> = {
      gym: `Dear ${name} Management,\n\nYour elite members expect elite standards. Standard air fresheners are a liability — The Perfume Lab is an asset.\n\nWe propose installing a Scent Station at your facility. Research shows premium ambient scenting increases member retention by 23% and perceived facility value by 40%.\n\nCorporate Rate: $55/unit (MSRP $95) — exclusive to ${name}.\n\nThis is a zero-risk partnership: we supply the testers, you provide the counter space.`,
      salon: `Dear ${name} Team,\n\nYour clients come to you for transformation. Why stop at hair? Premium scent is the invisible accessory that completes the experience.\n\nThe Perfume Lab offers ${name} an exclusive partnership: curated scent displays that turn your reception area into a revenue center.\n\nCorporate Rate: $55/unit (MSRP $95) — with a 10% commission on every sale to you.`,
      corporate: `Dear ${name} Leadership,\n\nFirst impressions are made in 7 seconds. The scent of your lobby sets the tone before a single word is spoken.\n\nThe Perfume Lab offers corporate ambient scenting solutions that communicate authority, sophistication, and attention to detail.\n\nCorporate Partnership Rate: $55/unit (MSRP $95) — bulk pricing available for 50+ units.`,
      hotel: `Dear ${name} General Manager,\n\nThe world's finest hotels have a signature scent. It's not a luxury — it's a competitive necessity.\n\nThe Perfume Lab creates bespoke scent experiences that embed your brand in your guests' memories.\n\nPartnership Rate: $55/unit (MSRP $95) — with exclusive scent customization for ${name}.`,
    };
    return hooks[ind] || hooks.corporate;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 flex items-center justify-center border border-purple-500/30">
          <Brain className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Consigliere</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Generate psychologically-calibrated B2B pitches using persuasion principles
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="border-[hsl(var(--border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Target Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Business Name *</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Gold's Gym Downtown"
              />
            </div>
            <div>
              <Label className="text-xs">Industry *</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Owner Personality *</Label>
              <Select value={personality} onValueChange={setPersonality}>
                <SelectTrigger><SelectValue placeholder="Select personality type" /></SelectTrigger>
                <SelectContent>
                  {PERSONALITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Additional Context (optional)</Label>
              <Textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Any specifics about the business..."
                rows={3}
              />
            </div>
            <Button
              onClick={generatePitch}
              disabled={generating || !industry || !personality || !businessName}
              className="w-full gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Pitch
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="border-[hsl(var(--border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-purple-500" />
              Generated Pitch
              {pitch && (
                <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30 text-[10px]">
                  CIALDINI OPTIMIZED
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {pitch ? (
                <motion.div
                  key="pitch"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-[hsl(var(--muted))] rounded-xl p-4 mb-4 whitespace-pre-wrap text-sm leading-relaxed">
                    {pitch}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(pitch);
                        toast.success("Pitch copied!");
                      }}
                    >
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="w-3 h-3" /> Export PDF
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <Brain className="w-12 h-12 mx-auto mb-3 text-[hsl(var(--muted-foreground))]" />
                  <p className="text-[hsl(var(--muted-foreground))]">
                    Fill in the target profile and generate your AI-powered pitch.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
