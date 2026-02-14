import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, CheckCircle, Share, MoreVertical } from "lucide-react";
import Navbar from "@/components/Navbar";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16 px-4 max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold">Install The Perfume Lab</h1>
            <p className="text-muted-foreground font-body leading-relaxed">
              Add The Perfume Lab to your home screen for instant access to your fragrance atelier — works offline, loads instantly.
            </p>
          </div>

          {isInstalled ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
            >
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Already installed!</span>
            </motion.div>
          ) : isIOS ? (
            <div className="space-y-4 text-left">
              <h2 className="font-display text-lg font-semibold text-center">How to install on iPhone / iPad</h2>
              <div className="space-y-3">
                {[
                  { icon: <Share className="w-5 h-5" />, text: "Tap the Share button in Safari" },
                  { icon: <Download className="w-5 h-5" />, text: 'Scroll down and tap "Add to Home Screen"' },
                  { icon: <CheckCircle className="w-5 h-5" />, text: 'Tap "Add" to confirm' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl glass-surface">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {step.icon}
                    </div>
                    <span className="text-sm font-body">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-lg tracking-wide hover:brightness-110 transition-all flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
          ) : (
            <div className="space-y-4 text-left">
              <h2 className="font-display text-lg font-semibold text-center">How to install on Android</h2>
              <div className="space-y-3">
                {[
                  { icon: <MoreVertical className="w-5 h-5" />, text: "Tap the menu (⋮) in Chrome" },
                  { icon: <Download className="w-5 h-5" />, text: 'Tap "Install app" or "Add to Home screen"' },
                  { icon: <CheckCircle className="w-5 h-5" />, text: "Confirm to install" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl glass-surface">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {step.icon}
                    </div>
                    <span className="text-sm font-body">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default InstallPage;
