import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Levels from "@/components/Levels";
import Maintenance from "@/components/Maintenance";
import ForRealEstate from "@/components/ForRealEstate";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Levels />
      <Maintenance />
      <ForRealEstate />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
