import { Heart, Sparkles, Sun, Moon, Zap, Coffee } from "lucide-react";

export const personalities = [
  { id: "romantic", label: "Romantic", emoji: "💕", desc: "Dreamy, sensual, soft" },
  { id: "bold", label: "Bold", emoji: "🔥", desc: "Confident, intense, powerful" },
  { id: "elegant", label: "Elegant", emoji: "👑", desc: "Refined, classic, polished" },
  { id: "adventurous", label: "Adventurous", emoji: "🌍", desc: "Free-spirited, fresh, natural" },
  { id: "mysterious", label: "Mysterious", emoji: "🌙", desc: "Dark, deep, enigmatic" },
  { id: "playful", label: "Playful", emoji: "✨", desc: "Light, fun, sweet" },
];

export const occasions = [
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "valentine", label: "Valentine's", emoji: "❤️" },
  { id: "wedding", label: "Wedding", emoji: "💒" },
  { id: "corporate", label: "Corporate Gift", emoji: "💼" },
  { id: "thank-you", label: "Thank You", emoji: "🙏" },
  { id: "just-because", label: "Just Because", emoji: "🎁" },
];

export const moods = [
  { id: "warm", label: "Warm & Cozy", icon: Coffee },
  { id: "fresh", label: "Fresh & Bright", icon: Sun },
  { id: "seductive", label: "Seductive", icon: Moon },
  { id: "energizing", label: "Energizing", icon: Zap },
  { id: "calming", label: "Calming", icon: Heart },
  { id: "luxurious", label: "Luxurious", icon: Sparkles },
];

export const zodiacSigns = [
  { id: "aries", label: "Aries", emoji: "♈" },
  { id: "taurus", label: "Taurus", emoji: "♉" },
  { id: "gemini", label: "Gemini", emoji: "♊" },
  { id: "cancer", label: "Cancer", emoji: "♋" },
  { id: "leo", label: "Leo", emoji: "♌" },
  { id: "virgo", label: "Virgo", emoji: "♍" },
  { id: "libra", label: "Libra", emoji: "♎" },
  { id: "scorpio", label: "Scorpio", emoji: "♏" },
  { id: "sagittarius", label: "Sagittarius", emoji: "♐" },
  { id: "capricorn", label: "Capricorn", emoji: "♑" },
  { id: "aquarius", label: "Aquarius", emoji: "♒" },
  { id: "pisces", label: "Pisces", emoji: "♓" },
];

export interface GiftBlend {
  blendName: string;
  story: string;
  notes: { name: string; emoji: string; layer: string; reason: string }[];
  mood: string;
  intensity: string;
  scentLetter?: string;
}
