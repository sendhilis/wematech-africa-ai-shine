import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SolutionsOverview from "@/components/SolutionsOverview";
import StatsSection from "@/components/StatsSection";
import WhyWematech from "@/components/WhyWematech";
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
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
