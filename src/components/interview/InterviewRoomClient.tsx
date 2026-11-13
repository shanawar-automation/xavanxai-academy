"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Video, MonitorUp, ShieldCheck, AlertTriangle, Clock, Pause, Play, Send, CheckCircle2, LifeBuoy, Volume2 } from "lucide-react";
import { XavanButton } from "@/components/ui/XavanPrimitives";

interface TranscriptEntry {
  speaker: "AI" | "CANDIDATE";
  text: string;
  stage: string;
  timestamp: string;
}

export function InterviewRoomClient({
  sessionId,
  candidateName,
  jobTitle,
}: {
  sessionId: string;
  candidateName: string;
  jobTitle: string;
}) {
  const router = useRouter();

  // Pre-flight Setup & Explicit Consent State
  const [setupComplete, setSetupComplete] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [camReady, setCamReady] = useState(false);
  const [screenReady, setScreenReady] = useState(false);
  const [sharedSurfaceLabel, setSharedSurfaceLabel] = useState<string>("");
  const [integrityConsent, setIntegrityConsent] = useState(false);
  const [extendedSilenceMode, setExtendedSilenceMode] = useState(false); // Accessibility 8s vs 4s
  const [setupError, setSetupError] = useState<string | null>(null);

  // Active Interview State
  const [secondsLeft, setSecondsLeft] = useState(1800); // 30:00
  const [isPaused, setIsPaused] = useState(false);
  const [currentStage, setCurrentStage] = useState("01. Introduction (0-3 min)");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [draftInput, setDraftInput] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [integrityWarning, setIntegrityWarning] = useState<string | null>(null);
  const [warningCount, setWarningCount] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [issueReported, setIssueReported] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const silencePromptedRef = useRef<boolean>(false);
  const secondsLeftRef = useRef<number>(1800);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const finishedRef = useRef(false);

  secondsLeftRef.current = secondsLeft;
  transcriptRef.current = transcript;

  const logIntegrityEvent = useCallback(
    async (eventType: string, details: string) => {
      try {
        await fetch(`/api/interview/${sessionId}/integrity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventType, details }),
        });
      } catch {
        // Non-blocking telemetry
      }
    },
    [sessionId]
  );

  // Step 1: Test Camera & Microphone
  async function testAudioVideo() {
    setSetupError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMicReady(stream.getAudioTracks().length > 0);
      setCamReady(stream.getVideoTracks().length > 0);
    } catch {
      setSetupError(
        "Microphone or camera permission denied. Enable browser permissions to proceed."
      );
    }
  }

  // Step 2: Test Browser Screen Sharing with Explicit Surface Disclosure
  async function testScreenShare() {
    setSetupError(null);
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = displayStream;
      const track = displayStream.getVideoTracks()[0];
      const label = track?.label || "Selected Display Window";
      setSharedSurfaceLabel(label);
      setScreenReady(true);

      await logIntegrityEvent(
        "SCREEN_SHARE_STARTED",
        `Candidate shared surface: ${label}`
      );

      track.onended = () => {
        setScreenReady(false);
        setSharedSurfaceLabel("");
        setIntegrityWarning(
          "Please return to the interview environment. Screen sharing was stopped; this activity may be reviewed as part of the interview integrity process."
        );
        setWarningCount((c) => c + 1);
        logIntegrityEvent(
          "SCREEN_SHARE_STOPPED",
          "Candidate stopped browser screen sharing during session."
        );
      };
    } catch {
      setSetupError(
        "Screen-sharing permission was cancelled. Please select a screen or window to share."
      );
    }
  }

  // Speak AI text via browser SpeechSynthesis when available
  function speakAiResponse(text: string) {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.98;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Send candidate turn to AI Interviewer
  const sendTurn = useCallback(
    async (utterance: string, isSilencePrompt = false) => {
      setAiThinking(true);
      lastActivityRef.current = Date.now();
      silencePromptedRef.current = isSilencePrompt;

      const elapsed = 1800 - secondsLeftRef.current;

      try {
        const res = await fetch(`/api/interview/${sessionId}/turn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateUtterance: utterance,
            elapsedSeconds: elapsed,
            isSilencePrompt,
            transcriptHistory: transcriptRef.current,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setSetupError(data.error || "AI Interviewer gateway unavailable.");
          setAiThinking(false);
          return;
        }

        setCurrentStage(data.stage);
        const nowIso = new Date().toISOString();

        setTranscript((prev) => [
          ...prev,
          ...(utterance.trim()
            ? [
                {
                  speaker: "CANDIDATE" as const,
                  text: utterance.trim(),
                  stage: data.stage,
                  timestamp: nowIso,
                },
              ]
            : []),
          {
            speaker: "AI" as const,
            text: data.aiMessage,
            stage: data.stage,
            timestamp: nowIso,
          },
        ]);

        speakAiResponse(data.aiMessage);
      } catch {
        setSetupError("Network interruption. Your transcript is preserved.");
      } finally {
        setAiThinking(false);
        lastActivityRef.current = Date.now();
      }
    },
    [sessionId]
  );

  // The preview <video> is re-created when the room opens — re-attach the live stream.
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [setupComplete]);

  // Release camera, mic, screen share and speech synthesis when leaving the page.
  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => {
        t.onended = null;
        t.stop();
      });
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Start Interview Room
  async function enterInterviewRoom() {
    setSetupComplete(true);
    await sendTurn("");
  }

  // 30-Minute Countdown Timer & Configurable Silence Monitor (4s or 8s accessibility)
  useEffect(() => {
    if (!setupComplete || isPaused) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));

      if (secondsLeftRef.current <= 1 && !finishedRef.current) {
        finishedRef.current = true;
        void handleFinishInterview();
        return;
      }

      const silenceLimitMs = (extendedSilenceMode ? 8 : 4) * 1000;
      const idleMs = Date.now() - lastActivityRef.current;

      if (
        !aiThinking &&
        !isListening &&
        !draftInput.trim() &&
        !silencePromptedRef.current &&
        transcriptRef.current.length > 0 &&
        idleMs >= silenceLimitMs
      ) {
        sendTurn("", true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [
    setupComplete,
    isPaused,
    extendedSilenceMode,
    aiThinking,
    isListening,
    draftInput,
    sendTurn,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);

  // Transparent Tab/Window Focus Integrity Listener (Never auto-cancels)
  useEffect(() => {
    if (!setupComplete || isPaused) return;

    const onBlur = () => {
      setIntegrityWarning(
        "Please return to the interview environment. This activity may be reviewed as part of the interview integrity process."
      );
      setWarningCount((c) => c + 1);
      logIntegrityEvent(
        "WINDOW_FOCUS_LOST",
        "Interview browser window lost focus during active session."
      );
    };

    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [setupComplete, isPaused, logIntegrityEvent]);

  // Voice Speech-to-Text Capture
  function startVoiceCapture() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSetupError(
        "Browser SpeechRecognition unavailable; use the accessible text response input below."
      );
      return;
    }

    // Interrupt AI TTS if candidate begins speaking
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    lastActivityRef.current = Date.now();

    recognition.onresult = (event: any) => {
      const spokenText = event.results?.[0]?.[0]?.transcript || "";
      setIsListening(false);
      if (spokenText.trim()) {
        sendTurn(spokenText);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  async function handleFinishInterview() {
    if (completing) return;
    finishedRef.current = true;
    setCompleting(true);
    try {
      screenStreamRef.current?.getTracks().forEach((t) => {
        t.onended = null;
        t.stop();
      });
      await fetch(`/api/interview/${sessionId}/evaluate`, {
        method: "POST",
      });
      router.push(`/careers?interviewCompleted=${sessionId}`);
    } catch {
      setCompleting(false);
    }
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  // =========================================================
  // PRE-FLIGHT HARDWARE, SCREEN SHARE & CONSENT SCREEN
  // =========================================================
  if (!setupComplete) {
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#101010] p-7 sm:p-10 shadow-glass">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F47735]/35 bg-[#F47735]/10 px-3 py-1 font-mono text-xs text-[#F47735]">
          <ShieldCheck className="h-3.5 w-3.5" />
          PRE-INTERVIEW HARDWARE &amp; INTEGRITY CHECK
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
          XavanXAI Talent Intelligence Room
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Candidate: <strong className="text-white">{candidateName}</strong> •
          Role: <strong className="text-white">{jobTitle}</strong> • Duration:{" "}
          <strong className="text-[#F47735]">30 Minutes</strong>
        </p>

        {setupError && (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{setupError}</span>
          </div>
        )}

        {/* Camera Preview & Hardware Buttons */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080808] aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="rounded-xl border border-white/10 bg-[#080808] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Microphone &amp; Camera:</span>
                <span className={micReady && camReady ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                  {micReady && camReady ? "VERIFIED" : "PENDING TEST"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A1A1AA]">Display Screen Share:</span>
                <span className={screenReady ? "text-emerald-400 font-mono" : "text-amber-400 font-mono"}>
                  {screenReady ? "ACTIVE" : "PENDING TEST"}
                </span>
              </div>
              {sharedSurfaceLabel && (
                <div className="truncate font-mono text-[11px] text-[#F47735]">
                  Sharing: {sharedSurfaceLabel}
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <XavanButton
                type="button"
                variant="secondary"
                onClick={testAudioVideo}
                className="w-full"
              >
                <Video className="h-4 w-4 text-[#F47735]" />
                1. Test Microphone &amp; Camera
              </XavanButton>

              <XavanButton
                type="button"
                variant="secondary"
                onClick={testScreenShare}
                className="w-full"
              >
                <MonitorUp className="h-4 w-4 text-[#F47735]" />
                2. Share Intended Interview Screen
              </XavanButton>
            </div>
          </div>
        </div>

        {/* Accessibility & Transparency Notice */}
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-[#080808] p-5 text-xs text-[#A1A1AA]">
          <p className="leading-relaxed">
            <strong className="text-white">
              Transparent Integrity &amp; Privacy Disclosure:
            </strong>{" "}
            With your consent, XavanXAI verifies camera availability, browser
            focus, and your explicitly shared screen window. We{" "}
            <strong className="text-white">never</strong> inspect private tabs,
            local files, or passwords, and we{" "}
            <strong className="text-white">never</strong> score eye movement,
            facial expressions, accent, or disability-related movement.
          </p>

          <label className="flex items-center gap-2.5 text-white cursor-pointer">
            <input
              type="checkbox"
              checked={extendedSilenceMode}
              onChange={(e) => setExtendedSilenceMode(e.target.checked)}
              className="accent-[#F47735]"
            />
            <span>
              Enable Accessibility Accommodation (extends thinking pause
              threshold from 4s to 8s before gentle check-in)
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-white cursor-pointer border-t border-white/10 pt-3">
            <input
              type="checkbox"
              checked={integrityConsent}
              onChange={(e) => setIntegrityConsent(e.target.checked)}
              className="mt-0.5 accent-[#F47735]"
            />
            <span>
              I understand what is processed and consent to begin my 30-minute
              AI technical interview with human recruiter review.
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <XavanButton
            type="button"
            variant="primary"
            size="lg"
            disabled={!micReady || !screenReady || !integrityConsent}
            onClick={enterInterviewRoom}
          >
            Enter 30-Minute AI Interview Room
          </XavanButton>
        </div>
      </div>
    );
  }

  // =========================================================
  // ACTIVE 30-MINUTE AI INTERVIEW ROOM
  // =========================================================
  return (
    <div className="space-y-5">
      {/* Top Status & Timer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#101010] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-[#F47735]/40 bg-[#F47735]/10 px-3 py-1 font-mono text-xs font-semibold text-[#F47735]">
            {currentStage}
          </span>
          {screenReady && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] text-emerald-300">
              <MonitorUp className="h-3.5 w-3.5" />
              Sharing: {sharedSurfaceLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#080808] px-4 py-2 font-mono text-sm font-bold text-white">
            <Clock className="h-4 w-4 text-[#F47735]" />
            {mins}:{secs}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsPaused(!isPaused);
              logIntegrityEvent(
                "CANDIDATE_PAUSED",
                `Candidate ${!isPaused ? "paused" : "resumed"} session.`
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080808] px-3 py-2 font-mono text-xs text-white hover:border-[#F47735]"
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            {isPaused ? "Resume" : "Pause"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIssueReported(true);
              logIntegrityEvent(
                "TECHNICAL_ISSUE_REPORTED",
                "Candidate flagged a technical/network issue during interview."
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080808] px-3 py-2 font-mono text-xs text-[#A1A1AA] hover:text-white"
          >
            <LifeBuoy className="h-3.5 w-3.5 text-[#F47735]" />
            {issueReported ? "Support Logged" : "Report Issue"}
          </button>
        </div>
      </div>

      {/* Transparent Integrity Warning Banner (If triggered) */}
      {integrityWarning && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold">{integrityWarning}</p>
              {warningCount >= 2 && (
                <p className="mt-1 text-amber-300/90">
                  Repeated confirmed integrity notices may result in this
                  session being flagged for human recruiter review.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIntegrityWarning(null)}
            className="font-mono text-[11px] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Split Interview Stage */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 4 Cols: AI Interviewer Avatar + Candidate Camera */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-[#F47735]/40 bg-[#101010] p-6 text-center shadow-orange-subtle">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#F47735] bg-[#080808]">
              <Volume2
                className={`h-10 w-10 text-[#F47735] ${
                  aiThinking ? "animate-pulse" : ""
                }`}
              />
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Athena • AI Principal Interviewer
            </h2>
            <p className="font-mono text-xs text-[#F47735]">
              {aiThinking
                ? "ANALYZING RESPONSE..."
                : isListening
                ? "LISTENING TO CANDIDATE..."
                : "READY"}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080808] aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          </div>

          <XavanButton
            type="button"
            variant="primary"
            disabled={completing}
            onClick={handleFinishInterview}
            className="w-full"
          >
            <CheckCircle2 className="h-4 w-4" />
            {completing
              ? "Generating Evidence Report..."
              : "End Interview & Submit for Review"}
          </XavanButton>
        </div>

        {/* Right 8 Cols: Live Captions Transcript & Voice/Text Controls */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#101010] p-6 lg:col-span-8">
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
            {transcript.map((entry, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-4 text-sm ${
                  entry.speaker === "AI"
                    ? "border border-[#F47735]/30 bg-[#080808] text-white"
                    : "ml-6 border border-white/10 bg-[#181818] text-white/90"
                }`}
              >
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-[#F47735]">
                  <span>
                    {entry.speaker === "AI"
                      ? "ATHENA (AI INTERVIEWER)"
                      : candidateName.toUpperCase()}
                  </span>
                  <span className="text-[#A1A1AA]">{entry.stage}</span>
                </div>
                <p className="leading-relaxed">{entry.text}</p>
              </div>
            ))}
          </div>

          {/* Voice Capture & Accessible Text Response Bar */}
          <div className="mt-5 border-t border-white/10 pt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={aiThinking || isPaused}
                onClick={startVoiceCapture}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-[#F47735] text-[#080808]"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    Listening... Speak Clearly
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Speak Answer (Voice)
                  </>
                )}
              </button>
              <span className="font-mono text-[11px] text-[#A1A1AA]">
                Silence threshold: {extendedSilenceMode ? "8s (Accessibility)" : "4s"} • Never auto-cuts mid-sentence
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draftInput.trim() || aiThinking) return;
                const msg = draftInput;
                setDraftInput("");
                sendTurn(msg);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={draftInput}
                onChange={(e) => {
                  setDraftInput(e.target.value);
                  lastActivityRef.current = Date.now();
                }}
                placeholder="Or type your technical response / code explanation here..."
                className="flex-1 rounded-xl border border-white/10 bg-[#080808] px-4 py-2.5 text-sm text-white focus:border-[#F47735] focus:outline-none"
              />
              <XavanButton type="submit" variant="secondary" disabled={aiThinking}>
                <Send className="h-4 w-4" />
              </XavanButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}