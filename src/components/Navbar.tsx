import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Droplets } from "lucide-react";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/worlds", label: "Worlds" },
  { path: "/lab", label: "Scent Lab" },
  { path: "/onboarding", label: "Discover DNA" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-surface"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Droplets className="w-6 h-6 text-primary group-hover:drop-shadow-[0_0_8px_hsl(185_80%_55%/0.6)] transition-all" />
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            SCENTRA
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 text-sm font-body font-medium tracking-wide transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    style={{ boxShadow: "0 0 8px hsl(185 80% 55% / 0.5)" }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
