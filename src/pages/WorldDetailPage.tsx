import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Brain, Target, FlaskConical, Swords, Lock, Star, CheckCircle, XCircle, Sparkles, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { worlds } from "@/data/worldsData";
import type { QuizQuestion } from "@/data/worldsData";
import ScentSeance from "@/components/ScentSeance";

type Tab = "quizzes" | "missions" | "collection" | "battles" | "seance";

const WorldDetailPage = () => {
  const { worldId } = useParams();
  const navigate = useNavigate();
  const world = worlds.find((w) => w.id === worldId);
  const [activeTab, setActiveTab] = useState<Tab>("quizzes");

  if (!world) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">World not found.</p>
      </div>
    );
  }

  if (!world.unlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto text-center space-y-6">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="font-display text-3xl font-bold">{world.name}</h1>
          <p className="text-muted-foreground font-body">This world is locked. Complete quizzes and missions in unlocked worlds to gain XP and unlock new realms.</p>
          <button onClick={() => navigate("/worlds")} className="text-primary font-display text-sm tracking-wider hover:underline">
            ← Back to Worlds
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "quizzes", label: "Quizzes", icon: <Brain className="w-4 h-4" /> },
    { id: "missions", label: "Missions", icon: <Target className="w-4 h-4" /> },
    { id: "collection", label: "Collection", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "battles", label: "Battles", icon: <Swords className="w-4 h-4" /> },
    { id: "seance", label: "Séance", icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={10} />

      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={world.image} alt={world.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-4xl mx-auto">
          <button onClick={() => navigate("/worlds")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 text-sm font-body transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Worlds
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{world.emoji}</span>
            <div>
              <h1 className="font-display text-2xl md:text-4xl font-black tracking-wider text-foreground">{world.name}</h1>
              <p className="text-muted-foreground font-body text-sm">{world.type}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-16">
        {/* Lore */}
        <p className="text-muted-foreground font-body text-sm leading-relaxed mt-6 mb-8 max-w-2xl">{world.lore}</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display text-xs tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "glass-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            {activeTab === "quizzes" && <QuizSection quizzes={world.quizzes} />}
            {activeTab === "missions" && <MissionsSection missions={world.dailyMissions} />}
            {activeTab === "collection" && <CollectionSection ingredients={world.ingredients} />}
            {activeTab === "battles" && <BattlesSection challenges={world.blendChallenges} />}
            {activeTab === "seance" && <ScentSeance worldName={world.name} worldType={world.type} worldEmoji={world.emoji} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Quiz Section ─── */
const QuizSection = ({ quizzes }: { quizzes: QuizQuestion[] }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = quizzes[currentQ];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= quizzes.length) {
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="text-center space-y-6 py-8">
        <Sparkles className="w-12 h-12 text-accent mx-auto" />
        <h2 className="font-display text-2xl font-bold">Quiz Complete!</h2>
        <p className="text-muted-foreground font-body">You scored <span className="text-primary font-bold">{score}</span> out of {quizzes.length}</p>
        <p className="text-accent font-display text-sm">+{score * 25} XP earned</p>
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-body text-xs">Question {currentQ + 1} of {quizzes.length}</span>
        <span className="text-primary font-display text-xs">{score} correct</span>
      </div>
      <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${((currentQ + 1) / quizzes.length) * 100}%` }} />
      </div>
      <h3 className="font-display text-lg font-semibold">{q.question}</h3>
      <div className="grid gap-3">
        {q.options.map((opt, i) => {
          let style = "glass-surface text-foreground hover:border-primary/40";
          if (selected !== null) {
            if (i === q.correctIndex) style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300";
            else if (i === selected) style = "bg-destructive/15 border-destructive/40 text-destructive";
            else style = "glass-surface text-muted-foreground opacity-50";
          }
          return (
            <button key={i} onClick={() => handleAnswer(i)} className={`w-full text-left px-5 py-4 rounded-xl border border-border font-body text-sm transition-all ${style}`}>
              <span className="flex items-center gap-3">
                {selected !== null && i === q.correctIndex && <CheckCircle className="w-4 h-4 shrink-0" />}
                {selected !== null && i === selected && i !== q.correctIndex && <XCircle className="w-4 h-4 shrink-0" />}
                {opt}
              </span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-sm text-muted-foreground font-body italic">{q.explanation}</p>
          <button onClick={nextQuestion} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display text-sm tracking-wider">
            {currentQ + 1 >= quizzes.length ? "See Results" : "Next Question →"}
          </button>
        </motion.div>
      )}
    </div>
  );
};

/* ─── Missions Section ─── */
const MissionsSection = ({ missions }: { missions: typeof worlds[0]["dailyMissions"] }) => {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" /> Daily Missions
      </h2>
      <div className="grid gap-3">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => toggle(m.id)}
            className={`w-full text-left p-5 rounded-xl border transition-all ${
              completed.has(m.id)
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "glass-surface border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold">{m.title}</h3>
                  <span className="text-accent font-display text-xs whitespace-nowrap">+{m.xp} XP</span>
                </div>
                <p className="text-muted-foreground font-body text-xs mt-1">{m.description}</p>
              </div>
              {completed.has(m.id) && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ─── Collection Section ─── */
const CollectionSection = ({ ingredients }: { ingredients: typeof worlds[0]["ingredients"] }) => {
  const rarityColors = {
    common: "text-muted-foreground border-border",
    rare: "text-primary border-primary/30",
    legendary: "text-accent border-accent/30",
  };

  const rarityBg = {
    common: "bg-muted/30",
    rare: "bg-primary/5",
    legendary: "bg-accent/5",
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-primary" /> Ingredient Collection
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {ingredients.map((ing) => (
          <div
            key={ing.id}
            className={`p-5 rounded-xl border transition-all ${rarityBg[ing.rarity]} ${
              ing.discovered ? rarityColors[ing.rarity] : "opacity-40 border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{ing.discovered ? ing.emoji : "❓"}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold">{ing.discovered ? ing.name : "???"}</h3>
                  <span className={`font-display text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full border ${rarityColors[ing.rarity]}`}>
                    {ing.rarity}
                  </span>
                </div>
                <p className="text-muted-foreground font-body text-xs mt-1">
                  {ing.discovered ? ing.description : "Undiscovered — complete missions to reveal"}
                </p>
              </div>
              {ing.discovered && <Star className="w-4 h-4 text-accent shrink-0" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Battles Section ─── */
const BattlesSection = ({ challenges }: { challenges: typeof worlds[0]["blendChallenges"] }) => {
  const difficultyColors = {
    beginner: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
    intermediate: "text-primary border-primary/30 bg-primary/5",
    master: "text-accent border-accent/30 bg-accent/5",
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
        <Swords className="w-5 h-5 text-primary" /> Blend Battles
      </h2>
      <div className="grid gap-4">
        {challenges.map((ch) => (
          <div key={ch.id} className="p-5 rounded-xl glass-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">{ch.title}</h3>
              <span className={`font-display text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border ${difficultyColors[ch.difficulty]}`}>
                {ch.difficulty}
              </span>
            </div>
            <p className="text-muted-foreground font-body text-sm">{ch.description}</p>
            <div className="flex flex-wrap gap-2">
              {ch.targetNotes.map((note) => (
                <span key={note} className="px-3 py-1 rounded-full bg-muted/50 text-xs font-body text-muted-foreground border border-border">
                  {note.replace(/-/g, " ")}
                </span>
              ))}
            </div>
            <button
              onClick={() => window.location.href = "/lab"}
              className="mt-2 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-display text-xs tracking-wider hover:bg-primary/20 transition-colors border border-primary/20"
            >
              Open in Lab →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldDetailPage;
