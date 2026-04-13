import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SolutionsOverview from "@/components/SolutionsOverview";
import StatsSection from "@/components/StatsSection";
import WhyWematech from "@/components/WhyWematech";
import FAQSection from "@/components/FAQSection";
import SEOContentBlock from "@/components/SEOContentBlock";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import IntentPulse from "@/components/IntentPulse";
import SilentQualifier from "@/components/SilentQualifier";
import CornerOracle from "@/components/CornerOracle";

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
      <StatsSection />
      <SolutionsOverview />
      <WhyWematech />
      <SEOContentBlock />
      <FAQSection />
      <CTASection />
      <Footer />
      <IntentPulse />
      <SilentQualifier />
      <CornerOracle />
    </div>
  );
};

export default Index;
