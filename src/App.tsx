import { useEffect, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SellQoCartProvider } from "@/integrations/sellqo/CartContext";
import { productsAPI, collectionsAPI, settingsAPI, pagesAPI } from "@/integrations/sellqo/api";
import { sellqoKeys } from "@/integrations/sellqo/hooks";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";

// Lazy-loaded routes
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Story = lazy(() => import("./pages/Story"));
const Comic = lazy(() => import("./pages/Comic"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const Contact = lazy(() => import("./pages/Contact"));
const Bedankt = lazy(() => import("./pages/Bedankt"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

function AppPrefetcher() {
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: sellqoKeys.products.list({}),
      queryFn: () => productsAPI.getAll({}),
    });
    queryClient.prefetchQuery({
      queryKey: sellqoKeys.collections.all,
      queryFn: () => collectionsAPI.getAll(),
    });
    queryClient.prefetchQuery({
      queryKey: sellqoKeys.settings.all,
      queryFn: () => settingsAPI.getAll(),
    });
    queryClient.prefetchQuery({
      queryKey: sellqoKeys.pages.legal,
      queryFn: () => pagesAPI.getLegal(),
    });
  }, []);
  return null;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <SellQoCartProvider>
        <TooltipProvider>
          <AppPrefetcher />
          <ScrollToTop />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <CartDrawer />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:slug" element={<ProductDetail />} />
                <Route path="/ons-verhaal" element={<Story />} />
                <Route path="/de-strip" element={<Comic />} />
                <Route path="/maatgids" element={<SizeGuide />} />
                <Route path="/cadeaubon" element={<Navigate to="/shop/cadeaukaart" replace />} />
                <Route path="/bedankt" element={<Bedankt />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Footer />
            <CookieBanner />
          </BrowserRouter>
        </TooltipProvider>
      </SellQoCartProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
