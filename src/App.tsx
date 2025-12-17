import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InterviewRoom from "./components/InterviewRoom";

const queryClient = new QueryClient();

// Wrapper to pass location state to InterviewRoom
const InterviewPage = () => {
  const location = useLocation();
  const state = location.state as {
    userName: string;
    jobTitle: string;
    yearsExperience: number;
    competencies: string[]
  } | null;

  if (!state?.userName) {
    return <Navigate to="/" replace />;
  }

  return (
    <InterviewRoom
      userName={state.userName}
      jobTitle={state.jobTitle}
      yearsExperience={state.yearsExperience}
      competencies={state.competencies}
    />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/interview" element={<InterviewPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
