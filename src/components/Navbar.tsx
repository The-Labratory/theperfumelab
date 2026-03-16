// Navbar component - standard function export
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, Search, ChevronDown, FlaskConical, Compass, ShoppingBag, Users, Briefcase } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import lhaririLogo from "@/assets/lhariri-logo.png";

interface DropdownItem {
  path: string;
  label: string;
  description?: string;
}

interface NavGroup {
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: DropdownItem[];
}

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

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

  const navGroups: NavGroup[] = [
    { label: t("nav.home"), path: "/home" },
    {
      label: t("nav.create"),
      icon: <FlaskConical className="w-4 h-4" />,
      children: [
        { path: "/lab", label: t("nav.lab"), description: t("nav.labDesc") },
        { path: "/formulation", label: t("nav.formulation"), description: t("nav.formulationDesc") },
        { path: "/dna", label: t("nav.dna"), description: t("nav.dnaDesc") },
      ],
    },
    {
      label: t("nav.explore"),
      icon: <Compass className="w-4 h-4" />,
      children: [
        { path: "/worlds", label: t("nav.worlds"), description: t("nav.worldsDesc") },
        { path: "/game", label: t("nav.game"), description: t("nav.gameDesc") },
      ],
    },
    { label: t("nav.collection"), path: "/collection" },
    {
      label: t("nav.store"),
      icon: <ShoppingBag className="w-4 h-4" />,
      children: [
        { path: "/store", label: t("nav.shop"), description: t("nav.shopDesc") },
        { path: "/gifting", label: t("nav.gifting"), description: t("nav.giftingDesc") },
      ],
    },
    {
      label: t("nav.community"),
      icon: <Users className="w-4 h-4" />,
      children: [
        { path: "/affiliate", label: t("nav.affiliate"), description: t("nav.affiliateDesc") },
        { path: "/team", label: t("nav.team"), description: t("nav.teamDesc") },
      ],
    },
    ...(user ? [{ label: t("nav.myBusiness"), path: "/my-business", icon: <Briefcase className="w-4 h-4" /> }] : []),
    ...(isAdmin ? [{ label: t("nav.backOffice"), path: "/admin" }] : []),
  ];

  const isGroupActive = (group: NavGroup) => {
    if (group.path) return location.pathname === group.path;
    return group.children?.some((c) => location.pathname === c.path) ?? false;
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  // Mobile accordion state
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-surface"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src={lhaririLogo} alt="Louis Hariri" className="h-8 sm:h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div ref={navRef} className="hidden lg:flex items-center gap-0.5 ml-8">
          {navGroups.map((group) => {
            const active = isGroupActive(group);

            if (!group.children) {
              return (
                <Link
                  key={group.label}
                  to={group.path!}
                  className={`relative px-3 xl:px-4 py-2 text-[13px] font-body font-semibold tracking-widest uppercase transition-all duration-300 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {group.label}
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                        boxShadow: "0 0 12px hsl(var(--primary) / 0.5)",
                      }}
                    />
                  )}
                </Link>
              );
            }

            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3 xl:px-4 py-2 text-[13px] font-body font-semibold tracking-widest uppercase transition-all duration-300 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      openDropdown === group.label ? "rotate-180" : ""
                    }`}
                  />
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                        boxShadow: "0 0 12px hsl(var(--primary) / 0.5)",
                      }}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {openDropdown === group.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[220px] rounded-lg border border-border/50 glass-surface p-1.5 shadow-2xl"
                      onMouseEnter={() => handleMouseEnter(group.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Vapor decoration */}
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 glass-surface border-l border-t border-border/50" />

                      {group.children!.map((child) => {
                        const childActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setOpenDropdown(null)}
                            className={`group/item flex flex-col gap-0.5 px-3 py-2.5 rounded-md transition-all duration-200 ${
                              childActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            }`}
                          >
                            <span className="text-sm font-body font-semibold tracking-wide">
                              {child.label}
                            </span>
                            {child.description && (
                              <span className="text-[11px] font-body text-muted-foreground/70 group-hover/item:text-muted-foreground transition-colors">
                                {child.description}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Desktop utility group */}
        <div className="hidden lg:flex items-center gap-1 ml-auto">
          {/* Search */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 220 }}
                  exit={{ opacity: 0, width: 0 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden"
                >
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }
                    }}
                    placeholder="Discover scents…"
                    className="w-full h-9 px-3 text-sm font-body bg-muted/50 border border-border/50 rounded-md text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-5 bg-border/40 mx-1" />
          <LanguageSwitcher />
          <CartDrawer />

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Link to="/auth">
                <User className="w-4 h-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex lg:hidden items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="w-4 h-4" />
          </Button>
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

      {/* Mobile search bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/30 overflow-hidden"
          >
            <div className="px-4 py-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Discover scents, ingredients, formulas…"
                className="w-full h-10 px-4 text-sm font-body bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-surface border-t border-border/30 overflow-hidden max-h-[70vh] overflow-y-auto"
          >
            <div className="px-4 py-3 flex flex-col gap-0.5">
              {navGroups.map((group) => {
                if (!group.children) {
                  const active = location.pathname === group.path;
                  return (
                    <Link
                      key={group.label}
                      to={group.path!}
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-3 rounded-lg text-sm font-body font-semibold tracking-widest uppercase transition-colors ${
                        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {group.label}
                    </Link>
                  );
                }

                const groupActive = group.children.some((c) => location.pathname === c.path);
                const isExpanded = mobileExpanded === group.label;

                return (
                  <div key={group.label}>
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : group.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-body font-semibold tracking-widest uppercase transition-colors ${
                        groupActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {group.icon}
                        {group.label}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-6 pb-1 flex flex-col gap-0.5">
                            {group.children!.map((child) => {
                              const childActive = location.pathname === child.path;
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => {
                                    setMobileOpen(false);
                                    setMobileExpanded(null);
                                  }}
                                  className={`px-4 py-2.5 rounded-md text-sm font-body transition-colors ${
                                    childActive
                                      ? "text-primary bg-primary/10"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                  }`}
                                >
                                  <span className="font-medium">{child.label}</span>
                                  {child.description && (
                                    <span className="block text-[11px] text-muted-foreground/60 mt-0.5">
                                      {child.description}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};


