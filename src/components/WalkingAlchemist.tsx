import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import alchemistWalk from "@/assets/alchemist-walk.png";
import alchemistMixing from "@/assets/alchemist-mixing.png";

interface WalkingAlchemistProps {
  className?: string;
}

/**
 * Alchemist walks in from left, stops in the center to mix perfume,
 * then walks out to the right. Full cycle repeats.
 * 
 * Phases:
 *  0 – walking in  (left → center, ~5s)
 *  1 – cooking      (center, ~5s)
 *  2 – walking out  (center → right, ~5s)
 *  3 – hidden pause (~3s)
 */
const WalkingAlchemist = ({ className = "" }: WalkingAlchemistProps) => {
  const [phase, setPhase] = useState(0);

  const advancePhase = useCallback(() => {
    setPhase((p) => (p + 1) % 4);
  }, []);

  useEffect(() => {
    const durations = [5000, 5500, 5000, 3500];
    const timer = setTimeout(advancePhase, durations[phase]);
    return () => clearTimeout(timer);
  }, [phase, advancePhase]);

  if (phase === 3) return null;

  return (
    <div className={`fixed bottom-4 left-0 right-0 z-20 pointer-events-none overflow-hidden ${className}`}>
      <motion.div
        key={phase}
        initial={{
          x: phase === 0 ? "-15vw" : phase === 2 ? "45vw" : "45vw",
          opacity: phase === 0 ? 0 : 1,
        }}
        animate={{
          x: phase === 0 ? "45vw" : phase === 1 ? "45vw" : "115vw",
          opacity: phase === 2 ? [1, 1, 0] : 1,
        }}
        transition={{
          duration: phase === 0 ? 5 : phase === 1 ? 0 : 5,
          ease: phase === 1 ? "easeInOut" : "linear",
        }}
        className="relative"
      >
        {/* Walking bob for walk phases */}
        <motion.div
          animate={
            phase !== 1
              ? { y: [0, -8, 0], rotate: [0, -1.5, 0, 1.5, 0] }
              : { y: [0, -2, 0] }
          }
          transition={{
            duration: phase !== 1 ? 0.6 : 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Walking sprite */}
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
                className="h-28 sm:h-40 w-auto"
                style={{ filter: "drop-shadow(0 0 20px hsl(185 80% 55% / 0.4))" }}
              />
            ) : (
              <motion.div
                key="mixing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <img
                  src={alchemistMixing}
                  alt="Alchemist mixing perfume"
                  className="h-32 sm:h-44 w-auto"
                  style={{ filter: "drop-shadow(0 0 24px hsl(35 90% 55% / 0.5))" }}
                />
                {/* Rising vapors during cooking */}
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 4 + Math.random() * 8,
                      height: 4 + Math.random() * 8,
                      left: `${30 + Math.random() * 40}%`,
                      top: `${5 + Math.random() * 15}%`,
                      background: [
                        "hsl(var(--primary) / 0.7)",
                        "hsl(var(--accent) / 0.7)",
                        "hsl(var(--secondary) / 0.7)",
                        "hsl(300 70% 60% / 0.6)",
                      ][i % 4],
                    }}
                    animate={{
                      y: [-5, -60 - Math.random() * 50],
                      x: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 40],
                      opacity: [0, 0.9, 0],
                      scale: [0.5, 1.2, 0.3],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 1.5,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeOut",
                    }}
                  />
                ))}
                {/* Sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full bg-accent"
                    style={{
                      left: `${25 + Math.random() * 50}%`,
                      top: `${-5 + Math.random() * 30}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.6 + 0.5,
                      ease: "easeInOut",
                    }}
                  />
                ))}
                {/* "Crafting perfume" label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-[10px] sm:text-xs font-display tracking-[0.25em] uppercase text-primary/80 text-glow-primary">
                    ✦ Crafting Your Perfume ✦
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footstep trail while walking */}
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
