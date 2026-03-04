import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import alchemistWalk from "@/assets/alchemist-walk.png";
import alchemistMixing from "@/assets/alchemist-mixing.png";

/**
 * Phases:
 *  0 – walking in   (left → center, 5s)
 *  1 – cooking       (center, 9s — dramatic effects)
 *  2 – walking out   (center → right, 5s)
 *  3 – hidden pause  (3s)
 */
const WalkingAlchemist = () => {
  const [phase, setPhase] = useState(0);

  const advancePhase = useCallback(() => {
    setPhase((p) => (p + 1) % 4);
  }, []);

  useEffect(() => {
    const durations = [5000, 9000, 5000, 3500];
    const timer = setTimeout(advancePhase, durations[phase]);
    return () => clearTimeout(timer);
  }, [phase, advancePhase]);

  if (phase === 3) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-20 pointer-events-none overflow-hidden">
      <motion.div
        key={phase}
        initial={{
          x: phase === 0 ? "-15vw" : "45vw",
          opacity: phase === 0 ? 0 : 1,
        }}
        animate={{
          x: phase === 0 ? "45vw" : phase === 1 ? "45vw" : "115vw",
          opacity: phase === 2 ? [1, 1, 0] : 1,
        }}
        transition={{
          duration: phase === 0 ? 5 : phase === 1 ? 0 : 5,
          ease: "linear",
        }}
        className="relative"
      >
        {/* Walk bob / cooking sway */}
        <motion.div
          animate={
            phase !== 1
              ? { y: [0, -8, 0], rotate: [0, -1.5, 0, 1.5, 0] }
              : { y: [0, -3, 0] }
          }
          transition={{
            duration: phase !== 1 ? 0.6 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            {phase !== 1 ? (
              <motion.img
                key="walk"
                src={alchemistWalk}
                alt="Alchemist walking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="h-28 sm:h-40 w-auto mix-blend-screen"
                style={{ filter: "drop-shadow(0 0 16px hsl(185 80% 55% / 0.5))" }}
              />
            ) : (
              <motion.div
                key="mixing"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Swirling vortex ring behind the alchemist */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.4), hsl(var(--secondary) / 0.4), hsl(300 70% 60% / 0.3), hsl(var(--primary) / 0.4))",
                    maskImage: "radial-gradient(circle, transparent 40%, black 50%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(circle, transparent 40%, black 50%, transparent 70%)",
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* Pulsing glow underneath */}
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 rounded-full blur-[40px]"
                  style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.3), transparent 70%)" }}
                  animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />

                <img
                  src={alchemistMixing}
                  alt="Alchemist mixing perfume"
                  className="relative z-10 h-36 sm:h-48 w-auto mix-blend-screen"
                  style={{ filter: "drop-shadow(0 0 28px hsl(35 90% 55% / 0.6))" }}
                />

                {/* Color explosion bursts */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i / 6) * Math.PI * 2;
                  const radius = 60 + Math.random() * 30;
                  return (
                    <motion.div
                      key={`burst-${i}`}
                      className="absolute left-1/2 top-1/3 z-20 rounded-full"
                      style={{
                        width: 8 + Math.random() * 10,
                        height: 8 + Math.random() * 10,
                        background: [
                          "hsl(var(--primary))",
                          "hsl(var(--accent))",
                          "hsl(var(--secondary))",
                          "hsl(300 80% 65%)",
                          "hsl(160 70% 50%)",
                          "hsl(45 100% 60%)",
                        ][i],
                        boxShadow: `0 0 20px ${["hsl(var(--primary) / 0.8)", "hsl(var(--accent) / 0.8)", "hsl(var(--secondary) / 0.8)", "hsl(300 80% 65% / 0.8)", "hsl(160 70% 50% / 0.8)", "hsl(45 100% 60% / 0.8)"][i]}`,
                      }}
                      animate={{
                        x: [0, Math.cos(angle) * radius, Math.cos(angle) * radius * 1.5],
                        y: [0, Math.sin(angle) * radius - 20, Math.sin(angle) * radius * 1.5 - 40],
                        opacity: [0, 1, 0],
                        scale: [0.3, 1.5, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.5 + 1,
                        ease: "easeOut",
                      }}
                    />
                  );
                })}

                {/* Rising vapors */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`vapor-${i}`}
                    className="absolute rounded-full z-10"
                    style={{
                      width: 4 + Math.random() * 10,
                      height: 4 + Math.random() * 10,
                      left: `${25 + Math.random() * 50}%`,
                      top: `${5 + Math.random() * 20}%`,
                      background: [
                        "hsl(var(--primary) / 0.7)",
                        "hsl(var(--accent) / 0.7)",
                        "hsl(var(--secondary) / 0.7)",
                        "hsl(300 70% 60% / 0.6)",
                      ][i % 4],
                    }}
                    animate={{
                      y: [-5, -80 - Math.random() * 60],
                      x: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 50],
                      opacity: [0, 0.9, 0],
                      scale: [0.5, 1.4, 0.2],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 1.5,
                      repeat: Infinity,
                      delay: i * 0.35,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {/* Sparkle stars */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={`star-${i}`}
                    className="absolute z-20"
                    style={{
                      left: `${15 + Math.random() * 70}%`,
                      top: `${-10 + Math.random() * 50}%`,
                      fontSize: 8 + Math.random() * 8,
                      color: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(45 100% 70%)"][i % 3],
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.8, 0],
                      rotate: [0, 180],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.7 + 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    ✦
                  </motion.div>
                ))}

                {/* Label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
                >
                  <motion.span
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10px] sm:text-xs font-display tracking-[0.25em] uppercase text-primary/90 text-glow-primary"
                  >
                    ✦ Crafting Your Perfume ✦
                  </motion.span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footstep dots while walking */}
          {phase !== 1 &&
            [...Array(5)].map((_, i) => (
              <motion.div
                key={`step-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 3,
                  height: 3,
                  bottom: 2,
                  right: 40 + i * 20,
                  background: "hsl(var(--primary) / 0.4)",
                }}
                animate={{ opacity: [0.6, 0], scale: [1, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeOut",
                }}
              />
            ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WalkingAlchemist;
