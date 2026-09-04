"use client";

import React, { useState } from "react";
import { User, Mic2, Sparkles, Video, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import RecordingModal from "./RecordingModal";

export default function OnboardingSteps() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isRecordingOpen, setIsRecordingOpen] = useState(false);

  const handleStepComplete = (stepNum: number) => {
    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps([...completedSteps, stepNum]);
    }
  };

  const isStep1Done = completedSteps.includes(1);
  const isStep2Done = completedSteps.includes(2);
  const isStep3Done = completedSteps.includes(3);
  const isStep4Done = completedSteps.includes(4);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 text-slate-300 font-medium text-xs">
        <User size={15} className="text-slate-400" />
        <span>Finish your account setup - {completedSteps.length}/4</span>
      </div>

      {/* Steps 4-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Step 1: Create Digital Twin */}
        <div
          className={`relative rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
            !isStep1Done
              ? "bg-[#0f1424] border border-blue-500/70 shadow-[0_0_20px_rgba(59,130,246,0.12)] hover:border-blue-400"
              : "bg-[#0d1220] border border-emerald-500/40"
          }`}
        >
          <div>
            {/* Top row */}
            <div className="flex items-center justify-between mb-3.5">
              {isStep1Done ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <div className="w-4.5 h-4.5 rounded-full border-2 border-blue-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
              )}
              <span className="text-[11px] font-bold tracking-wider text-blue-400">
                STEP 1
              </span>
            </div>

            {/* Title & Icon */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <User size={13} />
              </div>
              <h4 className="text-white font-semibold text-xs tracking-tight">
                Create Digital Twin
              </h4>
            </div>

            {/* Description */}
            <p className="text-[11px] leading-relaxed text-slate-400 mb-4 font-normal">
              Just 15 seconds, and don't worry about the background or outfit. This step captures how you move; everything else can be changed later.
            </p>
          </div>

          {/* Action Button */}
          {!isStep1Done ? (
            <button
              onClick={() => setIsRecordingOpen(true)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Start Recording
            </button>
          ) : (
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 py-1">
              <CheckCircle2 size={13} /> Digital Twin ready
            </div>
          )}
        </div>

        {/* Step 2: Polish your Voice */}
        <div
          className={`relative rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
            isStep1Done
              ? "bg-[#0f1424] border border-blue-500/50 hover:border-blue-400 cursor-pointer"
              : "bg-[#0b0f1a] border border-[#182238] opacity-90"
          }`}
          onClick={() => {
            if (isStep1Done) handleStepComplete(2);
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              {isStep2Done ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <Circle size={17} className="text-slate-600" />
              )}
              <span className="text-[11px] font-bold tracking-wider text-slate-500">
                STEP 2
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Mic2 size={13} />
              </div>
              <h4 className="text-white font-semibold text-xs tracking-tight">
                Polish your Voice
              </h4>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400 mb-4 font-normal">
              Hear the clone we made from your footage, or record a cleaner sample and re-clone.
            </p>
          </div>

          <div className="text-[11px] text-blue-400 font-medium py-1">
            {isStep2Done ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Voice Cloned
              </span>
            ) : (
              "Unlocks after step 1"
            )}
          </div>
        </div>

        {/* Step 3: Create a Look */}
        <div
          className={`relative rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
            isStep1Done
              ? "bg-[#0f1424] border border-emerald-500/50 hover:border-emerald-400 cursor-pointer"
              : "bg-[#0b0f1a] border border-[#182238] opacity-90"
          }`}
          onClick={() => {
            if (isStep1Done) handleStepComplete(3);
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              {isStep3Done ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <Circle size={17} className="text-slate-600" />
              )}
              <span className="text-[11px] font-bold tracking-wider text-emerald-400">
                STEP 3
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Sparkles size={13} />
              </div>
              <h4 className="text-white font-semibold text-xs tracking-tight">
                Create a Look
              </h4>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400 mb-4 font-normal">
              New outfits and scenes from one prompt, and your face stays locked.
            </p>
          </div>

          <div className="text-[11px] text-emerald-400 font-medium py-1">
            {isStep3Done ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Custom Looks generated
              </span>
            ) : (
              "Unlocks after step 1"
            )}
          </div>
        </div>

        {/* Step 4: Make your first video */}
        <div
          className={`relative rounded-2xl p-4.5 flex flex-col justify-between transition-all duration-300 ${
            isStep2Done || isStep3Done
              ? "bg-[#0f1424] border border-purple-500/50 hover:border-purple-400 cursor-pointer"
              : "bg-[#0b0f1a] border border-[#182238] opacity-90"
          }`}
          onClick={() => {
            if (isStep2Done || isStep3Done) handleStepComplete(4);
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              {isStep4Done ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <Circle size={17} className="text-slate-600" />
              )}
              <span className="text-[11px] font-bold tracking-wider text-purple-400">
                STEP 4
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Video size={13} />
              </div>
              <h4 className="text-white font-semibold text-xs tracking-tight">
                Make your first video
              </h4>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400 mb-4 font-normal">
              Start from a script, a prompt, or scene by scene in AI Studio.
            </p>
          </div>

          <div className="text-[11px] text-purple-400 font-medium py-1">
            {isStep4Done ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} /> Video Created!
              </span>
            ) : (
              "Unlocks after step 2 or 3"
            )}
          </div>
        </div>
      </div>

      {/* Recording Modal Component */}
      <RecordingModal
        isOpen={isRecordingOpen}
        onClose={() => setIsRecordingOpen(false)}
        onSuccess={() => handleStepComplete(1)}
      />
    </div>
  );
}
