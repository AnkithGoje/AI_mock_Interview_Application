import { Target, Layers, Monitor, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Target,
    title: "Role-Specific Questions",
    description: "Get questions tailored to your exact target role, from technical skills to domain knowledge.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Layers,
    title: "Experience-Based Difficulty",
    description: "Questions adapt to your experience level—fresher to senior—ensuring relevant challenge.",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: Monitor,
    title: "Real Interview Simulation",
    description: "Experience authentic interview scenarios with timed responses and professional formats.",
    gradient: "from-primary/20 to-accent/10",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Receive immediate, actionable feedback to improve your answers and boost confidence.",
    gradient: "from-accent/20 to-primary/10",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="gradient-text">This Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Our platform is designed to give you the most realistic and effective interview preparation experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative p-8 rounded-2xl glass glass-hover cursor-default",
                "animate-fade-in-up opacity-0"
              )}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                feature.gradient
              )} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
