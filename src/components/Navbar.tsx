import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Menu, X } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/worlds", label: "Worlds" },
  { path: "/lab", label: "Scent Lab" },
  { path: "/store", label: "Store" },
  { path: "/onboarding", label: "Discover DNA" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-surface"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:drop-shadow-[0_0_8px_hsl(185_80%_55%/0.6)] transition-all" />
          <span className="font-display text-base sm:text-lg font-bold tracking-wider text-foreground">
            SCENTRA
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative px-3 lg:px-4 py-2 text-sm font-body font-medium tracking-wide transition-colors ${
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
          <div className="ml-2">
            <CartDrawer />
          </div>
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-2">
          <CartDrawer />
          <button className="text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-surface border-t border-border/30 overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-body font-medium tracking-wide transition-colors ${
                      isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
