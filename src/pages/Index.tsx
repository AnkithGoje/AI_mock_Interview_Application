import { useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InterviewSetup from "@/components/InterviewSetup";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const setupRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <HeroSection />

        <div ref={setupRef}>
          <InterviewSetup />
        </div>

        <FeaturesSection />

        <CTASection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
