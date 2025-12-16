import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onStartClick: () => void;
}

const CTASection = ({ onStartClick }: CTASectionProps) => {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto max-w-3xl relative z-10 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-8 animate-float">
          <Rocket className="w-8 h-8 text-primary" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Your Interview Practice{" "}
          <span className="gradient-text">Starts Here</span>
        </h2>

        {/* Supporting Text */}
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Don't leave your next opportunity to chance. Prepare with confidence 
          and walk into your interview ready to impress.
        </p>

        {/* CTA Button */}
        <Button 
          variant="hero" 
          size="xl" 
          onClick={onStartClick}
          className="group"
        >
          Launch Interview Simulator
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Trust Indicator */}
        <p className="text-sm text-muted-foreground mt-8">
          Free to start • No credit card required • Instant access
        </p>
      </div>
    </section>
  );
};

export default CTASection;
