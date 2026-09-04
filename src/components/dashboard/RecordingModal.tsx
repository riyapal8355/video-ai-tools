"use client";

import React, { useState } from "react";
import { Camera, Mic, Play, CheckCircle2, X, RefreshCw, Sparkles, Video } from "lucide-react";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RecordingModal({ isOpen, onClose, onSuccess }: RecordingModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(15);
  const [recorded, setRecorded] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    setIsRecording(true);
    let count = 15;
    const interval = setInterval(() => {
      count -= 1;
      setSeconds(count);
      if (count <= 0) {
        clearInterval(interval);
        setIsRecording(false);
        setRecorded(true);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-xl bg-[#0d1222] border border-[#233152] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1c2742]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Create Digital Twin <Sparkles size={16} className="text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Record 15 seconds of speaking to train your photorealistic AI avatar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-[#19243d]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Viewport Simulated Preview */}
        <div className="mt-5 relative aspect-video bg-[#080b14] rounded-2xl border border-[#233152] overflow-hidden flex flex-col items-center justify-center group shadow-inner">
          {/* Facial Landmark Tracking Grid Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500/30 to-blue-500/30 border-2 border-dashed border-blue-400/80 flex items-center justify-center mb-3 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-[#162035] flex items-center justify-center text-3xl">
                👩‍💼
              </div>
            </div>
            {isRecording ? (
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
                Recording in progress: {seconds}s left
              </div>
            ) : recorded ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 size={18} />
                Footage captured successfully!
              </div>
            ) : (
              <p className="text-xs text-slate-300 max-w-sm">
                Position your face within the frame. Look directly at the camera and speak naturally.
              </p>
            )}
          </div>

          {/* Camera & Mic Badges */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <span className="bg-[#12192c]/90 border border-[#233152] text-[11px] text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Camera size={12} className="text-emerald-400" /> HD WebCam (Ready)
            </span>
            <span className="bg-[#12192c]/90 border border-[#233152] text-[11px] text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <Mic size={12} className="text-emerald-400" /> Mic Active
            </span>
          </div>
        </div>

        {/* Script Prompter */}
        <div className="mt-4 p-3 rounded-xl bg-[#111728] border border-[#1e2a47]">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Suggested prompt to read aloud:</p>
          <p className="text-xs text-slate-200 italic">
            "Hello! I am excited to introduce my AI avatar for creating high-impact videos effortlessly."
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#18233b] transition-all"
          >
            Cancel
          </button>

          {!recorded ? (
            <button
              onClick={handleStart}
              disabled={isRecording}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center gap-2 ${
                isRecording
                  ? "bg-rose-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25 cursor-pointer"
              }`}
            >
              {isRecording ? <RefreshCw className="animate-spin" size={14} /> : <Video size={15} />}
              {isRecording ? `Recording (${seconds}s)...` : "Start Recording"}
            </button>
          ) : (
            <button
              onClick={() => {
                if (onSuccess) onSuccess();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={15} /> Save & Generate Digital Twin
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
