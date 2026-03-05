import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, CheckCircle, XCircle, Lightbulb, Trophy, Star, Sparkles, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { GAME_CHAPTERS, PERFUMER_RANKS, type GameChapter, type GameChallenge } from "@/data/gameData";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "perfumer-game-progress";

interface GameProgress {
  xp: number;
  completedChallenges: Record<string, boolean>; // "chapterId-challengeIndex"
  currentChapter: number;
}

function loadLocalProgress(): GameProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { xp: 0, completedChallenges: {}, currentChapter: 1 };
}

function saveLocalProgress(p: GameProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

function getCurrentRank(xp: number) {
  let rank = PERFUMER_RANKS[0];
  for (const r of PERFUMER_RANKS) {
    if (xp >= r.minXP) rank = r;
  }
  return rank;
}

function getNextRank(xp: number) {
  for (const r of PERFUMER_RANKS) {
    if (xp < r.minXP) return r;
  }
  return null;
}

export default function PerfumerGamePage() {
  const [progress, setProgress] = useState<GameProgress>(loadLocalProgress);
  const [view, setView] = useState<"map" | "chapter" | "challenge">("map");
  const [activeChapter, setActiveChapter] = useState<GameChapter | null>(null);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [xpAnim, setXpAnim] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const dbSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Load progress from DB for logged-in users
  useEffect(() => {
    const loadFromDb = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      userIdRef.current = session.user.id;

      const { data } = await supabase
        .from("game_progress")
        .select("xp, completed_challenges, current_chapter")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        const dbProgress: GameProgress = {
          xp: data.xp,
          completedChallenges: (data.completed_challenges as Record<string, boolean>) || {},
          currentChapter: data.current_chapter,
        };
        // Merge: take whichever has more XP
        const local = loadLocalProgress();
        const merged = dbProgress.xp >= local.xp ? dbProgress : local;
        setProgress(merged);
        saveLocalProgress(merged);
      } else {
        // First time: push local progress to DB
        const local = loadLocalProgress();
        if (local.xp > 0) {
          await supabase.from("game_progress").upsert({
            user_id: session.user.id,
            xp: local.xp,
            completed_challenges: local.completedChallenges,
            current_chapter: local.currentChapter,
          });
        }
      }
    };
    loadFromDb();
  }, []);

  const saveToDb = useCallback((p: GameProgress) => {
    if (!userIdRef.current) return;
    clearTimeout(dbSaveTimer.current);
    dbSaveTimer.current = setTimeout(async () => {
      await supabase.from("game_progress").upsert({
        user_id: userIdRef.current!,
        xp: p.xp,
        completed_challenges: p.completedChallenges,
        current_chapter: p.currentChapter,
        updated_at: new Date().toISOString(),
      });
    }, 500);
  }, []);

  const rank = getCurrentRank(progress.xp);
  const nextRank = getNextRank(progress.xp);
  const xpProgress = nextRank
    ? ((progress.xp - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100
    : 100;

  const updateProgress = useCallback((newProgress: GameProgress) => {
    setProgress(newProgress);
    saveLocalProgress(newProgress);
    saveToDb(newProgress);
  }, [saveToDb]);

  const openChapter = (chapter: GameChapter) => {
    if (progress.xp < chapter.unlockXP) return;
    setActiveChapter(chapter);
    setChallengeIndex(0);
    setView("chapter");
  };

  const startChallenge = (index: number) => {
    setChallengeIndex(index);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setView("challenge");
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !activeChapter) return;
    setShowResult(true);

    const challenge = activeChapter.challenges[challengeIndex];
    const key = `${activeChapter.id}-${challengeIndex}`;
    const isCorrect = selectedAnswer === challenge.correctAnswer;

    if (isCorrect && !progress.completedChallenges[key]) {
      const newProgress = {
        ...progress,
        xp: progress.xp + challenge.xpReward,
        completedChallenges: { ...progress.completedChallenges, [key]: true },
      };
      updateProgress(newProgress);
      setXpAnim(true);
      setTimeout(() => setXpAnim(false), 1500);
    }
  };

  const nextChallenge = () => {
    if (!activeChapter) return;
    if (challengeIndex < activeChapter.challenges.length - 1) {
      startChallenge(challengeIndex + 1);
    } else {
      setView("chapter");
    }
  };

  const chapterCompletionPct = (chapter: GameChapter) => {
    const total = chapter.challenges.length;
    const done = chapter.challenges.filter(
      (_, i) => progress.completedChallenges[`${chapter.id}-${i}`]
    ).length;
    return Math.round((done / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* XP Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="text-xl">{rank.icon}</span>
          <div className="flex-1">
            <div className="flex justify-between text-[10px] font-display tracking-wider mb-1">
              <span className="text-foreground font-bold">{rank.name}</span>
              {nextRank && (
                <span className="text-muted-foreground">
                  {progress.xp}/{nextRank.minXP} XP → {nextRank.icon} {nextRank.name}
                </span>
              )}
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: rank.color }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
          <AnimatePresence>
            {xpAnim && (
              <motion.span
                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-accent font-display font-black text-sm absolute right-8 top-1"
              >
                +XP!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ============ MAP VIEW ============ */}
          {view === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block text-5xl mb-3"
                >
                  🧪
                </motion.div>
                <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
                  The Perfumer's Journey
                </h1>
                <p className="text-muted-foreground font-body text-sm max-w-md mx-auto">
                  Master the art of fragrance creation through an immersive story.
                  Complete challenges to earn XP and unlock the title of{" "}
                  <span className="text-accent font-semibold">Master Perfumer</span>.
                </p>
              </div>

              {/* Chapter Cards */}
              <div className="space-y-4">
                {GAME_CHAPTERS.map((chapter, i) => {
                  const locked = progress.xp < chapter.unlockXP;
                  const pct = chapterCompletionPct(chapter);
                  const isComplete = pct === 100;

                  return (
                    <motion.button
                      key={chapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => openChapter(chapter)}
                      disabled={locked}
                      className={`w-full text-left p-5 rounded-2xl border transition-all group ${
                        locked
                          ? "bg-muted/5 border-border/10 opacity-50 cursor-not-allowed"
                          : isComplete
                          ? "bg-accent/5 border-accent/20 hover:border-accent/40"
                          : "bg-card border-border/20 hover:border-primary/40 hover:bg-card/80"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-3xl flex-shrink-0 mt-1">
                          {locked ? <Lock className="w-7 h-7 text-muted-foreground/40" /> : chapter.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-display tracking-widest text-muted-foreground uppercase">
                              Chapter {chapter.id}
                            </span>
                            {isComplete && (
                              <CheckCircle className="w-3.5 h-3.5 text-accent" />
                            )}
                          </div>
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {chapter.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {locked
                              ? `Requires ${chapter.unlockXP} XP to unlock`
                              : chapter.subtitle}
                          </p>

                          {!locked && (
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex-1 h-1 bg-muted/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-display font-bold text-muted-foreground">
                                {pct}%
                              </span>
                            </div>
                          )}
                        </div>
                        {!locked && (
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-2" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Rank Legend */}
              <div className="mt-10 p-5 rounded-2xl bg-card border border-border/20">
                <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent" /> Perfumer Ranks
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PERFUMER_RANKS.map((r) => (
                    <div
                      key={r.name}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        progress.xp >= r.minXP
                          ? "bg-muted/10"
                          : "opacity-40"
                      }`}
                    >
                      <span className="text-lg">{r.icon}</span>
                      <div>
                        <p className="text-xs font-display font-bold" style={{ color: r.color }}>
                          {r.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground">{r.minXP} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ============ CHAPTER VIEW ============ */}
          {view === "chapter" && activeChapter && (
            <motion.div
              key="chapter"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <button
                onClick={() => setView("map")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition mb-6 font-display"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Journey
              </button>

              <div className="text-center mb-8">
                <span className="text-4xl mb-2 block">{activeChapter.icon}</span>
                <h2 className="font-display text-2xl font-black text-foreground">
                  {activeChapter.title}
                </h2>
                <p className="text-sm text-muted-foreground font-body mt-1">
                  {activeChapter.subtitle}
                </p>
              </div>

              {/* Story Card */}
              <div className="p-5 rounded-2xl bg-card border border-border/20 mb-6">
                <div className="flex items-start gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground/80 font-body italic leading-relaxed">
                    {activeChapter.story}
                  </p>
                </div>
              </div>

              {/* Challenges List */}
              <div className="space-y-3">
                {activeChapter.challenges.map((challenge, i) => {
                  const key = `${activeChapter.id}-${i}`;
                  const done = progress.completedChallenges[key];

                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => startChallenge(i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
                        done
                          ? "bg-accent/5 border-accent/20"
                          : "bg-muted/5 border-border/20 hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        done ? "bg-accent/10" : "bg-muted/10"
                      }`}>
                        {done ? (
                          <CheckCircle className="w-4 h-4 text-accent" />
                        ) : (
                          <span className="text-xs font-display font-bold text-muted-foreground">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display text-foreground font-bold truncate">
                          {challenge.type === "identify" && "🔍 Identify"}
                          {challenge.type === "blend" && "⚗️ Blend"}
                          {challenge.type === "match" && "🔗 Match"}
                          {challenge.type === "story" && "📖 Knowledge"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">{challenge.question.slice(0, 60)}...</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="w-3 h-3 text-accent" />
                        <span className="text-[10px] font-display font-bold text-accent">
                          {challenge.xpReward} XP
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ============ CHALLENGE VIEW ============ */}
          {view === "challenge" && activeChapter && (
            <motion.div
              key={`challenge-${challengeIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <button
                onClick={() => setView("chapter")}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition mb-6 font-display"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Chapter
              </button>

              {(() => {
                const challenge = activeChapter.challenges[challengeIndex];
                const key = `${activeChapter.id}-${challengeIndex}`;
                const alreadyDone = progress.completedChallenges[key];
                const isCorrect = selectedAnswer === challenge.correctAnswer;

                return (
                  <div>
                    {/* Progress dots */}
                    <div className="flex justify-center gap-1.5 mb-6">
                      {activeChapter.challenges.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === challengeIndex
                              ? "bg-primary w-6"
                              : progress.completedChallenges[`${activeChapter.id}-${i}`]
                              ? "bg-accent"
                              : "bg-muted/30"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Question Card */}
                    <div className="p-6 rounded-2xl bg-card border border-border/20 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-display tracking-widest text-primary uppercase">
                          {challenge.type === "identify" && "🔍 Identify the Note"}
                          {challenge.type === "blend" && "⚗️ Blend Challenge"}
                          {challenge.type === "match" && "🔗 Match & Sort"}
                          {challenge.type === "story" && "📖 Perfumery Knowledge"}
                        </span>
                      </div>
                      <p className="text-foreground font-body text-sm leading-relaxed">
                        {challenge.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 mb-6">
                      {challenge.options?.map((option) => {
                        const selected = selectedAnswer === option;
                        const correct = option === challenge.correctAnswer;

                        let borderClass = "border-border/20 hover:border-primary/40";
                        if (showResult && correct) borderClass = "border-accent bg-accent/10";
                        else if (showResult && selected && !correct) borderClass = "border-destructive bg-destructive/10";
                        else if (selected) borderClass = "border-primary bg-primary/10";

                        return (
                          <motion.button
                            key={option}
                            whileTap={!showResult ? { scale: 0.98 } : undefined}
                            onClick={() => !showResult && setSelectedAnswer(option)}
                            disabled={showResult}
                            className={`w-full text-left p-4 rounded-xl border transition-all ${borderClass}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                showResult && correct
                                  ? "border-accent"
                                  : showResult && selected && !correct
                                  ? "border-destructive"
                                  : selected
                                  ? "border-primary"
                                  : "border-muted-foreground/30"
                              }`}>
                                {showResult && correct && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
                                {showResult && selected && !correct && <XCircle className="w-3.5 h-3.5 text-destructive" />}
                                {!showResult && selected && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <span className="text-sm font-body text-foreground">{option}</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Hint */}
                    {!showResult && challenge.hint && (
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition mb-4 font-display"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        {showHint ? "Hide hint" : "Need a hint?"}
                      </button>
                    )}
                    <AnimatePresence>
                      {showHint && !showResult && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-lg bg-accent/5 border border-accent/20 mb-4"
                        >
                          <p className="text-xs text-accent font-body italic">{challenge.hint}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Result message */}
                    <AnimatePresence>
                      {showResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl border mb-4 ${
                            isCorrect
                              ? "bg-accent/5 border-accent/20"
                              : "bg-destructive/5 border-destructive/20"
                          }`}
                        >
                          {isCorrect ? (
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-accent mt-0.5" />
                              <div>
                                <p className="text-sm font-display font-bold text-accent">
                                  {alreadyDone ? "Correct! (Already completed)" : `Correct! +${challenge.xpReward} XP`}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 font-body italic">{challenge.hint}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                              <div>
                                <p className="text-sm font-display font-bold text-destructive">Not quite!</p>
                                <p className="text-xs text-muted-foreground mt-1 font-body italic">{challenge.hint}</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      {!showResult ? (
                        <Button
                          onClick={submitAnswer}
                          disabled={!selectedAnswer}
                          className="flex-1 bg-primary text-primary-foreground font-display"
                        >
                          Submit Answer
                        </Button>
                      ) : (
                        <Button
                          onClick={nextChallenge}
                          className="flex-1 bg-primary text-primary-foreground font-display"
                        >
                          {challengeIndex < activeChapter.challenges.length - 1 ? (
                            <>Next Challenge <ArrowRight className="w-4 h-4 ml-1" /></>
                          ) : (
                            <>Complete Chapter <CheckCircle className="w-4 h-4 ml-1" /></>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
