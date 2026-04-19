import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import IntentPulse from "@/components/IntentPulse";
import SilentQualifier from "@/components/SilentQualifier";
import CornerOracle from "@/components/CornerOracle";

const StatsSection = lazy(() => import("@/components/StatsSection"));
const MicroSaaSShowcase = lazy(() => import("@/components/MicroSaaSShowcase"));
const SolutionsOverview = lazy(() => import("@/components/SolutionsOverview"));
const WhyWematech = lazy(() => import("@/components/WhyWematech"));
const SEOContentBlock = lazy(() => import("@/components/SEOContentBlock"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>Wematech Africa | AI-Powered Banking Technology Solutions in Africa</title>
        <meta name="description" content="Wematech Africa delivers AI-first banking technology solutions across Africa — core banking transformation, digital lending, mobile money infrastructure, fraud detection, RegTech, and open banking APIs." />
        <link rel="canonical" href="https://wematech.africa/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wematech.africa/" />
        <meta property="og:title" content="Wematech Africa — AI-Powered Banking Tech Solutions for Africa" />
        <meta property="og:description" content="Africa's leading AI-first banking technology company. We power digital banking transformation for banks, fintechs, and microfinance institutions across 54 African markets." />
        <meta property="og:image" content="https://wematech.africa/og-image.jpg" />
      </Helmet>
      <Navbar />
      <HeroSection />
      <Suspense fallback={null}>
        <StatsSection />
        <MicroSaaSShowcase />
        <SolutionsOverview />
        <WhyWematech />
        <SEOContentBlock />
        <FAQSection />
        <CTASection />
        <Footer />
        <IntentPulse />
        <SilentQualifier />
        <CornerOracle />
      </Suspense>
    </div>
  );
};

export default Index;
