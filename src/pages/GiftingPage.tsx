import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Loader2, ArrowLeft, Users, User, BookHeart, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GiftResult from "@/components/gifting/GiftResult";
import PersonalityStep from "@/components/gifting/PersonalityStep";
import OccasionStep from "@/components/gifting/OccasionStep";
import MoodStep from "@/components/gifting/MoodStep";
import MemoryStep from "@/components/gifting/MemoryStep";
import DetailsStep from "@/components/gifting/DetailsStep";
import DuoPartnerStep from "@/components/gifting/DuoPartnerStep";
import { personalities, occasions, moods, zodiacSigns, type GiftBlend } from "@/components/gifting/giftingData";

const GiftingPage = () => {
  const [mode, setMode] = useState<"solo" | "duo" | null>(null);
  const [step, setStep] = useState(0); // 0 = mode select
  const [personality, setPersonality] = useState("");
  const [occasion, setOccasion] = useState("");
  const [mood, setMood] = useState("");
  const [memory, setMemory] = useState("");
  const [gifterName, setGifterName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [relationshipDepth, setRelationshipDepth] = useState("friend");

  // Duo partner state
  const [duoPartnerName, setDuoPartnerName] = useState("");
  const [duoPartnerPersonality, setDuoPartnerPersonality] = useState("");
  const [duoPartnerMood, setDuoPartnerMood] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GiftBlend | null>(null);
  const [shareCode, setShareCode] = useState("");

  const totalSteps = mode === "duo" ? 6 : 5;

  const generateBlend = async () => {
    setIsGenerating(true);
    try {
      const giftMode = mode === "duo" ? "duo" : "gift";
      const notesPayload: Record<string, string | undefined> = {
        personality,
        occasion,
        mood,
        memory: memory || undefined,
        zodiac: zodiac || undefined,
        relationshipDepth,
        gifterName: gifterName || undefined,
        recipientName: recipientName || undefined,
      };
      if (mode === "duo") {
        notesPayload.duoPartnerName = duoPartnerName || undefined;
        notesPayload.duoPartnerPersonality = duoPartnerPersonality;
        notesPayload.duoPartnerMood = duoPartnerMood;
      }
      const bodyPayload = {
        notes: notesPayload,
        concentration: "Eau de Parfum",
        mode: giftMode,
      };

      const { data, error } = await supabase.functions.invoke("perfumer-ai", {
        body: bodyPayload,
      });
      if (error) throw error;

      try {
        const parsed = JSON.parse(data.content);
        setResult(parsed);

        // Save to database
        const { data: giftRow, error: dbError } = await supabase.from("gifts").insert({
          personality,
          occasion,
          mood,
          memory: memory || null,
          gifter_name: gifterName || null,
          recipient_name: recipientName || null,
          personal_message: personalMessage || null,
          zodiac_sign: zodiac || null,
          relationship_depth: relationshipDepth,
          is_duo: mode === "duo",
          duo_partner_name: duoPartnerName || null,
          duo_partner_personality: duoPartnerPersonality || null,
          duo_partner_mood: duoPartnerMood || null,
          blend_name: parsed.blendName,
          blend_story: parsed.story,
          blend_notes: parsed.notes,
          blend_mood: parsed.mood,
          blend_intensity: parsed.intensity,
          scent_letter: parsed.scentLetter || null,
        }).select("share_code").single();

        if (!dbError && giftRow) {
          setShareCode(giftRow.share_code);
        }

        setStep(totalSteps + 1);
      } catch {
        toast.error("Could not generate blend. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("AI Perfumer is temporarily unavailable");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setMode(null);
    setStep(0);
    setResult(null);
    setShareCode("");
    setPersonality("");
    setOccasion("");
    setMood("");
    setMemory("");
    setGifterName("");
    setRecipientName("");
    setPersonalMessage("");
    setZodiac("");
    setRelationshipDepth("friend");
    setDuoPartnerName("");
    setDuoPartnerPersonality("");
    setDuoPartnerMood("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-accent mx-auto mb-3" />
          <h1 className="font-display text-3xl md:text-4xl font-black tracking-wider gradient-text mb-2">
            {mode === "duo" ? "DUO BLEND" : "GIFTING MODE"}
          </h1>
          <p className="text-muted-foreground font-body text-sm sm:text-base">
            {mode === "duo"
              ? "Two souls, one fragrance — create together in real time"
              : "Create the perfect fragrance for someone special"}
          </p>
        </motion.div>

        {/* Progress bar when in flow */}
        {step > 0 && step <= totalSteps && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-display text-[10px] transition-all ${
                  step >= s ? "bg-primary text-primary-foreground" : "glass-surface text-muted-foreground"
                }`}>
                  {s}
                </div>
                {s < totalSteps && <div className={`w-6 h-0.5 rounded-full transition-all ${step > s ? "bg-primary" : "bg-muted/50"}`} />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Mode Selection */}
          {step === 0 && (
            <motion.div key="mode" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-display text-sm tracking-widest text-muted-foreground text-center mb-6">CHOOSE YOUR EXPERIENCE</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => { setMode("solo"); setStep(1); }}
                  className="glass-surface rounded-2xl p-6 text-center transition-all hover:border-primary/30 group"
                >
                  <User className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-display text-sm tracking-wider text-foreground block mb-1">Solo Gift</span>
                  <span className="text-[11px] text-muted-foreground font-body block">Craft a personal fragrance for someone you love</span>
                </button>
                <button
                  onClick={() => { setMode("duo"); setStep(1); }}
                  className="glass-surface rounded-2xl p-6 text-center transition-all hover:border-secondary/30 group border-secondary/10"
                >
                  <Users className="w-8 h-8 text-secondary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="font-display text-sm tracking-wider text-foreground block mb-1">Duo Blend</span>
                  <span className="text-[11px] text-muted-foreground font-body block">Two people, one harmonized scent — create together</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: Personality */}
          {step === 1 && (
            <PersonalityStep
              personality={personality}
              onSelect={(p) => { setPersonality(p); setStep(2); }}
              onBack={() => setStep(0)}
              label={mode === "duo" ? "YOUR PERSONALITY" : "THEIR PERSONALITY"}
            />
          )}

          {/* Step 2: Occasion */}
          {step === 2 && (
            <OccasionStep
              occasion={occasion}
              onSelect={(o) => { setOccasion(o); setStep(3); }}
              onBack={() => setStep(1)}
            />
          )}

          {/* Step 3: Mood */}
          {step === 3 && (
            <MoodStep
              mood={mood}
              onSelect={(m) => { setMood(m); setStep(4); }}
              onBack={() => setStep(2)}
            />
          )}

          {/* Step 4: Memory (the new emotional step) */}
          {step === 4 && (
            <MemoryStep
              memory={memory}
              onMemoryChange={setMemory}
              onNext={() => setStep(mode === "duo" ? 5 : 5)}
              onBack={() => setStep(3)}
            />
          )}

          {/* Step 5 for duo: Partner preferences */}
          {step === 5 && mode === "duo" && (
            <DuoPartnerStep
              partnerName={duoPartnerName}
              partnerPersonality={duoPartnerPersonality}
              partnerMood={duoPartnerMood}
              onPartnerNameChange={setDuoPartnerName}
              onPartnerPersonalityChange={setDuoPartnerPersonality}
              onPartnerMoodChange={setDuoPartnerMood}
              onNext={() => setStep(6)}
              onBack={() => setStep(4)}
            />
          )}

          {/* Final step before generate: Details + zodiac + relationship */}
          {step === (mode === "duo" ? 6 : 5) && (
            <DetailsStep
              gifterName={gifterName}
              recipientName={recipientName}
              personalMessage={personalMessage}
              zodiac={zodiac}
              relationshipDepth={relationshipDepth}
              onGifterNameChange={setGifterName}
              onRecipientNameChange={setRecipientName}
              onPersonalMessageChange={setPersonalMessage}
              onZodiacChange={setZodiac}
              onRelationshipDepthChange={setRelationshipDepth}
              onGenerate={generateBlend}
              isGenerating={isGenerating}
              onBack={() => setStep(mode === "duo" ? 5 : 4)}
              isDuo={mode === "duo"}
            />
          )}

          {/* Result */}
          {step === totalSteps + 1 && result && (
            <GiftResult
              result={result}
              personality={personality}
              occasion={occasion}
              mood={mood}
              shareCode={shareCode}
              isDuo={mode === "duo"}
              onReset={reset}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GiftingPage;
