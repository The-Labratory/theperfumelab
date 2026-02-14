import { motion } from "framer-motion";

interface PerfumeFlaconProps {
  fillPercent: number; // 0 to 1
  liquidColor: string;
  className?: string;
}

const PerfumeFlacon = ({ fillPercent, liquidColor, className = "" }: PerfumeFlaconProps) => {
  const clampedFill = Math.max(0, Math.min(1, fillPercent));
  // The bottle body goes from y=90 to y=260 (170 units tall)
  const bodyHeight = 170;
  const liquidTop = 260 - bodyHeight * clampedFill;

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 200 300"
        className="w-full h-full drop-shadow-[0_0_20px_hsl(185_80%_55%/0.2)]"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))" }}
      >
        <defs>
          {/* Glass gradient */}
          <linearGradient id="glass-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(200 20% 90%)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="hsl(200 30% 95%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(200 20% 85%)" stopOpacity="0.12" />
          </linearGradient>

          {/* Liquid gradient - dynamic */}
          <linearGradient id="liquid-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={liquidColor} stopOpacity="0.9" />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="0.6" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="liquid-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Glass shine */}
          <linearGradient id="glass-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="0.15" />
            <stop offset="50%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Clip for liquid inside bottle */}
          <clipPath id="bottle-clip">
            {/* Bottle body - elegant curved shape */}
            <path d="
              M 65 90
              C 50 100, 40 130, 40 160
              C 40 200, 45 230, 50 250
              C 52 256, 58 260, 65 260
              L 135 260
              C 142 260, 148 256, 150 250
              C 155 230, 160 200, 160 160
              C 160 130, 150 100, 135 90
              Z
            " />
          </clipPath>

          {/* Bubble animation */}
          <radialGradient id="bubble">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Cap / Sprayer top */}
        <rect x="85" y="15" width="30" height="12" rx="3" fill="hsl(0 0% 25%)" opacity="0.9" />
        <rect x="88" y="5" width="24" height="14" rx="4" fill="hsl(0 0% 20%)" opacity="0.95" />
        
        {/* Neck */}
        <path
          d="M 88 27 L 88 70 C 88 80, 78 88, 65 90 L 135 90 C 122 88, 112 80, 112 70 L 112 27 Z"
          fill="url(#glass-gradient)"
          stroke="hsl(200 20% 60%)"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Bottle body outline */}
        <path
          d="
            M 65 90
            C 50 100, 40 130, 40 160
            C 40 200, 45 230, 50 250
            C 52 256, 58 260, 65 260
            L 135 260
            C 142 260, 148 256, 150 250
            C 155 230, 160 200, 160 160
            C 160 130, 150 100, 135 90
            Z
          "
          fill="url(#glass-gradient)"
          stroke="hsl(200 20% 60%)"
          strokeWidth="0.8"
          opacity="0.6"
        />

        {/* Liquid fill - animated */}
        {clampedFill > 0 && (
          <g clipPath="url(#bottle-clip)">
            {/* Liquid body */}
            <motion.rect
              x="38"
              width="124"
              height={bodyHeight * clampedFill}
              fill="url(#liquid-fill)"
              filter="url(#liquid-glow)"
              initial={{ y: 260 }}
              animate={{ y: liquidTop }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />

            {/* Liquid surface wave */}
            <motion.path
              d={`M 38 ${liquidTop} Q 70 ${liquidTop - 4} 100 ${liquidTop} Q 130 ${liquidTop + 4} 162 ${liquidTop}`}
              fill={liquidColor}
              opacity={0.5}
              animate={{
                d: [
                  `M 38 ${liquidTop} Q 70 ${liquidTop - 4} 100 ${liquidTop} Q 130 ${liquidTop + 4} 162 ${liquidTop}`,
                  `M 38 ${liquidTop} Q 70 ${liquidTop + 3} 100 ${liquidTop} Q 130 ${liquidTop - 3} 162 ${liquidTop}`,
                  `M 38 ${liquidTop} Q 70 ${liquidTop - 4} 100 ${liquidTop} Q 130 ${liquidTop + 4} 162 ${liquidTop}`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Bubbles */}
            {clampedFill > 0.15 && (
              <>
                <motion.circle
                  cx="80" r="2"
                  fill="url(#bubble)"
                  animate={{ cy: [250, liquidTop + 10], opacity: [0.6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}
                />
                <motion.circle
                  cx="110" r="1.5"
                  fill="url(#bubble)"
                  animate={{ cy: [245, liquidTop + 15], opacity: [0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />
                <motion.circle
                  cx="95" r="1"
                  fill="url(#bubble)"
                  animate={{ cy: [240, liquidTop + 20], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
          </g>
        )}

        {/* Glass shine overlay */}
        <path
          d="
            M 65 90
            C 50 100, 40 130, 40 160
            C 40 200, 45 230, 50 250
            C 52 256, 58 260, 65 260
            L 135 260
            C 142 260, 148 256, 150 250
            C 155 230, 160 200, 160 160
            C 160 130, 150 100, 135 90
            Z
          "
          fill="url(#glass-shine)"
          opacity="0.6"
        />

        {/* Left shine streak */}
        <line x1="58" y1="110" x2="52" y2="230" stroke="white" strokeWidth="1.5" opacity="0.12" strokeLinecap="round" />

        {/* Bottom label area */}
        <rect x="70" y="265" width="60" height="16" rx="3" fill="hsl(0 0% 10%)" opacity="0.6" />
        <text x="100" y="276" textAnchor="middle" fontSize="7" fill="hsl(0 0% 70%)" fontFamily="Orbitron, sans-serif" letterSpacing="2">
          SCENTRA
        </text>
      </svg>

      {/* Ambient glow under the bottle */}
      {clampedFill > 0 && (
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-6 rounded-full blur-xl"
          style={{ backgroundColor: liquidColor }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default PerfumeFlacon;
