"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bot, X, Send, Mic, Volume2, Calendar } from "lucide-react";

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export function XavanCompanyAssistant() {
  const [open, setOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Welcome to XavanXAI. I'm Lyra Concierge (XVN-COM-04). Ask me about our 12 autonomous agent departments, n8n automation, or Talent Intelligence—or book a consultation anytime.",
    },
  ]);

  function speakText(text: string) {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const nextHistory: ChatMsg[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });
      const data = await res.json();
      const reply =
        data.reply ||
        data.error ||
        "Please contact operations@xavanxai.com for direct assistance.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speakText(reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection interrupted. You can reach us at operations@xavanxai.com.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleVoiceInput() {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => any })
        .webkitSpeechRecognition;

    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    setListening(true);

    recognition.onresult = (event: any) => {
      const spoken = event.results?.[0]?.[0]?.transcript || "";
      setListening(false);
      if (spoken) sendMessage(spoken);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open XavanXAI Voice & Chat Assistant"
          className="flex items-center gap-2.5 rounded-full border border-[#F47735]/60 bg-[#101010] px-4 py-3 text-xs font-semibold text-white shadow-orange-glow transition-transform hover:scale-105"
        >
          <Bot className="h-4 w-4 text-[#F47735]" />
          <span>Lyra AI Concierge</span>
        </button>
      ) : (
        <div className="flex h-[460px] w-[350px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#101010] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#080808] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#F47735]" />
              <div>
                <div className="font-display text-xs font-bold text-white">
                  Lyra Concierge
                </div>
                <div className="font-mono text-[10px] text-[#F47735]">
                  XVN-COM-04 • VOICE &amp; CHAT
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                title="Toggle Voice Playback"
                className={`rounded-lg p-1.5 ${
                  voiceEnabled
                    ? "bg-[#F47735] text-[#080808]"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="rounded-lg p-1.5 text-[#A1A1AA] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-2xl p-3 leading-relaxed ${
                  m.role === "assistant"
                    ? "border border-white/10 bg-[#080808] text-white/90"
                    : "ml-6 bg-[#F47735] text-[#080808] font-medium"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="font-mono text-[11px] text-[#F47735]">
                Lyra is synthesizing...
              </div>
            )}
          </div>

          {/* Quick Routing Strip */}
          <div className="border-t border-white/10 bg-[#080808] px-3 py-2 flex items-center justify-between text-[11px]">
            <Link
              href="/book-consultation"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-[#F47735] hover:underline"
            >
              <Calendar className="h-3 w-3" />
              Book Consultation
            </Link>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="text-[#A1A1AA] hover:text-white"
            >
              Human Specialist →
            </Link>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-1.5 border-t border-white/10 bg-[#101010] p-2.5"
          >
            <button
              type="button"
              onClick={handleVoiceInput}
              aria-label="Voice input"
              className={`rounded-xl p-2 ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "border border-white/10 bg-[#080808] text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask XavanXAI..."
              className="flex-1 rounded-xl border border-white/10 bg-[#080808] px-3 py-2 text-xs text-white focus:border-[#F47735] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Send message"
              className="rounded-xl bg-[#F47735] p-2 text-[#080808]"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}