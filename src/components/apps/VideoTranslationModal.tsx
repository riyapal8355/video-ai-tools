"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Languages,
  Upload,
  Check,
  RefreshCw,
  Play,
  Download,
  AlertCircle,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface VideoTranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStudio?: () => void;
}

const LANGUAGES = [
  { code: "Spanish", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "French", name: "French (Français)", flag: "🇫🇷" },
  { code: "German", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "Japanese", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "Hindi", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "Italian", name: "Italian (Italiano)", flag: "🇮🇹" },
  { code: "Portuguese", name: "Portuguese (Português)", flag: "🇧🇷" },
  { code: "Chinese", name: "Chinese (Mandarin)", flag: "🇨🇳" },
];

export default function VideoTranslationModal({
  isOpen,
  onClose,
  onOpenStudio,
}: VideoTranslationModalProps) {
  const [sourceVideoUrl, setSourceVideoUrl] = useState(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
  );
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [transcript, setTranscript] = useState(
    "Welcome to VidoAI. Today we are exploring intelligent video translation, batch personalization, and our high-performance developer API."
  );
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [legalAttestation, setLegalAttestation] = useState(true);
  const [applyGlossary, setApplyGlossary] = useState(true);

  // Job state
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [outputVideoUrl, setOutputVideoUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Poll status when activeJobId is set
  useEffect(() => {
    if (!activeJobId || jobStatus === "completed" || jobStatus === "failed") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v2/video_translate/${activeJobId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.job) {
            setJobStatus(data.job.status);
            setProgress(data.job.progressPercentage || 0);
            if (data.job.status === "completed" && data.job.outputVideoUrl) {
              setOutputVideoUrl(data.job.outputVideoUrl);
              clearInterval(interval);
            } else if (data.job.status === "failed") {
              setErrorMessage(data.job.errorMessage || "Translation processing failed");
              clearInterval(interval);
            }
          }
        }
      } catch (err) {
        console.warn("Polling translation job status:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeJobId, jobStatus]);

  if (!isOpen) return null;

  const handleStartTranslation = async () => {
    if (!legalAttestation) {
      setErrorMessage("Please accept the rights attestation to proceed with translation.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setProgress(10);
    setJobStatus("queued");

    try {
      const res = await fetch("/api/v2/video_translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceVideoUrl,
          targetLanguage,
          originalTranscript: transcript,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start translation job");
      }

      setActiveJobId(data.id);
      setJobStatus(data.status);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to start translation");
      setJobStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v2/assets/local-upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setSourceVideoUrl(data.url);
        }
      }
    } catch (err) {
      console.warn("Upload failed, keeping default URL:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2742] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <Languages size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">AI Video Translation & Lip-Sync</h3>
              <p className="text-xs text-slate-400">
                Translate video speech into 175+ languages with voice matching and lip synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Flow */}
        {!jobStatus ? (
          <div className="space-y-4">
            {/* Source Video Input / Upload */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Source Video URL or File
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sourceVideoUrl}
                  onChange={(e) => setSourceVideoUrl(e.target.value)}
                  className="flex-1 bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="https://...mp4"
                />
                <label className="px-3 py-2 bg-[#18233a] hover:bg-[#202e4d] border border-[#26375a] text-slate-200 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload size={13} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Target Language Selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Target Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setTargetLanguage(lang.code)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      targetLanguage === lang.code
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold shadow-sm"
                        : "bg-[#121828] border-[#202c49] text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-xs truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Review & Edit Transcript */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText size={13} className="text-cyan-400" />
                  <span>Spoken Transcript (Review & Edit)</span>
                </label>
                <button
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-[11px] text-cyan-400 hover:underline cursor-pointer font-semibold"
                >
                  {isEditingTranscript ? "Done Editing" : "Edit Transcript"}
                </button>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                disabled={!isEditingTranscript}
                className={`w-full bg-[#121828] border rounded-2xl p-3 text-xs text-white leading-relaxed resize-none ${
                  isEditingTranscript
                    ? "border-cyan-500 focus:outline-none"
                    : "border-[#202c49] text-slate-300"
                }`}
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Tip: Correcting any terms before translation guarantees maximum accuracy across languages.
              </p>
            </div>

            {/* Brand Glossary & Legal Attestation */}
            <div className="space-y-2 pt-2 border-t border-[#1c2742]">
              <label
                onClick={() => setApplyGlossary(!applyGlossary)}
                className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-[#121828] border border-[#1f2b48]"
              >
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    applyGlossary
                      ? "bg-cyan-500 border-cyan-500 text-slate-950"
                      : "border-slate-600 bg-transparent"
                  }`}
                >
                  {applyGlossary && <Check size={12} className="stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-white">Apply Brand Glossary Protection</span>
                  <p className="text-[10px] text-slate-400">
                    Automatically protects trademark terms and applies custom translated brand terminology
                  </p>
                </div>
              </label>

              <label
                onClick={() => setLegalAttestation(!legalAttestation)}
                className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-[#121828] border border-[#1f2b48]"
              >
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${
                    legalAttestation
                      ? "bg-cyan-500 border-cyan-500 text-slate-950"
                      : "border-slate-600 bg-transparent"
                  }`}
                >
                  {legalAttestation && <Check size={12} className="stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <span className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>Legal Rights & Likeness Attestation</span>
                  </span>
                  <p className="text-[10px] text-slate-400">
                    I attest that I have the explicit rights or authorization to translate this source video.
                  </p>
                </div>
              </label>
            </div>
          </div>
        ) : (
          /* Real Progress & Output Screen */
          <div className="py-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                {jobStatus === "completed" ? (
                  <Check size={28} className="text-emerald-400" />
                ) : (
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                )}
              </div>
              <h4 className="text-base font-bold text-white">
                {jobStatus === "completed"
                  ? "Translation Ready!"
                  : `Processing ${targetLanguage} Translation`}
              </h4>
              <p className="text-xs text-slate-400">
                {jobStatus === "transcribing" && "Extracting audio and verifying speech transcripts..."}
                {jobStatus === "translating" && "Applying Brand Glossary rules & neural translation..."}
                {jobStatus === "synthesizing" && "Synthesizing voice matching original timbre..."}
                {jobStatus === "compositing" && "Syncing lip movements and encoding final 1080p MP4..."}
                {jobStatus === "completed" && "Video translated and lip-synced successfully!"}
                {jobStatus === "queued" && "Queued in high-speed GPU pipeline..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400 capitalize">{jobStatus}</span>
                <span className="text-cyan-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-[#161f35] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Completed Preview Player */}
            {jobStatus === "completed" && outputVideoUrl && (
              <div className="space-y-3 bg-[#111728] border border-[#1e2a44] p-3 rounded-2xl">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center relative shadow-inner">
                  <video
                    src={outputVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs text-slate-400 font-mono">
                    Output: {outputVideoUrl}
                  </span>
                  <a
                    href={outputVideoUrl}
                    download
                    className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download MP4</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#1c2742]">
          <span className="text-[11px] text-slate-400">
            Cost: 15 credits • 1080p Full HD
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a] cursor-pointer"
            >
              {jobStatus === "completed" ? "Close" : "Cancel"}
            </button>
            {!jobStatus ? (
              <button
                onClick={handleStartTranslation}
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Start Video Translation</span>
                  </>
                )}
              </button>
            ) : jobStatus === "completed" ? (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenStudio) onOpenStudio();
                }}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>Open in Studio</span>
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2 bg-[#18233a] text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed flex items-center gap-1.5"
              >
                <RefreshCw size={13} className="animate-spin text-cyan-400" />
                <span>Translating...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
