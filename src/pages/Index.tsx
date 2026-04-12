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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Wematech Africa | AI-Powered Banking Technology Solutions in Africa</title>
        <meta name="description" content="Wematech Africa delivers AI-first banking technology solutions across Africa — core banking transformation, digital lending, mobile money infrastructure, fraud detection, RegTech, and open banking APIs." />
        <link rel="canonical" href="https://www.wematech.in/" />
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
    </div>
  );
};

export default Index;
