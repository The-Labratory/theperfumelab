import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import ProtectedRoute from "@/components/ProtectedRoute";

// ── Lazy-load every page for code splitting ──────────────────────────────────
const Index              = lazy(() => import("./pages/Index"));
const OnboardingPage     = lazy(() => import("./pages/OnboardingPage"));
const WorldsPage         = lazy(() => import("./pages/WorldsPage"));
const ScentLabPage       = lazy(() => import("./pages/ScentLabPage"));
const StorePage          = lazy(() => import("./pages/StorePage"));
const ProductPage        = lazy(() => import("./pages/ProductPage"));
const WorldDetailPage    = lazy(() => import("./pages/WorldDetailPage"));
const CollectionPage     = lazy(() => import("./pages/CollectionPage"));
const ScentDNAPage       = lazy(() => import("./pages/ScentDNAPage"));
const GiftingPage        = lazy(() => import("./pages/GiftingPage"));
const GiftRevealPage     = lazy(() => import("./pages/GiftRevealPage"));
const InstallPage        = lazy(() => import("./pages/InstallPage"));
const PartnerPage        = lazy(() => import("./pages/PartnerPage"));
const ExclusiveAccessPage = lazy(() => import("./pages/ExclusiveAccessPage"));
const LaunchPage         = lazy(() => import("./pages/LaunchPage"));
const SharePage          = lazy(() => import("./pages/SharePage"));
const MilestonesPage     = lazy(() => import("./pages/MilestonesPage"));
const AuthPage           = lazy(() => import("./pages/AuthPage"));
const AdminPage          = lazy(() => import("./pages/AdminPage"));
const SuperAdminPage     = lazy(() => import("./pages/SuperAdminPage"));
const NotFound           = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <p className="text-muted-foreground text-sm font-body animate-pulse">Loading…</p>
  </div>
);

const AppContent = () => {
  useCartSync();
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* ── Public routes ─────────────────────────────────────────────── */}
        <Route path="/"                   element={<Index />} />
        <Route path="/onboarding"         element={<OnboardingPage />} />
        <Route path="/worlds"             element={<WorldsPage />} />
        <Route path="/worlds/:worldId"    element={<WorldDetailPage />} />
        <Route path="/lab"                element={<ScentLabPage />} />
        <Route path="/collection"         element={<CollectionPage />} />
        <Route path="/dna"                element={<ScentDNAPage />} />
        <Route path="/gifting"            element={<GiftingPage />} />
        <Route path="/gift/:shareCode"    element={<GiftRevealPage />} />
        <Route path="/store"              element={<StorePage />} />
        <Route path="/product/:handle"    element={<ProductPage />} />
        <Route path="/install"            element={<InstallPage />} />
        <Route path="/access"             element={<ExclusiveAccessPage />} />
        <Route path="/launch"             element={<LaunchPage />} />
        <Route path="/share"              element={<SharePage />} />
        <Route path="/partner"            element={<PartnerPage />} />
        <Route path="/milestones"         element={<MilestonesPage />} />

        {/* ── Auth ──────────────────────────────────────────────────────── */}
        <Route path="/auth"               element={<AuthPage />} />

        {/* ── Admin (requires admin or superadmin role) ──────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* ── Super Admin (requires superadmin role) ─────────────────────── */}
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperAdminPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
