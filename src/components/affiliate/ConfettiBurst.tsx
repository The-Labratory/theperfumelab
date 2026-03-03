import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  delay: number;
  shape: "circle" | "rect" | "star";
}

const COLORS = [
  "hsl(45 93% 47%)",
  "hsl(280 70% 55%)",
  "hsl(170 80% 45%)",
  "hsl(350 80% 55%)",
  "hsl(45 100% 65%)",
  "hsl(200 80% 55%)",
];

// Intensity 0-5 maps to rank index (Starter=0 … Diamond=5)
function generateParticles(count: number, intensity: number): Particle[] {
  const spread = 200 + intensity * 40;   // wider burst for higher ranks
  const height = 140 + intensity * 30;   // taller burst
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * spread,
    y: -(Math.random() * height + 40),
    rotation: Math.random() * 720 - 360,
    scale: (Math.random() * 0.6 + 0.4) * (1 + intensity * 0.12),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 0.15,
    shape: (["circle", "rect", "star"] as const)[Math.floor(Math.random() * 3)],
  }));
}

// intensity: 0 (Starter) → 5 (Diamond)
const PARTICLE_COUNTS = [12, 18, 26, 36, 50, 70];

export default function ConfettiBurst({ trigger, intensity = 0 }: { trigger: boolean; intensity?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idx = Math.min(Math.max(intensity, 0), 5);

  useEffect(() => {
    if (trigger) {
      setParticles(generateParticles(PARTICLE_COUNTS[idx], idx));
      const t = setTimeout(() => setParticles([]), 1200 + idx * 200);
      return () => clearTimeout(t);
    }
  }, [trigger, idx]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }}
            animate={{
              opacity: [1, 1, 0],
              x: p.x,
              y: p.y,
              rotate: p.rotation,
              scale: [0, p.scale, p.scale * 0.5],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, delay: p.delay, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2"
          >
            {p.shape === "circle" && (
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            )}
            {p.shape === "rect" && (
              <div className="w-2 h-3 rounded-sm" style={{ background: p.color }} />
            )}
            {p.shape === "star" && (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <polygon points="5,0 6.2,3.5 10,4 7,6.5 8,10 5,8 2,10 3,6.5 0,4 3.8,3.5" fill={p.color} />
              </svg>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
