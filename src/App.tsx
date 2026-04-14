import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoAccessProvider } from "@/contexts/DemoAccessContext";
import Index from "./pages/Index.tsx";
import Solutions from "./pages/Solutions.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import SEOWarRoom from "./pages/SEOWarRoom.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost_AICoreBankingNigeria from "./pages/BlogPost_AICoreBankingNigeria.tsx";
import BlogPost_MobileMoneyKenya from "./pages/BlogPost_MobileMoneyKenya.tsx";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoAccessProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/ai-transforming-core-banking-nigeria" element={<BlogPost_AICoreBankingNigeria />} />
            <Route path="/blog/mobile-money-financial-inclusion-kenya" element={<BlogPost_MobileMoneyKenya />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </DemoAccessProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
