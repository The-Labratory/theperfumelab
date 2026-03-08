import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import alchemistWalk from "@/assets/alchemist-walk.png";
import alchemistMixing from "@/assets/alchemist-mixing.png";

/**
 * Phases:
 *  0 – walking in   (left → center, 6s)
 *  1 – cooking       (center, 10s)
 *  2 – walking out   (center → right, 6s)
 *  3 – hidden pause  (4s)
 */
const WalkingAlchemist = () => {
  const [phase, setPhase] = useState(0);

  const advancePhase = useCallback(() => {
    setPhase((p) => (p + 1) % 4);
  }, []);

  useEffect(() => {
    const durations = [6000, 10000, 6000, 4000];
    const timer = setTimeout(advancePhase, durations[phase]);
    return () => clearTimeout(timer);
  }, [phase, advancePhase]);

  // Pre-compute random values for particles
  const vapors = useMemo(() => Array.from({ length: 10 }, () => ({
    w: 4 + Math.random() * 8,
    left: 25 + Math.random() * 50,
    top: 5 + Math.random() * 20,
    yEnd: -80 - Math.random() * 60,
    xStart: (Math.random() - 0.5) * 10,
    xEnd: (Math.random() - 0.5) * 50,
    dur: 2 + Math.random() * 1.5,
  })), []);

  const bursts = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2;
    const radius = 55 + Math.random() * 30;
    return { angle, radius, size: 8 + Math.random() * 10 };
  }), []);

  const sparkles = useMemo(() => Array.from({ length: 6 }, () => ({
    left: 15 + Math.random() * 70,
    top: -10 + Math.random() * 50,
    size: 8 + Math.random() * 8,
  })), []);

  if (phase === 3) return null;

  const isWalking = phase !== 1;

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(var(--secondary))",
    "hsl(300 80% 65%)",
    "hsl(160 70% 50%)",
    "hsl(45 100% 60%)",
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden">
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
          duration: phase === 0 ? 6 : phase === 1 ? 0 : 6,
          ease: phase === 0 ? [0.25, 0.1, 0.25, 1] : phase === 2 ? [0.25, 0.1, 0.25, 1] : "linear",
        }}
        className="relative"
      >
        {/* Ground shadow - makes character feel grounded */}
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[50%]"
          style={{
            width: isWalking ? 80 : 120,
            height: 8,
            background: "radial-gradient(ellipse, hsl(var(--foreground) / 0.15), transparent 70%)",
          }}
          animate={
            isWalking
              ? { scaleX: [0.9, 1.1, 0.9], opacity: [0.3, 0.5, 0.3] }
              : { scaleX: [1, 1.05, 1], opacity: [0.4, 0.5, 0.4] }
          }
          transition={{
            duration: isWalking ? 0.6 : 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Human-like motion wrapper - body sway */}
        <motion.div
          animate={
            isWalking
              ? {
                  // Walking: realistic gait cycle with weight transfer
                  y: [0, -6, -2, -6, 0],
                  rotate: [-0.6, 0.4, -0.6, 0.4, -0.6],
                  scaleY: [1, 0.985, 1, 0.985, 1],
                }
              : {
                  // Cooking: subtle breathing + weight shift + concentration lean
                  y: [0, -1.5, 0, -1, 0],
                  rotate: [0, 0.3, 0, -0.3, 0],
                  scaleY: [1, 1.004, 1, 1.004, 1],
                }
          }
          transition={{
            duration: isWalking ? 0.6 : 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Shoulder/upper body sway - secondary motion */}
          <motion.div
            animate={
              isWalking
                ? {
                    skewX: [-0.5, 0.5, -0.5],
                    x: [-1, 1, -1],
                  }
                : {
                    skewX: [-0.2, 0.2, -0.2],
                    x: [-0.5, 0.5, -0.5],
                  }
            }
            transition={{
              duration: isWalking ? 0.6 : 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <AnimatePresence mode="wait">
              {isWalking ? (
                <motion.div
                  key="walk"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <img
                    src={alchemistWalk}
                    alt="Alchemist walking"
                    className="h-32 sm:h-44 w-auto drop-shadow-[0_4px_20px_hsl(var(--primary)/0.15)]"
                    style={{ mixBlendMode: "screen" }}
                  />
                  {/* Subtle ambient glow under feet while walking */}
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full blur-[8px]"
                    style={{ background: "hsl(var(--primary) / 0.1)" }}
                    animate={{ opacity: [0.2, 0.4, 0.2], scaleX: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="mixing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative"
                >
                  {/* Swirling vortex */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full"
                    style={{
                      background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3), hsl(var(--secondary) / 0.3), hsl(300 70% 60% / 0.2), hsl(var(--primary) / 0.3))",
                      maskImage: "radial-gradient(circle, transparent 40%, black 50%, transparent 70%)",
                      WebkitMaskImage: "radial-gradient(circle, transparent 40%, black 50%, transparent 70%)",
                    }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Pulsing glow */}
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 rounded-full blur-[40px]"
                    style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.2), transparent 70%)" }}
                    animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <img
                    src={alchemistMixing}
                    alt="Alchemist mixing perfume"
                    className="relative z-10 h-40 sm:h-52 w-auto drop-shadow-[0_4px_30px_hsl(var(--primary)/0.2)]"
                    style={{ mixBlendMode: "screen" }}
                  />

                  {/* Color explosion bursts */}
                  {bursts.map((b, i) => (
                    <motion.div
                      key={`burst-${i}`}
                      className="absolute left-1/2 top-1/3 z-20 rounded-full"
                      style={{
                        width: b.size,
                        height: b.size,
                        background: colors[i],
                        boxShadow: `0 0 16px ${colors[i].replace(")", " / 0.6)")}`,
                      }}
                      animate={{
                        x: [0, Math.cos(b.angle) * b.radius, Math.cos(b.angle) * b.radius * 1.4],
                        y: [0, Math.sin(b.angle) * b.radius - 20, Math.sin(b.angle) * b.radius * 1.4 - 40],
                        opacity: [0, 1, 0],
                        scale: [0.3, 1.3, 0],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.5 + 1,
                        ease: "easeOut",
                      }}
                    />
                  ))}

                  {/* Rising vapors */}
                  {vapors.map((v, i) => (
                    <motion.div
                      key={`vapor-${i}`}
                      className="absolute rounded-full z-10"
                      style={{
                        width: v.w,
                        height: v.w,
                        left: `${v.left}%`,
                        top: `${v.top}%`,
                        background: [
                          "hsl(var(--primary) / 0.6)",
                          "hsl(var(--accent) / 0.6)",
                          "hsl(var(--secondary) / 0.6)",
                          "hsl(300 70% 60% / 0.5)",
                        ][i % 4],
                      }}
                      animate={{
                        y: [-5, v.yEnd],
                        x: [v.xStart, v.xEnd],
                        opacity: [0, 0.8, 0],
                        scale: [0.5, 1.3, 0.2],
                      }}
                      transition={{
                        duration: v.dur,
                        repeat: Infinity,
                        delay: i * 0.35,
                        ease: "easeOut",
                      }}
                    />
                  ))}

                  {/* Sparkle stars */}
                  {sparkles.map((s, i) => (
                    <motion.div
                      key={`star-${i}`}
                      className="absolute z-20"
                      style={{
                        left: `${s.left}%`,
                        top: `${s.top}%`,
                        fontSize: s.size,
                        color: [colors[0], colors[1], colors[5]][i % 3],
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.6, 0],
                        rotate: [0, 180],
                      }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.8 + 0.3,
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
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap z-30"
                  >
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="text-[10px] sm:text-xs font-display tracking-[0.25em] uppercase text-primary/90 text-glow-primary"
                    >
                      ✦ Crafting Your Perfume ✦
                    </motion.span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footstep dots while walking */}
            {isWalking &&
              [...Array(4)].map((_, i) => (
                <motion.div
                  key={`step-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: 3,
                    height: 3,
                    bottom: 2,
                    right: 40 + i * 22,
                    background: "hsl(var(--primary) / 0.3)",
                  }}
                  animate={{ opacity: [0.5, 0], scale: [1, 0] }}
                  transition={{
                    duration: 0.7,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeOut",
                  }}
                />
              ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WalkingAlchemist;
