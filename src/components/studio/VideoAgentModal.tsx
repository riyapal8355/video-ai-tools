"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Play,
  Sliders,
  Check,
} from "lucide-react";

interface VideoAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectId: string) => void;
  avatars?: Array<{ id: string; name: string; thumbnailUrl: string | null; gender?: string }>;
}

const PROMPT_TEMPLATES = [
  "B2B SaaS product launch explaining automated workflow benefits with sleek UI callouts",
  "Viral 9:16 TikTok ad demonstrating a fitness tracking smart ring with high-energy hook",
  "Quarterly company all-hands keynote highlighting revenue milestones and global expansion",
  "Customer onboarding guide walking through account setup and key security settings",
];

export default function VideoAgentModal({
  isOpen,
  onClose,
  onProjectCreated,
  avatars = [],
}: VideoAgentModalProps) {
  const [prompt, setPrompt] = useState(
    "A 10-second product teaser introducing our smart AI platform with key benefits and call to action"
  );
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("auto");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/video_agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          durationSeconds,
          aspectRatio,
          preferredAvatarId: selectedAvatarId !== "auto" ? selectedAvatarId : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedPlan(data.plan);
        setCreatedProjectId(data.project_id);
      }
    } catch (err) {
      console.error("Video Agent plan error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStudio = () => {
    if (createdProjectId) {
      onProjectCreated(createdProjectId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2742] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">AI Video Agent Copilot</h3>
              <p className="text-xs text-slate-400">
                Transform any prompt into a complete multi-scene video storyboard with avatars and overlays
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

        {!generatedPlan ? (
          <div className="space-y-4">
            {/* Prompt Description */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Describe your video concept in detail
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-[#121828] border border-[#202c49] rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
                placeholder="What is your video about? Target audience, tone, and main key takeaways..."
              />
            </div>

            {/* Quick Inspiration Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                Example Prompts
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(tmpl)}
                    className="text-[10.5px] bg-[#121828] hover:bg-[#18233a] border border-[#1f2b48] hover:border-cyan-500/50 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg transition-all text-left truncate max-w-full cursor-pointer"
                  >
                    ✨ {tmpl.slice(0, 48)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Selection: Specific or Automatic */}
            <div className="pt-2 border-t border-[#1c2742]">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between mb-2">
                <span>Choose Presenter / Avatar</span>
                <span className="text-[11px] text-cyan-400 font-normal">
                  {selectedAvatarId === "auto" ? "⚡ Auto-Select Best Fit" : "Specific Avatar Selected"}
                </span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAvatarId("auto")}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    selectedAvatarId === "auto"
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30"
                      : "bg-[#121828] border-[#202c49] text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-lg mb-1">
                    ✨
                  </div>
                  <span className="text-[10.5px] font-bold">Auto</span>
                  <span className="text-[8.5px] text-slate-500">AI Choice</span>
                </button>

                {avatars.slice(0, 4).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatarId(av.id)}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                      selectedAvatarId === av.id
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/30"
                        : "bg-[#121828] border-[#202c49] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden mb-1 bg-slate-900 border border-white/10">
                      {av.thumbnailUrl ? (
                        <img src={av.thumbnailUrl} alt={av.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold truncate max-w-full">{av.name.split(" ")[0]}</span>
                    <span className="text-[8.5px] text-slate-500">{av.gender || "Avatar"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Controls: Duration (Default 10s) & Aspect Ratio */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#1c2742]">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Target Duration
                </label>
                <div className="flex gap-2">
                  {[10, 15, 30, 60].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDurationSeconds(dur)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        durationSeconds === dur
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                          : "bg-[#121828] text-slate-400 border-[#202c49]"
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="flex gap-2">
                  {(["16:9", "9:16"] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        aspectRatio === ratio
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500"
                          : "bg-[#121828] text-slate-400 border-[#202c49]"
                      }`}
                    >
                      {ratio === "16:9" ? "16:9 (Landscape)" : "9:16 (Portrait)"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Plan Preview */
          <div className="space-y-4 py-2">
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Check size={16} />
                <span>Storyboard Plan Generated Successfully</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {generatedPlan.scenes.length} Scenes • ~{durationSeconds}s Total
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {generatedPlan.scenes.map((sc: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#111728] border border-[#1e2a44] rounded-2xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-mono">
                        {idx + 1}
                      </span>
                      <span>{sc.title}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {sc.durationSeconds}s
                    </span>
                  </div>

                  {sc.headlineText && (
                    <div className="text-[11px] font-bold text-cyan-300">
                      Headline: &ldquo;{sc.headlineText}&rdquo;
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-[#0c111e] p-2.5 rounded-xl border border-[#18233b]">
                    {sc.scriptText}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#1c2742]">
          <span className="text-[11px] text-slate-400">
            {generatedPlan ? `Estimated Cost: ${generatedPlan.estimatedCredits} credits` : "One-click storyboard generation"}
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a] cursor-pointer"
            >
              Cancel
            </button>
            {!generatedPlan ? (
              <button
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Directing Video...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Generate Storyboard</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleOpenStudio}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>Open in Studio Editor</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
