import { useState } from "react";
import { Check, ChevronDown, Briefcase, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const jobRoles = [
  "AI/ML Engineer",
  "Data Analyst",
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Product Manager",
  "DevOps Engineer",
  "Cloud Architect",
  "Data Scientist",
  "UX Designer",
  "Cybersecurity Analyst",
];

const experienceLevels = [
  { id: "fresher", label: "Fresher", description: "0-1 years" },
  { id: "junior", label: "Junior", description: "1-2 years" },
  { id: "mid", label: "Mid-Level", description: "3-5 years" },
  { id: "senior", label: "Senior", description: "5+ years" },
];

interface InterviewSetupProps {
  id?: string;
}

const InterviewSetup = ({ id }: InterviewSetupProps) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const displayRole = customRole || selectedRole;
  const isFormValid = displayRole && selectedExperience;

  const handleStartInterview = () => {
    if (isFormValid) {
      console.log("Starting interview:", { role: displayRole, experience: selectedExperience });
      // Here you would navigate to the interview page
    }
  };

  return (
    <section id={id} className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Configure Your Interview</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Select your target role and experience level to get personalized interview questions.
          </p>
        </div>

        {/* Setup Card */}
        <div className="glass rounded-2xl p-8 md:p-12 glow-primary">
          <div className="space-y-10">
            {/* Role Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-lg font-medium text-foreground">
                <Briefcase className="w-5 h-5 text-primary" />
                Target Job Role
              </label>
              
              {/* Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-4 rounded-xl border bg-secondary/50 transition-all duration-300",
                    isDropdownOpen ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
                    displayRole && "border-primary/50"
                  )}
                >
                  <span className={displayRole ? "text-foreground" : "text-muted-foreground"}>
                    {displayRole || "Select a role..."}
                  </span>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform duration-300",
                    isDropdownOpen && "rotate-180"
                  )} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 py-2 rounded-xl border border-border bg-popover shadow-xl shadow-background/50 max-h-64 overflow-y-auto animate-scale-in">
                    {jobRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setCustomRole("");
                          setIsDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 text-left transition-colors",
                          selectedRole === role ? "bg-primary/10 text-primary" : "hover:bg-secondary text-foreground"
                        )}
                      >
                        {role}
                        {selectedRole === role && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Role Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Or enter a custom role..."
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value);
                    if (e.target.value) setSelectedRole("");
                  }}
                  className="w-full px-4 py-4 rounded-xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                />
              </div>
            </div>

            {/* Experience Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-lg font-medium text-foreground">
                <Target className="w-5 h-5 text-primary" />
                Experience Level
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedExperience(level.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300",
                      selectedExperience === level.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-secondary"
                    )}
                  >
                    {selectedExperience === level.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className={cn(
                      "font-semibold",
                      selectedExperience === level.id ? "text-primary" : "text-foreground"
                    )}>
                      {level.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                variant="glow"
                size="xl"
                className="w-full"
                disabled={!isFormValid}
                onClick={handleStartInterview}
              >
                {isFormValid ? (
                  <>Begin Interview Simulation</>
                ) : (
                  <>Select role and experience to continue</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewSetup;
