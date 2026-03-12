import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SCENT_FAMILIES = ["Floral", "Woody", "Fresh", "Oriental"];
const PERSONALITIES = [
  { value: "minimal", label: "Minimal & clean" },
  { value: "bold", label: "Bold & expressive" },
  { value: "mysterious", label: "Mysterious & warm" },
  { value: "playful", label: "Playful & bright" },
];

export default function ScentQuizPage() {
  const navigate = useNavigate();
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [personality, setPersonality] = useState("minimal");
  const [saving, setSaving] = useState(false);

  const toggleFamily = (family: string) => {
    setSelectedFamilies((prev) =>
      prev.includes(family) ? prev.filter((item) => item !== family) : [...prev, family],
    );
  };

  const saveQuiz = async () => {
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      toast.error("Please sign in first.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        favorite_families: selectedFamilies,
        scent_personality: personality,
      })
      .eq("user_id", session.user.id);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    await supabase.rpc("award_growth_credit", { _credit_type: "scent_quiz_complete" });
    toast.success("Your scent profile is saved.");
    setSaving(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={6} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Scent Profile Quiz</CardTitle>
            <p className="text-sm text-muted-foreground">Tell us what you love so we can personalize your recommendations.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">1) Choose your preferred scent families</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {SCENT_FAMILIES.map((family) => (
                  <label key={family} className="flex items-center gap-2 rounded-lg border border-border/50 p-3 cursor-pointer">
                    <Checkbox checked={selectedFamilies.includes(family)} onCheckedChange={() => toggleFamily(family)} />
                    <span className="text-sm text-foreground">{family}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-3">2) Pick your scent personality</p>
              <RadioGroup value={personality} onValueChange={setPersonality} className="space-y-2">
                {PERSONALITIES.map((item) => (
                  <div key={item.value} className="flex items-center space-x-2 rounded-lg border border-border/50 p-3">
                    <RadioGroupItem value={item.value} id={item.value} />
                    <Label htmlFor={item.value}>{item.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button onClick={saveQuiz} disabled={saving || selectedFamilies.length === 0} className="w-full font-display tracking-wider">
              {saving ? "Saving…" : "Save my scent profile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
