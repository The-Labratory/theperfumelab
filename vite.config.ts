import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const fallbackSupabaseUrl =
  process.env.VITE_SUPABASE_URL ?? "https://xkfztnyodbzftlshoqui.supabase.co";
const fallbackSupabasePublishableKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZnp0bnlvZGJ6ZnRsc2hvcXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODQ2NTIsImV4cCI6MjA4NjY2MDY1Mn0.JAz1c8n0gK-ua0eozWgAbDHOCoqJ-h5tnbJxic6GPw8";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(fallbackSupabaseUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      fallbackSupabasePublishableKey,
    ),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "placeholder.svg"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,webp,woff,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
      },
      manifest: {
        name: "The Perfume Lab — Fragrance Atelier",
        short_name: "The Perfume Lab",
        description: "Craft your signature scent. Explore fragrance worlds, build custom compositions, and shop luxury perfumes.",
        theme_color: "#0a0a0f",
        background_color: "#0a0a0f",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
