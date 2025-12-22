import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Download, RotateCcw, LineChart, Brain, Code2, Calendar, User, Briefcase, Hash, Home } from "lucide-react";

export default function ReportPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const evaluation = location.state?.evaluation;
    const timedOut = location.state?.timedOut;

    // --- MOCK/DERIVED DATA ---
    // In a real app, these would come from the backend or context
    const candidateName = location.state?.candidateName || "Candidate";
    const position = location.state?.jobTitle || "Software Engineer";
    const interviewDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const reportId = `SI-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;

    // Fallback/Derived Scores
    const overallScore = evaluation?.score || 0;
    // Use backend values if available, otherwise 0. No randomizer.
    const technicalScore = evaluation?.technical_score || 0;
    const problemSolvingScore = evaluation?.problem_solving_score || 0;

    if (!evaluation) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-4">
                <Card className="max-w-md w-full shadow-lg border-slate-200">
                    <CardContent className="text-center p-8 space-y-6">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            {timedOut ? (
                                <RotateCcw className="w-8 h-8 text-amber-500" />
                            ) : (
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">
                                {timedOut ? "Analysis Timeout" : "Generating Report..."}
                            </h2>
                            <p className="text-slate-600">
                                {timedOut
                                    ? "The assessment is taking longer than expected. Please check your dashboard later."
                                    : "Our AI is analyzing your responses and generating a comprehensive feedback report."}
                            </p>
                        </div>
                        {timedOut && (
                            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                                Return Home
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* --- HEADER SECTION --- */}
                <div className="bg-blue-600 rounded-t-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                                Mock Interview Assessment Report
                            </h1>
                            <p className="text-blue-100 text-lg opacity-90">
                                Comprehensive evaluation of technical skills and competencies
                            </p>
                        </div>
                    </div>
                    {/* Decorative Background Element */}
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                </div>

                {/* --- INFO BAR --- */}
                <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-6 -mt-6 flex flex-wrap gap-y-4 justify-between items-center text-sm text-gray-600">
                    <div className="flex gap-8 flex-wrap">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-blue-500" /> Candidate:
                            </span>
                            <span className="pl-6 text-blue-600 font-medium">{candidateName}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-blue-500" /> Interview Date:
                            </span>
                            <span className="pl-6">{interviewDate}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-blue-500" /> Position:
                            </span>
                            <span className="pl-6">{position}</span>
                        </div>
                    </div>
                </div>

                {/* --- EXECUTIVE SUMMARY --- */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <LineChart className="w-6 h-6 text-blue-600" />
                            Executive Summary
                        </h3>
                        <p className="text-gray-600 leading-relaxed mb-8">
                            The candidate demonstrated a {evaluation.score >= 7 ? "strong" : "moderate"} background suitable for the role.
                            Based on the technical assessment, the hiring recommendation is <strong>{evaluation.decision}</strong>.
                            They showed particular strength in {evaluation.strengths?.[0]?.toLowerCase() || "technical tasks"}
                            but may require further development in {evaluation.improvements?.[0]?.toLowerCase() || "specific areas"}.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Overall Score */}
                            <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-100 text-blue-900">
                                <div className="text-5xl font-extrabold text-blue-600 mb-1">
                                    {Math.round(overallScore * 10)}%
                                </div>
                                <div className="text-sm font-semibold uppercase tracking-wide opacity-70">
                                    Overall Score
                                </div>
                            </div>

                            {/* Technical Aptitude */}
                            <div className="bg-emerald-50 rounded-xl p-6 text-center border border-emerald-100 text-emerald-900">
                                <div className="text-5xl font-extrabold text-emerald-600 mb-1">
                                    {Math.round(technicalScore / 2)}<span className="text-2xl text-emerald-400">/5</span>
                                </div>
                                <div className="text-sm font-semibold uppercase tracking-wide opacity-70">
                                    Technical Aptitude
                                </div>
                            </div>

                            {/* Problem Solving */}
                            <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-100 text-amber-900">
                                <div className="text-5xl font-extrabold text-amber-500 mb-1">
                                    {Math.round(problemSolvingScore)}<span className="text-2xl text-amber-300">/10</span>
                                </div>
                                <div className="text-sm font-semibold uppercase tracking-wide opacity-70">
                                    Problem Solving
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- TECHNICAL ASSESSMENT --- */}
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-8">Technical Assessment</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Strengths */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-emerald-700 mb-4 uppercase text-sm tracking-wider">
                                    <CheckCircle2 className="w-5 h-5" /> Strengths
                                </h4>
                                <ul className="space-y-4">
                                    {evaluation.strengths.map((str: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-gray-700">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="leading-snug">{str}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-red-700 mb-4 uppercase text-sm tracking-wider">
                                    <XCircle className="w-5 h-5" /> Areas for Improvement
                                </h4>
                                <ul className="space-y-4">
                                    {evaluation.improvements.map((imp: string, i: number) => (
                                        <li key={i} className="flex gap-3 text-gray-700">
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                            <span className="leading-snug">{imp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- QUESTION BREAKDOWN (Hidden/Subtle per design, or added as secondary) --- */}
                {evaluation.question_breakdown && evaluation.question_breakdown.length > 0 && (
                    <Card className="border-none shadow-sm bg-white">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Code2 className="w-6 h-6 text-indigo-500" /> Detailed Question Analysis
                            </h3>
                            <div className="space-y-3">
                                {evaluation.question_breakdown.map((item: any, i: number) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-900">{item.question}</span>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                                                item.status === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-gray-200'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-0">{item.feedback}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}


                {/* --- FOOTER BUTTONS --- */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 pb-12">
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => navigate("/")}
                        className="bg-white hover:bg-gray-50 text-gray-700 shadow-sm rounded-lg px-8 font-semibold gap-2 border border-gray-200"
                    >
                        <Home className="w-4 h-4" /> Home
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => navigate("/")}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg px-8 font-semibold gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Retake Interview
                    </Button>

                    <Button
                        size="lg"
                        variant="default"
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-lg px-8 font-semibold gap-2"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </Button>
                </div>

            </div>
        </div>
    );
}
