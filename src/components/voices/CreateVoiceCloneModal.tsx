"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Mic,
  Upload,
  Smartphone,
  ChevronDown,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from "lucide-react";

interface CreateVoiceCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (voiceName: string) => void;
}

export default function CreateVoiceCloneModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateVoiceCloneModalProps) {
  const [tab, setTab] = useState<"record" | "upload" | "phone">("record");
  const [language, setLanguage] = useState("English");
  const [micState, setMicState] = useState<"blocked" | "recording" | "recorded">("blocked");
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceName, setVoiceName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setMicState("recording");
    setRecordSeconds(0);
    const interval = setInterval(() => {
      setRecordSeconds((prev) => {
        if (prev >= 15) {
          clearInterval(interval);
          setMicState("recorded");
          return 15;
        }
        return prev + 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0e1322] text-slate-900 dark:text-white rounded-3xl p-7 shadow-2xl border border-slate-200 dark:border-[#22304f] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Create voice clone</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Speak with high energy, and record for at least 10 sec with a professional mic or smartphone.{" "}
              <button className="text-blue-500 hover:underline inline-flex items-center">
                See more
              </button>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#19243d] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3 Pill Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#141b2c] rounded-2xl my-4">
          <button
            onClick={() => setTab("record")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === "record"
                ? "bg-white dark:bg-[#1f2a44] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Mic size={15} />
            <span>Record audio</span>
          </button>

          <button
            onClick={() => setTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === "upload"
                ? "bg-white dark:bg-[#1f2a44] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Upload size={15} />
            <span>Upload audio</span>
          </button>

          <button
            onClick={() => setTab("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              tab === "phone"
                ? "bg-white dark:bg-[#1f2a44] text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Smartphone size={15} />
            <span>Record on phone</span>
          </button>
        </div>

        {/* Tab 1: Record audio */}
        {tab === "record" && (
          <div>
            {/* Top dropdowns row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-[#121828] border border-slate-200 dark:border-[#22304f] text-xs font-medium text-slate-800 dark:text-slate-200 px-4 py-2 pr-8 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <button
                  onClick={() => setMicState(micState === "blocked" ? "recording" : "blocked")}
                  className="flex items-center gap-2 bg-slate-50 dark:bg-[#121828] border border-slate-200 dark:border-[#22304f] text-xs font-medium text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl cursor-pointer"
                >
                  <Mic size={14} className={micState === "blocked" ? "text-slate-400" : "text-emerald-400"} />
                  <span>{micState === "blocked" ? "No microphone" : "Built-in Microphone (Active)"}</span>
                  <ChevronDown size={13} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Central Simulated Browser Mock (Matches Screenshot 1) */}
            {micState === "blocked" ? (
              <div className="bg-slate-100/70 dark:bg-[#0a0e1a] border border-slate-200 dark:border-[#1e2942] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                {/* Browser window illustration */}
                <div className="w-full max-w-md bg-white dark:bg-[#121829] border border-slate-200 dark:border-[#243354] rounded-xl shadow-lg p-3 mb-6 relative">
                  {/* Browser Bar */}
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#1a253d] pb-2 mb-2 text-[11px] text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">VidoAI — Clone Voice</span>
                  </div>
                  <div className="flex items-center justify-center bg-slate-50 dark:bg-[#0a0e19] rounded-lg py-1 px-3 text-[11px] text-slate-500 font-mono mb-2">
                    🔒 https://app.vidoai.com
                  </div>

                  {/* Popover Permission simulated card */}
                  <div className="bg-white dark:bg-[#151d32] border border-slate-200 dark:border-[#2b3b5f] rounded-xl p-3 shadow-xl text-left max-w-[260px] mx-auto text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 font-semibold">
                      <span>app.vidoai.com</span>
                      <X size={12} className="cursor-pointer" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Lock size={11} /> Connection is secure
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#243354]">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-medium">
                        <Mic size={12} /> Microphone
                      </span>
                      {/* Toggle Switch */}
                      <div
                        onClick={() => handleStartRecording()}
                        className="w-8 h-4.5 bg-blue-600 rounded-full p-0.5 flex items-center justify-end cursor-pointer transition-colors"
                      >
                        <div className="w-3.5 h-3.5 bg-white rounded-full shadow"></div>
                      </div>
                    </div>
                  </div>

                  {/* Red blocked pill */}
                  <div className="mt-3 inline-flex items-center gap-1 bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 text-[11px] font-semibold px-3 py-1 rounded-full">
                    <AlertCircle size={12} />
                    Microphone is blocked
                  </div>
                </div>

                {/* Bottom Action text */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Enable microphone
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                  Please allow the browser to access your microphone and refresh the page or click below to enable.
                </p>

                <div className="flex flex-col items-center gap-2.5">
                  <button
                    onClick={() => handleStartRecording()}
                    className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Allow & Start Recording
                  </button>

                  <button
                    onClick={() => setTab("upload")}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-500 flex items-center gap-1 cursor-pointer"
                  >
                    Upload audio file instead <ChevronDown size={14} className="transform -rotate-90" />
                  </button>
                </div>
              </div>
            ) : micState === "recording" ? (
              <div className="bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-[#1e2942] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center mb-4 animate-pulse">
                  <Mic size={32} className="text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-rose-500 mb-1">
                  Recording audio... ({recordSeconds}s / 15s)
                </h3>
                <p className="text-xs text-slate-400 mb-4 max-w-sm">
                  "The future of video creation starts with high quality natural AI speech."
                </p>
                <div className="w-64 h-2 bg-slate-200 dark:bg-[#1a253c] rounded-full overflow-hidden mb-5">
                  <div
                    className="h-full bg-rose-500 transition-all duration-1000"
                    style={{ width: `${(recordSeconds / 15) * 100}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => setMicState("recorded")}
                  className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Done Recording
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-[#1e2942] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
                <h3 className="text-base font-bold text-emerald-400 mb-1">
                  Sample recorded successfully!
                </h3>
                <p className="text-xs text-slate-400 mb-4">15 seconds of crisp audio captured.</p>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="Enter a name for your cloned voice (e.g. My Studio Voice)"
                  className="w-full max-w-sm bg-white dark:bg-[#121828] border border-slate-300 dark:border-[#22304f] rounded-xl px-3.5 py-2 text-xs mb-4 text-center focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2.5">
                  <button
                    onClick={() => handleStartRecording()}
                    className="px-4 py-2 bg-slate-200 dark:bg-[#18233a] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                  >
                    <RotateCcw size={13} /> Re-record
                  </button>
                  <button
                    onClick={() => {
                      if (onSuccess) onSuccess(voiceName || "My Custom Voice");
                      alert(`Voice "${voiceName || "My Custom Voice"}" created successfully!`);
                      onClose();
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30"
                  >
                    Save & Clone Voice
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload audio */}
        {tab === "upload" && (
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-[#243354] hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-[#0a0e1a] cursor-pointer">
            <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" />
            <Upload size={32} className="text-blue-500 mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Drag and drop your audio file here, or click to browse
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Supported formats: MP3, WAV, M4A, AAC (Max 50MB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Browse Files
            </button>
          </div>
        )}

        {/* Tab 3: Record on phone */}
        {tab === "phone" && (
          <div className="p-6 bg-slate-50 dark:bg-[#0a0e1a] border border-slate-200 dark:border-[#1e2942] rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 bg-white p-2 rounded-2xl border border-slate-200 shadow-md mb-3 flex items-center justify-center text-5xl">
              📱
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
              Scan QR code to record on your phone
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Use your phone's microphone for high-fidelity mobile audio capture.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
