import { useState } from "react";
import { Briefcase, Layers, Plus, ChevronRight, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const competencies = [
  "Algorithms & Data Structures",
  "Cloud Infrastructure (AWS/GCP)",
  "Database Design (SQL/NoSQL)",
  "DevOps & CI/CD",
  "Distributed Systems",
  "Machine Learning",
  "Microservices",
  "Neural Networks",
  "Node.js & Backend Systems",
  "Python",
  "React & Frontend Architecture",
  "System Design",
];

interface InterviewSetupProps {
  id?: string;
}

const InterviewSetup = ({ id }: InterviewSetupProps) => {
  const [userName, setUserName] = useState("");
  const [jobTitle, setJobTitle] = useState("Data Engineer");
  const [yearsExperience, setYearsExperience] = useState([1]);
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [customCompetency, setCustomCompetency] = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const isFormValid = userName.trim().length > 0 && jobTitle.trim().length > 0;

  const handleStartInterview = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    // Switch to JSON with text/plain to avoid CORS preflight issues
    // This is the most robust way to send data to GAS from client-side
    // Match keys exactly to what the Google Apps Script expects
    const data = {
      fullName: userName,
      jobTitle: jobTitle,
      yearsOfExperience: yearsExperience[0],
      // Note: The Provided GAS script doesn't save competencies, only the 3 fields above + timestamp
      competencies: selectedCompetencies,
      interviewType: interviewType,
    };

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbyj_L3mC9JbpZnrLeiiieHy5Am_31NvQv72kUpVUg_t9m85SoD2o-yvRp4UTow_aAiRGA/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "text/plain", // Crucial: avoids OPTIONS preflight
          },
          body: JSON.stringify(data),
        }
      );

      toast.success("Profile saved successfully!");
      console.log("Starting interview for:", data);

      // Navigate to interview room with state
      navigate("/interview", {
        state: {
          userName,
          jobTitle,
          yearsExperience: yearsExperience[0],
          competencies: selectedCompetencies,
          interviewType
        }
      });

    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile, but continuing...");
      // Even if GAS fails, we might want to let them interview?
      navigate("/interview", { state: { userName } });
    } finally {
      setIsSubmitting(false);
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

        {/* Identity Section - Full Width */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Candidate Identity</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6 mb-6">

          {/* Top Row: Target Role & Experience Level */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Target Role Card */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm h-full">
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
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm h-full">
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

          {/* Interview Type Selection */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Interview Mode</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: "technical", label: "Technical Round", desc: "Deep dive into coding & architecture" },
                { id: "hr", label: "HR Screening", desc: "Culture fit, salary & logistics" },
                { id: "behavioral", label: "Behavioral", desc: "STAR method & soft skills" }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setInterviewType(type.id)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left",
                    interviewType === type.id
                      ? "bg-primary/5 border-primary ring-1 ring-primary"
                      : "bg-background border-border hover:border-primary/50"
                  )}
                >
                  <span className={cn("font-semibold mb-1", interviewType === type.id ? "text-primary" : "text-foreground")}>
                    {type.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {type.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Core Competencies (Full Width) */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm w-full">
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
            disabled={!isFormValid || isSubmitting}
            className="w-full max-w-md bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Start Interview
                <ChevronRight className="w-5 h-5" />
              </>
            )}
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
