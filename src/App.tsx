import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SellQoCartProvider } from "@/integrations/sellqo/CartContext";
import { productsAPI, collectionsAPI } from "@/integrations/sellqo/api";
import { sellqoKeys } from "@/integrations/sellqo/hooks";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Story from "./pages/Story";
import Comic from "./pages/Comic";
import SizeGuide from "./pages/SizeGuide";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

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
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <SellQoCartProvider>
        <TooltipProvider>
          <AppPrefetcher />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:slug" element={<ProductDetail />} />
              <Route path="/ons-verhaal" element={<Story />} />
              <Route path="/de-strip" element={<Comic />} />
              <Route path="/maatgids" element={<SizeGuide />} />
              <Route path="/cadeaubon" element={<Navigate to="/shop/cadeaukaart" replace />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
            <CookieBanner />
          </BrowserRouter>
        </TooltipProvider>
      </SellQoCartProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
