import {
    LiveKitRoom,
    RoomAudioRenderer,
    StartAudio,
    useConnectionState,
    ConnectionStateToast,
    useRoomContext,
    VideoTrack,
    useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { ConnectionState, RoomEvent, Track } from "livekit-client";
import {
    Loader2,
    Mic,
    MicOff,
    PhoneOff,
    Trophy,
    ListChecks,
    Target,
    AlertTriangle,
    Video,
    VideoOff,
    BrainCircuit,
    Code,
    AppWindow,
    Layout,
    Server,
    Network,
    Brain,
    Database,
    Cloud,
    Blocks,
    Share2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InterviewRoomProps {
    userName: string;
    jobTitle?: string;
    yearsExperience?: number;
    competencies?: string[];
}

export default function InterviewRoom({
    userName,
    jobTitle = "Software Engineer",
    yearsExperience = 0,
    competencies = []
}: InterviewRoomProps) {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                // Encode complex data as JSON strings or individual params?
                // Using individual params for simplicity but encoding competencies as comma-separated
                const params = new URLSearchParams({
                    identity: userName,
                    name: userName,
                    jobTitle: jobTitle,
                    yearsExperience: yearsExperience.toString(),
                    competencies: JSON.stringify(competencies)
                });

                const response = await fetch(
                    `http://localhost:5000/getToken?${params.toString()}`
                );
                const data = await response.json();
                if (data.token) {
                    setToken(data.token);
                } else {
                    setError("Failed to generate token");
                }
            } catch (e) {
                console.error(e);
                setError("Could not connect to token server. Is backend/server.py running?");
            }
        };
        if (userName) fetchToken();
    }, [userName]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => navigate("/")}>Go Back</Button>
            </div>
        );
    }

    if (token === "") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Connecting to Interview Room...</p>
                {/* Debug Info */}
                <div className="mt-8 p-4 bg-muted/50 rounded-lg text-xs font-mono text-left max-w-sm w-full mx-4">
                    <p className="font-semibold mb-2 opacity-50">CONNECTION DEBUG:</p>
                    <p>Backend URL: http://localhost:5000/getToken</p>
                    <p>User Identity: {userName}</p>
                    <p className="mt-2 text-destructive">{error || "Waiting for response..."}</p>
                </div>
            </div>
        );
    }

    // Fallback ID to unblock user if .env fails to load
    const liveKitUrl = import.meta.env.VITE_LIVEKIT_URL || "wss://conversation-agent-jhjf02do.livekit.cloud";

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={liveKitUrl}
            connect={true}
            data-lk-theme="default"
            className="min-h-screen flex flex-col bg-slate-50"
        >
            <InterviewSession userName={userName} liveKitUrl={liveKitUrl} token={token} competencies={competencies} />
        </LiveKitRoom>
    );
}

