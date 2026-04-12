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
