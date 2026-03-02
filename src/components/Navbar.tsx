import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import lhaririLogo from "@/assets/lhariri-logo.png";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    });
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
        setIsAdmin(!!data);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { path: "/home", label: t("nav.home") },
    { path: "/worlds", label: t("nav.worlds") },
    { path: "/lab", label: t("nav.lab") },
    { path: "/formulation", label: t("nav.formulation") },
    { path: "/collection", label: t("nav.collection") },
    { path: "/gifting", label: t("nav.gifting") },
    { path: "/store", label: t("nav.store") },
    { path: "/dna", label: t("nav.dna") },
    { path: "/affiliate", label: t("nav.affiliate") },
    ...(isAdmin ? [{ path: "/admin", label: t("nav.backOffice") }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-surface"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src={lhaririLogo} alt="Louis Hariri" className="h-8 sm:h-10 w-auto" />
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
          <LanguageSwitcher />
          <div className="ml-1">
            <CartDrawer />
          </div>
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-1 gap-1.5 text-muted-foreground hover:text-foreground px-2">
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="ml-1 font-display tracking-wider text-xs border-primary/30 hover:bg-primary/10">
              <Link to="/auth">
                <User className="w-3.5 h-3.5 mr-1.5" /> {t("nav.login")}
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex md:hidden items-center gap-1">
          <LanguageSwitcher />
          <CartDrawer />
          {user ? (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <Link to="/auth"><User className="w-4 h-4" /></Link>
            </Button>
          )}
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
