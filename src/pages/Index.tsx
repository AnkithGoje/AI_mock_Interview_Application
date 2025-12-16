import { useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InterviewSetup from "@/components/InterviewSetup";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const setupRef = useRef<HTMLDivElement>(null);

  const scrollToSetup = () => {
    setupRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onStartClick={scrollToSetup} />
      
      <main>
        <HeroSection onStartClick={scrollToSetup} />
        
        <div ref={setupRef}>
          <InterviewSetup />
        </div>
        
        <FeaturesSection />
        
        <CTASection onStartClick={scrollToSetup} />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
