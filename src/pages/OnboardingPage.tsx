import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import GlowOrb from "@/components/GlowOrb";

interface Question {
  story: string;
  question: string;
  options: { label: string; emoji: string; value: string }[];
}

const questions: Question[] = [
  {
    story: "You awaken in a place between dreams and reality…",
    question: "You find yourself in a hidden forest. What do you smell first?",
    options: [
      { label: "Damp earth & green moss", emoji: "🌿", value: "green" },
      { label: "Sweet wildflowers", emoji: "🌸", value: "floral" },
      { label: "Warm resin & cedar", emoji: "🌲", value: "woody" },
      { label: "Cool morning dew", emoji: "💧", value: "fresh" },
    ],
  },
  {
    story: "A mysterious power stirs within you…",
    question: "Choose your elemental affinity:",
    options: [
      { label: "Fire — Passionate & Bold", emoji: "🔥", value: "spicy" },
      { label: "Ocean — Calm & Deep", emoji: "🌊", value: "aquatic" },
      { label: "Midnight — Mysterious & Rich", emoji: "🌙", value: "oriental" },
      { label: "Citrus Spark — Bright & Alive", emoji: "⚡", value: "citrus" },
    ],
  },
  {
    story: "The world shifts around you, shaping to your desires…",
    question: "Your ideal evening feels like…",
    options: [
      { label: "Velvet darkness by candlelight", emoji: "🕯️", value: "gourmand" },
      { label: "A rooftop under starlight", emoji: "✨", value: "fresh" },
      { label: "A warm library with old books", emoji: "📖", value: "woody" },
      { label: "A garden party at golden hour", emoji: "🌅", value: "floral" },
    ],
  },
  {
    story: "Your scent identity crystallizes…",
    question: "Which texture resonates with your soul?",
    options: [
      { label: "Smooth silk", emoji: "🧣", value: "oriental" },
      { label: "Rough stone", emoji: "🪨", value: "woody" },
      { label: "Liquid mercury", emoji: "🔮", value: "aquatic" },
      { label: "Golden honey", emoji: "🍯", value: "gourmand" },
    ],
  },
];

const personalities: Record<string, { name: string; emoji: string; family: string; description: string }> = {
  green: { name: "The Forest Sage", emoji: "🌿", family: "Green / Herbal", description: "You carry the wisdom of ancient forests. Your scent DNA is rooted, grounding, and alive." },
  floral: { name: "The Bloom Enchanter", emoji: "🌸", family: "Floral", description: "Delicate yet powerful, you bloom with magnetic charm and intoxicating elegance." },
  woody: { name: "The Ember Guardian", emoji: "🔥", family: "Woody / Spicy", description: "Warm, commanding, and deeply sensual. You radiate quiet power and timeless depth." },
  fresh: { name: "The Azure Voyager", emoji: "🌊", family: "Aquatic / Fresh", description: "Free-spirited and luminous, you move like ocean currents — refreshing everything you touch." },
  spicy: { name: "The Flame Alchemist", emoji: "⚡", family: "Spicy / Oriental", description: "Bold and unapologetic. Your presence ignites rooms and leaves an unforgettable trail." },
  aquatic: { name: "The Azure Voyager", emoji: "🌊", family: "Aquatic / Fresh", description: "Free-spirited and luminous, you move like ocean currents — refreshing everything you touch." },
  oriental: { name: "The Nocturne Weaver", emoji: "🌙", family: "Oriental / Gourmand", description: "Mysterious and alluring. You wrap the world in rich, intoxicating layers of depth." },
  citrus: { name: "The Solar Radiant", emoji: "☀️", family: "Citrus", description: "Bursting with energy and light. You illuminate every moment with vibrant joy." },
  gourmand: { name: "The Nocturne Weaver", emoji: "🌙", family: "Oriental / Gourmand", description: "Mysterious and alluring. You wrap the world in rich, intoxicating layers of depth." },
};

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const getDominantTrait = () => {
    const counts: Record<string, number> = {};
    answers.forEach((a) => {
      counts[a] = (counts[a] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "woody";
  };

  const result = personalities[getDominantTrait()];
  const dnaCode = `SCN-${answers.map(a => a[0]?.toUpperCase()).join("")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      <ParticleField count={15} />

      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg w-full text-center"
            >
              {/* Progress */}
              <div className="flex gap-2 justify-center mb-12">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 w-12 rounded-full transition-colors ${
                      i <= step ? "bg-primary glow-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-primary/70 font-body italic mb-6">
                {questions[step].story}
              </p>

              <h2 className="font-display text-xl md:text-2xl font-bold tracking-wide mb-10 text-foreground">
                {questions[step].question}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {questions[step].options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(opt.value)}
                    className="glass-surface rounded-xl px-6 py-4 text-left flex items-center gap-4 hover:border-primary/40 transition-all group"
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-body text-base text-foreground group-hover:text-primary transition-colors">
                      {opt.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="max-w-lg w-full text-center"
            >
              <GlowOrb className="w-40 h-40 mx-auto mb-8" />

              <p className="text-6xl mb-4">{result.emoji}</p>

              <h2 className="font-display text-2xl md:text-3xl font-black tracking-wider mb-2 gradient-text">
                {result.name}
              </h2>

              <p className="text-sm text-primary/70 font-display tracking-widest mb-6 uppercase">
                {result.family}
              </p>

              <p className="text-muted-foreground font-body leading-relaxed mb-8">
                {result.description}
              </p>

              <div className="glass-surface rounded-xl p-4 mb-8 inline-block">
                <p className="text-xs text-muted-foreground font-body mb-1">Your Scent DNA Code</p>
                <p className="font-display text-lg tracking-[0.2em] text-primary">
                  {dnaCode}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="glow-primary font-display tracking-wider text-sm"
                  onClick={() => navigate("/lab")}
                >
                  Enter Scent Lab <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-display tracking-wider text-sm border-border hover:border-primary/50"
                  onClick={() => navigate("/worlds")}
                >
                  Explore Worlds
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;
