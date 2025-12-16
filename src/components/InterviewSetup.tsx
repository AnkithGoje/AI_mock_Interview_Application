import { useState } from "react";
import { Briefcase, Layers, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const competencies = [
  "System Design",
  "Algorithms",
  "React",
  "Node.js",
  "Leadership",
  "Conflict Resolution",
  "Communication",
  "Code Quality",
];

interface InterviewSetupProps {
  id?: string;
}

const InterviewSetup = ({ id }: InterviewSetupProps) => {
  const [jobTitle, setJobTitle] = useState("Data Engineer");
  const [yearsExperience, setYearsExperience] = useState([1]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [customCompetency, setCustomCompetency] = useState("");

  const toggleCompetency = (competency: string) => {
    setSelectedCompetencies((prev) =>
      prev.includes(competency)
        ? prev.filter((c) => c !== competency)
        : [...prev, competency]
    );
  };

  const addCustomCompetency = () => {
    if (customCompetency.trim() && !selectedCompetencies.includes(customCompetency.trim())) {
      setSelectedCompetencies((prev) => [...prev, customCompetency.trim()]);
      setCustomCompetency("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomCompetency();
    }
  };

  const isFormValid = jobTitle.trim().length > 0;

  const handleStartInterview = () => {
    if (isFormValid) {
      console.log("Starting interview:", {
        jobTitle,
        yearsExperience: yearsExperience[0],
        competencies: selectedCompetencies,
      });
    }
  };

  return (
    <section id={id} className="py-24 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground text-lg">
            Configure the AI persona and interview context.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Target Role Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Target Role</h3>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Enter job title..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            {/* Experience Level Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Experience Level</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Years of Experience</label>
                  <span className="text-sm font-semibold text-primary">
                    {yearsExperience[0]} years
                  </span>
                </div>

                <Slider
                  value={yearsExperience}
                  onValueChange={setYearsExperience}
                  max={15}
                  min={0}
                  step={1}
                  className="w-full"
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Junior (0)</span>
                  <span>Principal (15)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Core Competencies */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm h-fit">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">Core Competencies</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Select or add focus areas for this session.
            </p>

            {/* Competency Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {competencies.map((competency) => (
                <button
                  key={competency}
                  onClick={() => toggleCompetency(competency)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                    selectedCompetencies.includes(competency)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:border-primary/50"
                  )}
                >
                  {competency}
                </button>
              ))}
            </div>

            {/* Custom Competency Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customCompetency}
                onChange={(e) => setCustomCompetency(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add custom competency..."
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
              <button
                onClick={addCustomCompetency}
                disabled={!customCompetency.trim()}
                className="w-12 h-12 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="flex flex-col items-center">
          <Button
            onClick={handleStartInterview}
            disabled={!isFormValid}
            className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
          >
            Start Interview
            <ChevronRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            By starting, you agree to the session recording policy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InterviewSetup;
