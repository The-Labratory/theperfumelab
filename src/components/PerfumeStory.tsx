import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import type { Note } from "@/data/scentNotes";
import { noteFamilyMap } from "@/data/scentDNA";

interface SelectedNote extends Note {
  intensity: number;
  warmth: number;
}

interface PerfumeStoryProps {
  notes: SelectedNote[];
}

function generateStory(notes: SelectedNote[]): string {
  const topNotes = notes.filter((n) => n.layer === "top");
  const heartNotes = notes.filter((n) => n.layer === "heart");
  const baseNotes = notes.filter((n) => n.layer === "base");

  const families = notes.map((n) => noteFamilyMap[n.id] || "other");
  const isWoody = families.includes("woody") || families.includes("oriental");
  const isFloral = families.includes("floral");
  const isCitrus = families.includes("citrus") || families.includes("green");
  const isGourmand = families.includes("gourmand");
  const isDark = families.includes("leather") || families.includes("oriental");

  const openings = [
    isCitrus && "Born from a burst of light and zest,",
    isFloral && "Awakened by petals kissed in morning dew,",
    isDark && "Emerging from shadow and flame,",
    isGourmand && "Sweet alchemy unfolds on the skin,",
  ].filter(Boolean);

  const middles = [
    heartNotes.length > 0 && `the heart reveals ${heartNotes.map((n) => n.name.toLowerCase()).join(" and ")} — `,
    isFloral && "a garden that blooms only at dusk. ",
    isDark && "an intensity that commands every room. ",
    isCitrus && "a cascade of freshness that electrifies. ",
    isGourmand && "warmth that wraps like cashmere. ",
  ].filter(Boolean);

  const endings = [
    isWoody && `Grounded in ${baseNotes.map((n) => n.name.toLowerCase()).join(", ")}, this fragrance lingers like a memory you can't forget.`,
    baseNotes.length > 0 && `The dry-down of ${baseNotes[0]?.name.toLowerCase()} leaves an indelible signature on the skin.`,
    "A creation that evolves with your warmth, becoming uniquely yours.",
  ].filter(Boolean);

  const opening = openings[0] || "A composition of rare beauty,";
  const middle = middles[0] || "layers unfold in perfect harmony. ";
  const ending = endings[0] || "This is your signature, bottled.";

  return `${opening} ${middle}${ending}`;
}

const PerfumeStory = ({ notes }: PerfumeStoryProps) => {
  if (notes.length < 2) return null;

  const story = generateStory(notes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-surface rounded-xl p-4 sm:p-5 border border-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-accent" />
        <span className="font-display text-[10px] sm:text-xs tracking-widest text-accent">YOUR PERFUME STORY</span>
      </div>
      <p className="text-xs sm:text-sm font-body text-muted-foreground leading-relaxed italic">
        "{story}"
      </p>
    </motion.div>
  );
};

export default PerfumeStory;
