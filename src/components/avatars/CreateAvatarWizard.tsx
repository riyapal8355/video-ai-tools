"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Camera,
  Mic,
  Smartphone,
  Copy,
  Check,
  RotateCw,
  ChevronDown,
  Upload,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  RefreshCcw,
  Video,
} from "lucide-react";

import EnablePermissionsModal from "./EnablePermissionsModal";

interface CreateAvatarWizardProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function CreateAvatarWizard({
  onBack,
  onSuccess,
}: CreateAvatarWizardProps) {
  const [tab, setTab] = useState<"webcam" | "phone" | "upload">("webcam");
  const [camStatus, setCamStatus] = useState<"blocked" | "ready" | "recording" | "completed">("blocked");
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [scriptLang, setScriptLang] = useState("English");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [qrTimer, setQrTimer] = useState(1183); // 19:43 in seconds
  const [avatarName, setAvatarName] = useState("My Digital Avatar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateAvatar = async (videoUrl?: string) => {
    if (!avatarName.trim()) {
      alert("Please enter a name for your avatar.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v2/avatars/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: avatarName,
          type: "instant",
          footageUrl: videoUrl || uploadedVideoUrl || "/renders/sample.mp4",
          consentStatement: "I hereby declare that I authorize the creation of my digital AI twin for video generation.",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create avatar");
      }

      if (onSuccess) onSuccess();
      alert(`Avatar "${avatarName}" created and added to your library!`);
      onBack();
    } catch (err: any) {
      console.error("Avatar creation error:", err);
      alert("Error creating avatar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");

      const res = await fetch("/api/v2/assets/local-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadedVideoUrl(data.asset.url);
      setCamStatus("completed");
      setTab("webcam");
    } catch (err: any) {
      alert("File upload failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // QR Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 1200));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://app.vidoai.com/record-v2?code=cbf18a992e");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartRecording = () => {
    setCamStatus("recording");
    setCountdown(15);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCamStatus("completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-white dark:bg-[#07090e] text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none relative">
      {/* Top Right Close Button */}
      <div className="absolute top-6 right-8 z-30">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full border border-slate-200 dark:border-[#22304d] hover:bg-slate-100 dark:hover:bg-[#18233a] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
          title="Close Wizard"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 py-8 flex flex-col items-center justify-between min-h-full">
        {/* Header Section */}
        <div className="text-center mt-2 mb-6 w-full max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
            Create your Avatar in 15 seconds
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record your motion once, then reuse it across any look for this avatar. Or{" "}
            <button
              onClick={() => setTab("upload")}
              className="text-slate-800 dark:text-slate-200 font-bold underline underline-offset-4 hover:text-blue-500 transition-colors"
            >
              upload footage
            </button>
          </p>

          {/* Tab Selector (Record via webcam vs Record via phone) */}
          <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-[#111728] border border-slate-200 dark:border-[#1e2942] rounded-full mt-5 max-w-md mx-auto">
            <button
              onClick={() => setTab("webcam")}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                tab === "webcam"
                  ? "bg-white dark:bg-[#1f2b48] text-slate-900 dark:text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Record via webcam
            </button>

            <button
              onClick={() => setTab("phone")}
              className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
                tab === "phone"
                  ? "bg-white dark:bg-[#1f2b48] text-slate-900 dark:text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Record via phone
            </button>
          </div>
        </div>

        {/* MAIN INTERACTIVE CARD (Context-aware) */}
        {tab === "webcam" && (
          <div className="w-full max-w-2xl bg-slate-50/70 dark:bg-[#0c111e] border border-slate-200 dark:border-[#1c2740] rounded-3xl p-7 shadow-xl flex flex-col items-center text-center">
            {camStatus === "blocked" && (
              <>
                {/* Browser Mockup Frame (Matches Screenshot 1) */}
                <div className="w-full bg-white dark:bg-[#121828] border border-slate-200 dark:border-[#22304d] rounded-2xl shadow-lg p-3.5 mb-5 relative">
                  {/* Browser URL Bar */}
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#1c2742] pb-2.5 mb-3 text-[11px] text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      VidoAI — Create Avatar
                    </span>
                  </div>

                  {/* Address Bar */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0a0e19] border border-slate-200 dark:border-[#1a253d] rounded-lg py-1.5 px-3 text-[11px] text-slate-600 dark:text-slate-400 font-mono mb-4">
                    <span className="text-slate-400">&lt; &gt;</span>
                    <RotateCw size={12} className="text-slate-400" />
                    <span>app.vidoai.com</span>
                  </div>

                  {/* Simulated Viewport Canvas with Spinner */}
                  <div
                    onClick={() => setCamStatus("ready")}
                    className="aspect-video bg-slate-100 dark:bg-[#0b0f19] border border-slate-200 dark:border-[#1e2a44] rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-full border-3 border-cyan-500 border-t-transparent animate-spin mb-3"></div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-cyan-400 transition-colors">
                      Click to grant camera & microphone access
                    </span>
                  </div>
                </div>

                {/* Red Warning text */}
                <p className="text-xs font-bold text-rose-500 mb-3">
                  Please enable camera & microphone access in your browser settings
                </p>

                {/* Get Help Button */}
                <button
                  onClick={() => setIsPermModalOpen(true)}
                  className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold rounded-full shadow-md transition-all cursor-pointer mb-3"
                >
                  Get help
                </button>

                <button
                  onClick={() => setTab("phone")}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer"
                >
                  Or record via phone →
                </button>
              </>
            )}

            {camStatus === "ready" && (
              <div className="w-full flex flex-col items-center">
                {/* Live Camera Viewport Mock */}
                <div className="w-full aspect-video bg-[#080c16] rounded-2xl border-2 border-cyan-500/60 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-4">
                  {/* Face Tracking Oval */}
                  <div className="w-36 h-48 rounded-full border-2 border-dashed border-cyan-400/80 flex items-center justify-center animate-pulse">
                    <span className="text-6xl drop-shadow-xl">👩‍💼</span>
                  </div>

                  {/* Camera overlay indicators */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 border border-white/10">
                    <Camera size={12} /> HD Camera Connected
                  </div>

                  <div className="absolute bottom-3 inset-x-4 bg-black/75 backdrop-blur-md rounded-xl p-2.5 text-center text-xs text-white border border-white/10">
                    <p className="text-cyan-300 font-semibold mb-0.5">Read aloud clearly when recording starts:</p>
                    <p className="italic text-[11px] text-slate-200">
                      "I hereby declare that I authorize the creation of my digital AI twin for video generation."
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => setCamStatus("blocked")}
                    className="px-5 py-2 rounded-full border border-slate-200 dark:border-[#22304d] text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Adjust Camera
                  </button>
                  <button
                    onClick={handleStartRecording}
                    className="px-8 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/25 cursor-pointer"
                  >
                    Start 15s Recording
                  </button>
                </div>
              </div>
            )}

            {camStatus === "recording" && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full aspect-video bg-[#080c16] rounded-2xl border-2 border-rose-500 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-4">
                  <div className="w-36 h-48 rounded-full border-2 border-rose-500 flex items-center justify-center animate-pulse">
                    <span className="text-6xl">👩‍💼</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    REC: {countdown}s
                  </div>

                  <div className="absolute bottom-3 inset-x-4 bg-black/80 rounded-xl p-3 text-center text-xs text-white">
                    "I hereby declare that I authorize the creation of my digital AI twin for video generation."
                  </div>
                </div>

                <div className="w-full max-w-md h-2 bg-slate-200 dark:bg-[#1a253c] rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full bg-rose-500 transition-all duration-1000"
                    style={{ width: `${((15 - countdown) / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {camStatus === "completed" && (
              <div className="w-full flex flex-col items-center py-4">
                <CheckCircle2 size={48} className="text-emerald-400 mb-2" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Motion & Likeness Captured with Consent
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm text-center">
                  Your footage passed the resolution and lip-sync tests. A legal consent record will be securely archived.
                </p>

                <div className="w-full max-w-sm mb-4">
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold text-center">
                    Avatar Name
                  </label>
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder="e.g. My Studio Persona"
                    className="w-full bg-slate-100 dark:bg-[#121828] border border-slate-300 dark:border-[#22304f] rounded-xl px-3.5 py-2 text-xs text-center focus:outline-none focus:border-cyan-500 font-semibold"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCamStatus("ready")}
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-full border border-slate-300 dark:border-[#243354] text-xs font-semibold"
                  >
                    Re-record
                  </button>
                  <button
                    onClick={() => handleCreateAvatar()}
                    disabled={isSubmitting}
                    className="px-7 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Archiving & Training Avatar...</span>
                      </>
                    ) : (
                      <span>Generate Digital Avatar</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Record via Phone (Matches Screenshot 2) */}
        {tab === "phone" && (
          <div className="w-full max-w-md bg-slate-50/70 dark:bg-[#0c111e] border border-slate-200 dark:border-[#1c2740] rounded-3xl p-7 shadow-xl flex flex-col items-center text-center">
            {/* Crisp High-Res QR Code Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md mb-4 flex items-center justify-center">
              {/* SVG QR Code Simulation */}
              <svg className="w-56 h-56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* QR Outer Frame */}
                <rect width="100" height="100" fill="white" />
                {/* Corner Markers */}
                <rect x="5" y="5" width="26" height="26" fill="black" rx="4" />
                <rect x="8" y="8" width="20" height="20" fill="white" rx="2" />
                <rect x="12" y="12" width="12" height="12" fill="black" rx="2" />

                <rect x="69" y="5" width="26" height="26" fill="black" rx="4" />
                <rect x="72" y="8" width="20" height="20" fill="white" rx="2" />
                <rect x="76" y="12" width="12" height="12" fill="black" rx="2" />

                <rect x="5" y="69" width="26" height="26" fill="black" rx="4" />
                <rect x="8" y="72" width="20" height="20" fill="white" rx="2" />
                <rect x="12" y="76" width="12" height="12" fill="black" rx="2" />

                {/* Simulated QR matrix pattern */}
                <rect x="36" y="6" width="6" height="6" fill="black" />
                <rect x="46" y="6" width="6" height="6" fill="black" />
                <rect x="56" y="6" width="6" height="6" fill="black" />
                <rect x="36" y="16" width="6" height="6" fill="black" />
                <rect x="46" y="26" width="6" height="6" fill="black" />
                <rect x="56" y="16" width="6" height="6" fill="black" />

                <rect x="6" y="36" width="6" height="6" fill="black" />
                <rect x="16" y="46" width="6" height="6" fill="black" />
                <rect x="26" y="36" width="6" height="6" fill="black" />
                <rect x="36" y="36" width="26" height="26" fill="black" rx="3" />
                <rect x="40" y="40" width="18" height="18" fill="white" rx="2" />
                <rect x="45" y="45" width="8" height="8" fill="#3b82f6" rx="2" />

                <rect x="69" y="36" width="6" height="6" fill="black" />
                <rect x="79" y="46" width="6" height="6" fill="black" />
                <rect x="89" y="36" width="6" height="6" fill="black" />

                <rect x="36" y="69" width="6" height="6" fill="black" />
                <rect x="46" y="79" width="6" height="6" fill="black" />
                <rect x="56" y="69" width="6" height="6" fill="black" />
                <rect x="69" y="69" width="6" height="6" fill="black" />
                <rect x="79" y="79" width="6" height="6" fill="black" />
                <rect x="89" y="89" width="6" height="6" fill="black" />
              </svg>
            </div>

            {/* Link Copy Box (Matches Screenshot 2) */}
            <div className="w-full bg-white dark:bg-[#121828] border border-slate-200 dark:border-[#22304f] rounded-2xl p-1.5 pl-4 flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-[240px] text-[11px] font-mono">
                https://app.vidoai.com/record-v2?code=cbf1...
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-[#1c2742] hover:bg-slate-200 dark:hover:bg-[#253457] rounded-xl text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Timer & Refresh */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              QR code will expire in{" "}
              <span className="font-bold text-cyan-500 dark:text-cyan-400">
                {formatTime(qrTimer)}
              </span>
            </p>

            <button
              onClick={() => {
                setQrTimer(1200);
                alert("QR code refreshed!");
              }}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 underline underline-offset-4 hover:text-blue-500 transition-colors"
            >
              Refresh now
            </button>
          </div>
        )}

        {/* Tab: Upload Footage */}
        {tab === "upload" && (
          <div className="w-full max-w-xl p-10 border-2 border-dashed border-slate-300 dark:border-[#243354] hover:border-cyan-400 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#0c111e] cursor-pointer">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleFileUpload}
            />
            <Video size={36} className="text-cyan-500 mb-3" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Upload footage of your persona (MP4, MOV)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
              Ensure high lighting, minimal background noise, and 1080p+ resolution for best AI avatar results.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-full shadow-md cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Uploading footage...</span>
                </>
              ) : (
                <span>Select Video File</span>
              )}
            </button>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="w-full max-w-2xl flex items-center justify-between pt-6 border-t border-slate-100 dark:border-[#162035] mt-6">
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Back
          </button>

          {/* Script dropdown & I'm ready button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>We'll provide a script on screen in</span>
              <div className="relative">
                <select
                  value={scriptLang}
                  onChange={(e) => setScriptLang(e.target.value)}
                  className="appearance-none bg-slate-100 dark:bg-[#121828] border border-slate-200 dark:border-[#22304f] text-xs font-bold text-slate-800 dark:text-slate-200 px-3 py-1 pr-6 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => {
                if (camStatus === "ready") {
                  handleStartRecording();
                } else {
                  setCamStatus("ready");
                }
              }}
              className="px-6 py-2 rounded-full bg-slate-200 dark:bg-[#1a243c] hover:bg-slate-300 dark:hover:bg-[#223050] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              I'm ready
            </button>
          </div>
        </div>
      </div>

      {/* Enable Camera & Microphone Modal */}
      <EnablePermissionsModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
        onPermissionsGranted={() => {
          setCamStatus("ready");
        }}
      />
    </div>
  );
}