function InterviewSession({ userName, liveKitUrl, token, competencies }: { userName: string, liveKitUrl: string, token: string, competencies: string[] }) {
    const navigate = useNavigate();
    const room = useRoomContext();
    const [evaluation, setEvaluation] = useState<any>(null);
    const [isResultOpen, setIsResultOpen] = useState(false);
    const { localParticipant } = room;

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    );
    const localTrack = tracks.find(tr => tr.participant.isLocal);

    useEffect(() => {
        if (!room) return;

        const handleData = (payload: Uint8Array, participant: any) => {
            try {
                const strData = new TextDecoder().decode(payload);
                const jsonData = JSON.parse(strData);

                if (jsonData.type === "BIO_EVALUATION") {
                    console.log("Received Evaluation:", jsonData);
                    setEvaluation(jsonData);
                    setIsResultOpen(true);
                }
            } catch (e) {
                console.error("Failed to parse data packet:", e);
            }
        };

        room.on(RoomEvent.DataReceived, handleData);
        return () => {
            room.off(RoomEvent.DataReceived, handleData);
        };
    }, [room]);

    return (
        <div className="relative h-screen w-full bg-slate-100 flex flex-col p-6 overflow-hidden font-sans">
            {/* Gradient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Header / Status Bar */}
            <div className="relative z-10 w-full flex items-center justify-center mb-6">
                <RoomStatus />
            </div>

            {/* Main Content Layout */}
            <div className="relative flex-1 w-full h-full overflow-hidden">

                {/* AI Interviewer - Full Screen Background */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-0">
                    {/* Visualizer */}
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full animate-pulse scale-150" />

                        <div className="relative h-64 w-64 lg:h-80 lg:w-80 flex items-center justify-center">
                            {/* Rotating Dashed Ring 1 */}
                            <div className="absolute inset-0 rounded-full border border-dashed border-blue-300/30 animate-[spin_20s_linear_infinite]" />

                            {/* Rotating Dashed Ring 2 (Counter-Clockwise) */}
                            <div className="absolute inset-4 rounded-full border border-dashed border-purple-300/30 animate-[spin_15s_linear_infinite_reverse]" />

                            {/* Orbiting Dot 1 */}
                            <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 w-3 h-3 bg-blue-400 rounded-full blur-[1px] shadow-lg shadow-blue-400" />
                            </div>

                            {/* Orbiting Dot 2 */}
                            <div className="absolute inset-8 animate-[spin_12s_linear_infinite_reverse]">
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5 w-2 h-2 bg-purple-400 rounded-full blur-[1px] shadow-lg shadow-purple-400" />
                            </div>

                            {/* Inner Gradient Glow */}
                            <div className="absolute inset-12 rounded-full bg-gradient-to-tr from-blue-100/40 to-purple-100/40 blur-xl animate-pulse" />

                            {/* Central Circle */}
                            <div className="absolute inset-16 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-[0_0_40px_rgba(59,130,246,0.15)] z-10 transition-transform duration-500 hover:scale-110">
                                {competencies.some(c => c.includes("Frontend") || c.includes("React")) ? (
                                    <AppWindow className="w-20 h-20 text-blue-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("System Design")) ? (
                                    <Network className="w-20 h-20 text-blue-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("Machine Learning") || c.includes("Neural Networks") || c.includes("Python")) ? (
                                    <Brain className="w-20 h-20 text-pink-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("Database")) ? (
                                    <Database className="w-20 h-20 text-cyan-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("Node.js") || c.includes("Backend")) ? (
                                    <Server className="w-20 h-20 text-emerald-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("Cloud") || c.includes("DevOps")) ? (
                                    <Cloud className="w-20 h-20 text-orange-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("Algorithms") || c.includes("Data Structures")) ? (
                                    <Code className="w-20 h-20 text-violet-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("Microservices")) ? (
                                    <Blocks className="w-20 h-20 text-yellow-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : competencies.some(c => c.includes("Distributed")) ? (
                                    <Share2 className="w-20 h-20 text-indigo-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                ) : (
                                    <BrainCircuit className="w-20 h-20 text-blue-500 drop-shadow-md animate-[pulse_3s_ease-in-out_infinite]" />
                                )}
                            </div>

                            {/* Expanding Ripples */}
                            <div className="absolute inset-16 border-2 border-blue-400/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            <div className="absolute inset-16 border border-purple-400/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] delay-1000" />
                        </div>
                    </div>
                    <div className="mt-12 bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 shadow-sm">
                        <h2 className="text-xl font-light tracking-[0.2em] text-slate-700">AI INTERVIEWER</h2>
                    </div>
                </div>

                {/* User Video - Picture in Picture (Bottom Right) */}
                <div className="absolute bottom-8 right-8 w-80 aspect-video rounded-2xl shadow-2xl border-4 border-white overflow-hidden bg-zinc-900 z-30 transition-all hover:scale-105 duration-300 group">
                    {/* Label */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-white tracking-wider z-20 uppercase">
                        {userName || "YOU"}
                    </div>

                    {/* The Video Track */}
                    <div className="w-full h-full flex items-center justify-center relative">
                        {localTrack && (
                            <VideoTrack
                                trackRef={localTrack as any}
                                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                            />
                        )}

                        {/* Fallback if video is disabled/muted */}
                        {(!localTrack || (localParticipant && !localParticipant.isCameraEnabled)) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 z-10">
                                <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-500">
                                    <VideoOff className="w-8 h-8" />
                                </div>
                                <p className="absolute bottom-8 text-zinc-500 text-xs font-medium">Camera Off</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Bottom Controls Bar */}
            <div className="relative z-20 flex items-center justify-center gap-8 absolute bottom-8 left-0 right-0">
                <div className="flex items-center gap-6 px-8 py-4 bg-white/80 backdrop-blur-xl rounded-full border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/95 transition-all">
                    <MicButton />
                    <CameraButton />
                    <div className="h-8 w-px bg-slate-200" />
                    <Button
                        variant="destructive"
                        className="h-12 px-6 rounded-full shadow-lg bg-red-500 hover:bg-red-600 gap-2 font-medium"
                        onClick={() => navigate("/")}
                    >
                        <PhoneOff className="w-5 h-5" />
                        <span>Leave</span>
                    </Button>
                </div>
            </div>

            {/* Helper Components */}
            <RoomAudioRenderer />
            <StartAudio label="Click to allow audio playback" />
            <ConnectionStateToast />

            {/* Evaluation Results Modal */}
            <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Interview Evaluation
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Here is the detailed feedback from your AI Interviewer.
                        </DialogDescription>
                    </DialogHeader>
                    {evaluation && (
                        <ScrollArea className="flex-1 pr-4">
                            <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="bg-slate-50 border-slate-200">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-slate-500">Overall Score</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-4xl font-bold text-slate-900">{evaluation.score}/10</div>
                                        </CardContent>
                                    </Card>
                                    <Card className={evaluation.decision === 'Hire' || evaluation.decision === 'Strong Hire' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-slate-500">Decision</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className={evaluation.decision === 'Hire' || evaluation.decision === 'Strong Hire' ? 'text-4xl font-bold text-emerald-600' : 'text-4xl font-bold text-red-600'}>
                                                {evaluation.decision}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-slate-900">
                                        <Target className="w-5 h-5 text-emerald-500" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-2">
                                        {evaluation.strengths.map((str: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                                <span className="text-emerald-500 mt-0.5">•</span>
                                                <span className="text-slate-700 text-sm">{str}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-slate-900">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" /> Areas for Improvement
                                    </h3>
                                    <ul className="space-y-2">
                                        {evaluation.improvements.map((imp: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                                <span className="text-amber-500 mt-0.5">•</span>
                                                <span className="text-slate-700 text-sm">{imp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-slate-900">
                                        <ListChecks className="w-5 h-5 text-blue-500" /> Recommended Preparation
                                    </h3>
                                    <ul className="space-y-2">
                                        {evaluation.preparation_steps.map((step: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <span className="text-blue-500 mt-0.5">•</span>
                                                <span className="text-slate-700 text-sm">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                    <DialogFooter>
                        <Button onClick={() => { setIsResultOpen(false); navigate("/"); }} variant="secondary">Close & Return Home</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function RoomStatus() {
    const connectionState = useConnectionState();
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (connectionState === ConnectionState.Connected) {
            const startTime = Date.now();
            interval = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [connectionState]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (connectionState === ConnectionState.Connected) {
        return (
            <div className="flex items-center gap-3 text-emerald-600 font-medium bg-white border border-emerald-100 px-5 py-2 rounded-full shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="tracking-wide text-sm font-bold uppercase">Live Interview</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="font-mono text-sm tracking-widest text-slate-600 font-semibold">
                    {formatTime(duration)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">{connectionState}</span>
        </div>
    );
}

function MicButton() {
    const { localParticipant } = useRoomContext();
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (!localParticipant) return;
        setIsMuted(!localParticipant.isMicrophoneEnabled);
    }, [localParticipant?.isMicrophoneEnabled]);

    const toggleMic = async () => {
        if (!localParticipant) return;
        try {
            await localParticipant.setMicrophoneEnabled(isMuted);
            setIsMuted(!isMuted);
        } catch (e) {
            console.error("Failed to toggle mic:", e);
        }
    };

    return (
        <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className={`h-12 w-12 rounded-full shadow-sm transition-all ${isMuted ? 'bg-slate-200 hover:bg-slate-300 text-slate-500' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'}`}
            onClick={toggleMic}
        >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
    );
}

function CameraButton() {
    const { localParticipant } = useRoomContext();
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);

    useEffect(() => {
        if (!localParticipant) return;
        setIsVideoEnabled(localParticipant.isCameraEnabled);
    }, [localParticipant?.isCameraEnabled]);

    const toggleCamera = async () => {
        if (!localParticipant) return;
        try {
            await localParticipant.setCameraEnabled(!isVideoEnabled);
            setIsVideoEnabled(!isVideoEnabled);
        } catch (e) {
            console.error("Failed to toggle camera:", e);
        }
    };

    return (
        <Button
            variant={!isVideoEnabled ? "destructive" : "secondary"}
            size="icon"
            className={`h-12 w-12 rounded-full shadow-sm transition-all ${!isVideoEnabled ? 'bg-slate-200 hover:bg-slate-300 text-slate-500' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'}`}
            onClick={toggleCamera}
        >
            {!isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </Button>
    );
}
