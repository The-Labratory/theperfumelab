import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import GrokChatWidget from "@/components/GrokChatWidget";
import { useCartSync } from "@/hooks/useCartSync";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// ── Lazy-load every page ─────────────────────────────────────────────────────
const GatewayPage = lazy(() => import("./pages/GatewayPage"));
const Index = lazy(() => import("./pages/Index"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const WorldsPage = lazy(() => import("./pages/WorldsPage"));
const ScentLabPage = lazy(() => import("./pages/ScentLabPage"));
const StorePage = lazy(() => import("./pages/StorePage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const WorldDetailPage = lazy(() => import("./pages/WorldDetailPage"));
const CollectionPage = lazy(() => import("./pages/CollectionPage"));
const ScentDNAPage = lazy(() => import("./pages/ScentDNAPage"));
const GiftingPage = lazy(() => import("./pages/GiftingPage"));
const GiftRevealPage = lazy(() => import("./pages/GiftRevealPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));
const PartnerPage = lazy(() => import("./pages/PartnerPage"));
const ExclusiveAccessPage = lazy(() => import("./pages/ExclusiveAccessPage"));
const LaunchPage = lazy(() => import("./pages/LaunchPage"));
const SharePage = lazy(() => import("./pages/SharePage"));
const MilestonesPage = lazy(() => import("./pages/MilestonesPage"));
const FormulationLabPage = lazy(() => import("./pages/FormulationLabPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AuthEmailConfirmationPage = lazy(() => import("./pages/AuthEmailConfirmationPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PerfumeCatalogPage = lazy(() => import("./pages/PerfumeCatalogPage"));
const ScentQuizPage = lazy(() => import("./pages/ScentQuizPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const OrderHistoryPage = lazy(() => import("./pages/OrderHistoryPage"));
const AffiliatePage = lazy(() => import("./pages/AffiliatePage"));
const PerfumerGamePage = lazy(() => import("./pages/PerfumerGamePage"));
const ReferralNetworkPage = lazy(() => import("./pages/ReferralNetworkPage"));
const PartnerProgramPage = lazy(() => import("./pages/PartnerProgramPage"));
const AffiliateSignupPage = lazy(() => import("./pages/AffiliateSignupPage"));
const AffiliateStarterPackPage = lazy(() => import("./pages/AffiliateStarterPackPage"));
const AffiliateLanding = lazy(() => import("./pages/affiliate/AffiliateLanding"));
const AffiliateWelcome = lazy(() => import("./pages/affiliate/AffiliateWelcome"));
const AffiliateDashboardPage = lazy(() => import("./pages/affiliate/AffiliateDashboard"));
const AffiliateOnboardPage = lazy(() => import("./pages/affiliate/AffiliateOnboardPage"));
const AffiliatePortalPage = lazy(() => import("./pages/affiliate/AffiliatePortalPage"));
const CreatorPortalPage = lazy(() => import("./pages/CreatorPortalPage"));
const SEOPageGeneratorPage = lazy(() => import("./pages/SEOPageGeneratorPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AIPage = lazy(() => import("./pages/AIPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const IngredientsManager = lazy(() => import("./pages/admin/IngredientsManager"));
const InteractionsManager = lazy(() => import("./pages/admin/InteractionsManager"));
const FormulasManager = lazy(() => import("./pages/admin/FormulasManager"));
const IFRARulesManager = lazy(() => import("./pages/admin/IFRARulesManager"));
const AuditLogPage = lazy(() => import("./pages/admin/AuditLogPage"));
const PartnerManager = lazy(() => import("./pages/admin/PartnerManager"));
const EmployeeManager = lazy(() => import("./pages/admin/EmployeeManager"));
const PyramidManager = lazy(() => import("./pages/admin/PyramidManager"));
const EmployeeOnboardingPage = lazy(() => import("./pages/admin/EmployeeOnboardingPage"));
const AffiliateAdminPage = lazy(() => import("./pages/admin/AffiliateAdminPage"));

// Super Admin
const SuperAdminLayout = lazy(() => import("./pages/superadmin/SuperAdminLayout"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));
const SACustomersPage = lazy(() => import("./pages/superadmin/CustomersPage"));
const SAAgentsPage = lazy(() => import("./pages/superadmin/AgentsPage"));
const SAAuditLogsPage = lazy(() => import("./pages/superadmin/AuditLogsPage"));
const SASecurityEventsPage = lazy(() => import("./pages/superadmin/SecurityEventsPage"));
const SASystemSettingsPage = lazy(() => import("./pages/superadmin/SystemSettingsPage"));
const SAPyramidBuilderPage = lazy(() => import("./pages/superadmin/PyramidBuilderPage"));
const SAEmployeeRequestsPage = lazy(() => import("./pages/superadmin/EmployeeRequestsPage"));
const SADatabaseExplorerPage = lazy(() => import("./pages/superadmin/DatabaseExplorerPage"));
const SAStorageManagerPage = lazy(() => import("./pages/superadmin/StorageManagerPage"));
const SAPermissionsPage = lazy(() => import("./pages/superadmin/PermissionsPage"));
const SAReferralManagementPage = lazy(() => import("./pages/superadmin/ReferralManagementPage"));

// Business Portal
const BusinessLayout = lazy(() => import("./pages/business/BusinessLayout"));
const BusinessDashboard = lazy(() => import("./pages/business/BusinessDashboard"));
const BusinessSales = lazy(() => import("./pages/business/BusinessSales"));
const BusinessInventory = lazy(() => import("./pages/business/BusinessInventory"));
const BusinessCustomers = lazy(() => import("./pages/business/BusinessCustomers"));
const BusinessNetwork = lazy(() => import("./pages/business/BusinessNetwork"));
const BusinessMarketing = lazy(() => import("./pages/business/BusinessMarketing"));
const BusinessCRM = lazy(() => import("./pages/business/BusinessCRM"));
const BusinessGoals = lazy(() => import("./pages/business/BusinessGoals"));
const BusinessReports = lazy(() => import("./pages/business/BusinessReports"));
const BusinessExpansionHub = lazy(() => import("./pages/business/BusinessExpansionHub"));
const BusinessQREngine = lazy(() => import("./pages/business/BusinessQREngine"));
const BusinessPitchBuilder = lazy(() => import("./pages/business/BusinessPitchBuilder"));
const BusinessTeam = lazy(() => import("./pages/business/BusinessTeam"));

// Sovereign Manager Portal
const SovereignLayout = lazy(() => import("./pages/sovereign/SovereignLayout"));
const SovereignManagerPage = lazy(() => import("./pages/sovereign/SovereignManagerPage"));
const GrowthVaultPage = lazy(() => import("./pages/sovereign/GrowthVaultPage"));
const ScentStationPage = lazy(() => import("./pages/sovereign/ScentStationPage"));
const NetworkTreePage = lazy(() => import("./pages/sovereign/NetworkTreePage"));
const AIConsiglierePage = lazy(() => import("./pages/sovereign/AIConsiglierePage"));
const InactivityAuctionPage = lazy(() => import("./pages/sovereign/InactivityAuctionPage"));

const queryClient = new QueryClient();

const Loader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const isPublicPath = (pathname: string) => {
  return pathname === "/auth" || pathname === "/auth/confirm" || pathname === "/landing" || pathname === "/reset-password";
};

const AuthRouteGuard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!user && !isPublicPath(location.pathname)) {
    const redirectTarget = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?redirect=${encodeURIComponent(redirectTarget)}`} replace />;
  }

  if (user && location.pathname === "/auth") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const AuthStateRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        navigate("/dashboard", { replace: true });
      }

      if (event === "SIGNED_OUT") {
        navigate("/auth", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

const AppContent = () => {
  useCartSync();

  return (
    <Suspense fallback={<Loader />}>
      <AuthStateRedirectHandler />
      <Routes>
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="/landing" element={<GatewayPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/confirm" element={<AuthEmailConfirmationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<AuthRouteGuard />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/catalog" element={<PerfumeCatalogPage />} />
          <Route path="/scent-quiz" element={<ScentQuizPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />

          <Route path="/gateway" element={<GatewayPage />} />
          <Route path="/home" element={<Index />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/worlds" element={<WorldsPage />} />
          <Route path="/worlds/:worldId" element={<WorldDetailPage />} />
          <Route path="/lab" element={<ScentLabPage />} />
          <Route path="/formulation" element={<FormulationLabPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/dna" element={<ScentDNAPage />} />
          <Route path="/gifting" element={<GiftingPage />} />
          <Route path="/gift/:shareCode" element={<GiftRevealPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/product/:handle" element={<ProductPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/access" element={<ExclusiveAccessPage />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/affiliate" element={<AffiliatePage />} />
          <Route path="/game" element={<PerfumerGamePage />} />
          <Route path="/network" element={<ReferralNetworkPage />} />
          <Route path="/partner-program" element={<PartnerProgramPage />} />
          <Route path="/affiliate-signup" element={<AffiliateSignupPage />} />
          <Route path="/affiliate-starter-pack" element={<AffiliateStarterPackPage />} />
          <Route path="/affiliate/:slug" element={<AffiliateLanding />} />
          <Route path="/affiliate/:slug/welcome" element={<AffiliateWelcome />} />
          <Route path="/affiliate/:slug/dashboard" element={<AffiliateDashboardPage />} />
          <Route path="/affiliate/onboard" element={<AffiliateOnboardPage />} />
          <Route path="/r/:slug" element={<AffiliateLanding />} />
          <Route path="/r/:slug/:campaign" element={<AffiliateLanding />} />
          <Route path="/creator-portal" element={<CreatorPortalPage />} />
          <Route path="/seo-generator" element={<SEOPageGeneratorPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/ai" element={<AIPage />} />

          {/* Admin Back Office */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="ingredients" element={<IngredientsManager />} />
            <Route path="interactions" element={<InteractionsManager />} />
            <Route path="formulas" element={<FormulasManager />} />
            <Route path="ifra" element={<IFRARulesManager />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="partners" element={<PartnerManager />} />
            <Route path="employees" element={<EmployeeManager />} />
            <Route path="pyramid" element={<PyramidManager />} />
            <Route path="affiliates" element={<AffiliateAdminPage />} />
            <Route path="onboarding" element={<EmployeeOnboardingPage />} />
          </Route>

          {/* Super Admin */}
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="customers" element={<SACustomersPage />} />
            <Route path="agents" element={<SAAgentsPage />} />
            <Route path="audit-logs" element={<SAAuditLogsPage />} />
            <Route path="security-events" element={<SASecurityEventsPage />} />
            <Route path="system-settings" element={<SASystemSettingsPage />} />
            <Route path="analytics/pyramid-builder" element={<SAPyramidBuilderPage />} />
            <Route path="employee-requests" element={<SAEmployeeRequestsPage />} />
            <Route path="database" element={<SADatabaseExplorerPage />} />
            <Route path="storage" element={<SAStorageManagerPage />} />
            <Route path="permissions" element={<SAPermissionsPage />} />
            <Route path="referrals" element={<SAReferralManagementPage />} />
            <Route path="auction" element={<InactivityAuctionPage />} />
          </Route>

          {/* Business Portal */}
          <Route path="/my-business" element={<BusinessLayout />}>
            <Route index element={<BusinessDashboard />} />
            <Route path="crm" element={<BusinessCRM />} />
            <Route path="sales" element={<BusinessSales />} />
            <Route path="inventory" element={<BusinessInventory />} />
            <Route path="customers" element={<BusinessCustomers />} />
            <Route path="network" element={<BusinessNetwork />} />
            <Route path="marketing" element={<BusinessMarketing />} />
            <Route path="goals" element={<BusinessGoals />} />
            <Route path="reports" element={<BusinessReports />} />
            <Route path="expansion" element={<BusinessExpansionHub />} />
            <Route path="qr-engine" element={<BusinessQREngine />} />
            <Route path="pitch-builder" element={<BusinessPitchBuilder />} />
            <Route path="team" element={<BusinessTeam />} />
          </Route>

          {/* Sovereign Manager Portal */}
          <Route path="/sovereign" element={<SovereignLayout />}>
            <Route index element={<SovereignManagerPage />} />
            <Route path="vault" element={<GrowthVaultPage />} />
            <Route path="stations" element={<ScentStationPage />} />
            <Route path="tree" element={<NetworkTreePage />} />
            <Route path="ai" element={<AIConsiglierePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <GrokChatWidget />
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
