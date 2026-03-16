import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { worlds } from "@/data/worldsData";
import { useTranslation } from "react-i18next";

const WorldsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleField count={15} />

      <div className="relative z-10 pt-24 pb-16 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <h1 className="font-display text-3xl md:text-5xl font-black tracking-wider gradient-text mb-3">
            {t("worlds.title")}
          </h1>
          <p className="text-muted-foreground font-body text-lg">
            {t("worlds.subtitle")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((world, i) => (
            <motion.div
              key={world.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/worlds/${world.id}`)}
              className={`relative group rounded-2xl overflow-hidden cursor-pointer ${
                !world.unlocked ? "opacity-60" : ""
              }`}
            >
              <div className="aspect-[4/5] relative">
                <img
                  src={world.image}
                  alt={world.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                {!world.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="glass-surface rounded-full px-5 py-2">
                      <span className="font-display text-xs tracking-widest text-muted-foreground">
                        🔒 LOCKED
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-3xl mb-2">{world.emoji}</p>
                  <h3 className="font-display text-base font-bold tracking-wide text-foreground mb-1">
                    {world.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">{world.type}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorldsPage;
