import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoAccessProvider } from "@/contexts/DemoAccessContext";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";
import Index from "./pages/Index.tsx";

// Lazy-load all non-homepage routes to reduce initial bundle
const Solutions = lazy(() => import("./pages/Solutions.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const BlogPost_AICoreBankingNigeria = lazy(() => import("./pages/BlogPost_AICoreBankingNigeria.tsx"));
const BlogPost_MobileMoneyKenya = lazy(() => import("./pages/BlogPost_MobileMoneyKenya.tsx"));
const BlogPost_DigitalLendingAfrica = lazy(() => import("./pages/BlogPost_DigitalLendingAfrica.tsx"));
const BlogPost_BankingTechnologyNigeria = lazy(() => import("./pages/BlogPost_BankingTechnologyNigeria.tsx"));
const BlogPost_BankingTechnologyKenya = lazy(() => import("./pages/BlogPost_BankingTechnologyKenya.tsx"));
const BlogPost_BankingTechnologySouthAfrica = lazy(() => import("./pages/BlogPost_BankingTechnologySouthAfrica.tsx"));
const BlogPost_BestBankingTechnologyVendorAfrica2026 = lazy(() => import("./pages/BlogPost_BestBankingTechnologyVendorAfrica2026.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const SEOWarRoom = lazy(() => import("./pages/SEOWarRoom.tsx"));
const MicroSaaSCatalogue = lazy(() => import("./pages/MicroSaaSCatalogue.tsx"));
const MicroSaaSProductPage = lazy(() => import("./pages/MicroSaaSProductPage.tsx"));
const ComplianceAlertApp = lazy(() => import("./pages/ComplianceAlertApp.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DemoAccessProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/solutions" element={<Solutions />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/ai-transforming-core-banking-nigeria" element={<BlogPost_AICoreBankingNigeria />} />
                  <Route path="/blog/mobile-money-financial-inclusion-kenya" element={<BlogPost_MobileMoneyKenya />} />
                  <Route path="/blog/digital-lending-africa" element={<BlogPost_DigitalLendingAfrica />} />
                  <Route path="/blog/banking-technology-nigeria" element={<BlogPost_BankingTechnologyNigeria />} />
                  <Route path="/blog/banking-technology-kenya" element={<BlogPost_BankingTechnologyKenya />} />
                  <Route path="/blog/banking-technology-south-africa" element={<BlogPost_BankingTechnologySouthAfrica />} />
                  <Route path="/blog/best-banking-technology-vendor-africa-2026" element={<BlogPost_BestBankingTechnologyVendorAfrica2026 />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/seo-warroom" element={<SEOWarRoom />} />
                  <Route path="/microsaas" element={<MicroSaaSCatalogue />} />
                  <Route path="/microsaas/:slug" element={<MicroSaaSProductPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/microsaas/compliance-alert/app"
                    element={
                      <RequireAuth>
                        <ComplianceAlertApp />
                      </RequireAuth>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </DemoAccessProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

