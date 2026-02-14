import { useMemo } from "react";
import { motion } from "framer-motion";

interface PerfumeFlaconProps {
  fillPercent: number;
  noteColors: string[]; // array of HSL color strings from selected notes
  className?: string;
}

function parseHSL(color: string): [number, number, number] {
  const match = color.match(/hsl\((\d+)\s+(\d+)%?\s+(\d+)%?\)/);
  if (!match) return [185, 65, 50];
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

const PerfumeFlacon = ({ fillPercent, noteColors, className = "" }: PerfumeFlaconProps) => {
  const clampedFill = Math.max(0, Math.min(1, fillPercent));
  const bodyHeight = 170;
  const liquidTop = 260 - bodyHeight * clampedFill;

  // Build a smooth gradient from all note colors
  const gradientStops = useMemo(() => {
    if (noteColors.length === 0) return [{ color: "hsl(185, 65%, 50%)", offset: "0%" }, { color: "hsl(185, 80%, 40%)", offset: "100%" }];
    if (noteColors.length === 1) {
      const [h, s, l] = parseHSL(noteColors[0]);
      return [
        { color: `hsl(${h}, ${s}%, ${l + 10}%)`, offset: "0%" },
        { color: `hsl(${h}, ${s}%, ${l - 5}%)`, offset: "100%" },
      ];
    }
    return noteColors.map((c, i) => {
      const [h, s, l] = parseHSL(c);
      return { color: `hsl(${h}, ${s}%, ${l}%)`, offset: `${(i / (noteColors.length - 1)) * 100}%` };
    });
  }, [noteColors]);

  // Get a primary glow color
  const glowColor = useMemo(() => {
    if (noteColors.length === 0) return "hsl(185, 65%, 50%)";
    const hues = noteColors.map(c => parseHSL(c));
    const avgH = Math.round(hues.reduce((a, h) => a + h[0], 0) / hues.length);
    const avgS = Math.round(hues.reduce((a, h) => a + h[1], 0) / hues.length);
    return `hsl(${avgH}, ${avgS}%, 45%)`;
  }, [noteColors]);

  // Unique IDs for multiple instances
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 300"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}
      >
        <defs>
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(200, 20%, 90%)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="hsl(200, 30%, 95%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(200, 20%, 85%)" stopOpacity="0.12" />
          </linearGradient>

          {/* Multi-color liquid gradient */}
          <linearGradient id={`liquid-${uid}`} x1="0" y1="0" x2="0" y2="1">
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} stopOpacity={i === 0 ? "0.95" : "0.7"}>
                <animate
                  attributeName="stop-color"
                  values={`${stop.color};${stop.color}`}
                  dur="0.8s"
                  fill="freeze"
                />
              </stop>
            ))}
          </linearGradient>

          <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="0.15" />
            <stop offset="50%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <clipPath id={`clip-${uid}`}>
            <path d="M 65 90 C 50 100, 40 130, 40 160 C 40 200, 45 230, 50 250 C 52 256, 58 260, 65 260 L 135 260 C 142 260, 148 256, 150 250 C 155 230, 160 200, 160 160 C 160 130, 150 100, 135 90 Z" />
          </clipPath>

          <radialGradient id={`bubble-${uid}`}>
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cap */}
        <rect x="85" y="15" width="30" height="12" rx="3" fill="hsl(0, 0%, 25%)" opacity="0.9" />
        <rect x="88" y="5" width="24" height="14" rx="4" fill="hsl(0, 0%, 20%)" opacity="0.95" />

        {/* Neck */}
        <path d="M 88 27 L 88 70 C 88 80, 78 88, 65 90 L 135 90 C 122 88, 112 80, 112 70 L 112 27 Z"
          fill={`url(#glass-${uid})`} stroke="hsl(200, 20%, 60%)" strokeWidth="0.5" opacity="0.5" />

        {/* Body outline */}
        <path d="M 65 90 C 50 100, 40 130, 40 160 C 40 200, 45 230, 50 250 C 52 256, 58 260, 65 260 L 135 260 C 142 260, 148 256, 150 250 C 155 230, 160 200, 160 160 C 160 130, 150 100, 135 90 Z"
          fill={`url(#glass-${uid})`} stroke="hsl(200, 20%, 60%)" strokeWidth="0.8" opacity="0.6" />

        {/* Liquid */}
        {clampedFill > 0 && (
          <g clipPath={`url(#clip-${uid})`}>
            <motion.rect
              x="38" width="124"
              height={bodyHeight * clampedFill}
              fill={`url(#liquid-${uid})`}
              filter={`url(#glow-${uid})`}
              initial={{ y: 260 }}
              animate={{ y: liquidTop }}
              transition={{ type: "spring", stiffness: 50, damping: 12 }}
            />

            <motion.path
              d={`M 38 ${liquidTop} Q 70 ${liquidTop - 4} 100 ${liquidTop} Q 130 ${liquidTop + 4} 162 ${liquidTop}`}
              fill={glowColor}
              opacity={0.4}
              animate={{
                d: [
                  `M 38 ${liquidTop} Q 70 ${liquidTop - 5} 100 ${liquidTop} Q 130 ${liquidTop + 5} 162 ${liquidTop}`,
                  `M 38 ${liquidTop} Q 70 ${liquidTop + 4} 100 ${liquidTop} Q 130 ${liquidTop - 4} 162 ${liquidTop}`,
                  `M 38 ${liquidTop} Q 70 ${liquidTop - 5} 100 ${liquidTop} Q 130 ${liquidTop + 5} 162 ${liquidTop}`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {clampedFill > 0.15 && (
              <>
                <motion.circle cx="80" r="2" fill={`url(#bubble-${uid})`}
                  animate={{ cy: [250, liquidTop + 10], opacity: [0.6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }} />
                <motion.circle cx="110" r="1.5" fill={`url(#bubble-${uid})`}
                  animate={{ cy: [245, liquidTop + 15], opacity: [0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }} />
                <motion.circle cx="95" r="1" fill={`url(#bubble-${uid})`}
                  animate={{ cy: [240, liquidTop + 20], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
              </>
            )}
          </g>
        )}

        {/* Glass shine */}
        <path d="M 65 90 C 50 100, 40 130, 40 160 C 40 200, 45 230, 50 250 C 52 256, 58 260, 65 260 L 135 260 C 142 260, 148 256, 150 250 C 155 230, 160 200, 160 160 C 160 130, 150 100, 135 90 Z"
          fill={`url(#shine-${uid})`} opacity="0.6" />
        <line x1="58" y1="110" x2="52" y2="230" stroke="white" strokeWidth="1.5" opacity="0.12" strokeLinecap="round" />

        {/* Label */}
        <rect x="70" y="265" width="60" height="16" rx="3" fill="hsl(0, 0%, 10%)" opacity="0.6" />
        <text x="100" y="276" textAnchor="middle" fontSize="7" fill="hsl(0, 0%, 70%)" fontFamily="Orbitron, sans-serif" letterSpacing="2">SCENTRA</text>
      </svg>

      {clampedFill > 0 && (
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-full blur-xl"
          style={{ backgroundColor: glowColor }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default PerfumeFlacon;
