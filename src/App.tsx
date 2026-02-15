import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import Index from "./pages/Index";
import OnboardingPage from "./pages/OnboardingPage";
import WorldsPage from "./pages/WorldsPage";
import ScentLabPage from "./pages/ScentLabPage";
import StorePage from "./pages/StorePage";
import ProductPage from "./pages/ProductPage";
import WorldDetailPage from "./pages/WorldDetailPage";
import CollectionPage from "./pages/CollectionPage";
import ScentDNAPage from "./pages/ScentDNAPage";
import GiftingPage from "./pages/GiftingPage";
import GiftRevealPage from "./pages/GiftRevealPage";
import InstallPage from "./pages/InstallPage";
import PartnerPage from "./pages/PartnerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useCartSync();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/worlds" element={<WorldsPage />} />
      <Route path="/worlds/:worldId" element={<WorldDetailPage />} />
      <Route path="/lab" element={<ScentLabPage />} />
      <Route path="/collection" element={<CollectionPage />} />
      <Route path="/dna" element={<ScentDNAPage />} />
      <Route path="/gifting" element={<GiftingPage />} />
      <Route path="/gift/:shareCode" element={<GiftRevealPage />} />
      <Route path="/store" element={<StorePage />} />
      <Route path="/product/:handle" element={<ProductPage />} />
      <Route path="/install" element={<InstallPage />} />
      <Route path="/partner" element={<PartnerPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
