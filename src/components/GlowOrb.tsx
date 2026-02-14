import { motion } from "framer-motion";

const GlowOrb = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full orb-glow"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "blur(40px)" }}
      />
      {/* Mid glow */}
      <motion.div
        className="absolute inset-[15%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(185 80% 55% / 0.5) 0%, hsl(265 60% 50% / 0.3) 50%, transparent 70%)",
          filter: "blur(20px)",
        }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Core */}
      <motion.div
        className="absolute inset-[25%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(185 80% 70% / 0.8) 0%, hsl(35 90% 55% / 0.4) 50%, hsl(265 60% 50% / 0.2) 80%, transparent 100%)",
          filter: "blur(5px)",
        }}
        animate={{ scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Bright center */}
      <motion.div
        className="absolute inset-[40%] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(185 80% 80% / 0.9) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default GlowOrb;
