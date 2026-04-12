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
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.wematech.in/" />
        <meta property="og:title" content="Wematech Africa — AI-Powered Banking Tech Solutions for Africa" />
        <meta property="og:description" content="Africa's leading AI-first banking technology company. We power digital banking transformation for banks, fintechs, and microfinance institutions across 54 African markets." />
        <meta property="og:image" content="https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/f7cf74b4-a501-4ba6-99fc-605ac5a3ae20/id-preview-e944887d--163e2fc3-2f9a-45c2-8325-972d3fd31fb6.lovable.app-1775979718401.png" />
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
