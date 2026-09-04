"use client";

import React, { useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  FolderClosed,
  LayoutTemplate,
  HelpCircle,
  Bell,
  Plus,
  Clapperboard,
  User,
  Mic,
  FileText,
  Image as ImageIcon,
  Type,
  Component,
  Music,
  Shuffle,
  Subtitles,
  Palette,
  Crown,
  Volume2,
  Maximize2,
  Lock,
  Eye,
  Scissors,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Layers,
} from "lucide-react";
import UserMenuDropdown from "../dashboard/UserMenuDropdown";

export default function VidoAIStudio({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(2.15);
  const [duration, setDuration] = useState(46.0);
  const [activeTab, setActiveTab] = useState<"scene" | "avatar" | "voice">("scene");
  const [activeLeftTool, setActiveLeftTool] = useState("scenes");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  const scenes = [
    { id: 1, title: "Emma Intro", duration: "00:08", label: "Scene 01" },
    { id: 2, title: "Tech Platform", duration: "00:07", label: "Scene 02" },
    { id: 3, title: "AI Powered Video", duration: "00:10", label: "Scene 03" },
    { id: 4, title: "Feature Showcase", duration: "00:12", label: "Scene 04" },
    { id: 5, title: "Thank You!", duration: "00:09", label: "Scene 05" },
  ];

  return (
    <div className="w-full h-screen bg-[#07090e] text-slate-200 flex flex-col overflow-hidden select-none">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="h-14 min-h-14 bg-[#0a0d16] border-b border-[#171f33] px-4 flex items-center justify-between z-30">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1c263e] text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
              title="Return to Home"
            >
              <ArrowLeft size={15} /> Dashboard
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              ▶
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">VidoAI</span>
              <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">Create. Edit. Inspire.</span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-[#1a243a]"></div>

          {/* Undo / Redo / Auto-Save */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button className="p-1 hover:text-white hover:bg-[#141b2c] rounded">
              <RotateCcw size={14} />
            </button>
            <button className="p-1 hover:text-white hover:bg-[#141b2c] rounded">
              <RotateCw size={14} />
            </button>
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] ml-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={11} /> Saved
            </span>
          </div>
        </div>

        {/* Center: Project Title */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            defaultValue="Product Explainer Video"
            className="bg-transparent hover:bg-[#121827] focus:bg-[#121827] border border-transparent hover:border-[#1e2a44] focus:border-blue-500 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none text-center"
          />
        </div>

        {/* Right: Aspect Ratio, Preview & Export */}
        <div className="flex items-center gap-3">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center gap-1 bg-[#101625] border border-[#1e2940] rounded-lg px-2.5 py-1 text-xs text-slate-300 cursor-pointer hover:border-slate-600">
            <span>{aspectRatio}</span>
            <ChevronDown size={13} />
          </div>

          {/* Preview Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 bg-[#121828] hover:bg-[#1a233a] border border-[#212e48] px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors"
          >
            {isPlaying ? <Pause size={13} className="text-blue-400" /> : <Play size={13} className="text-blue-400 fill-blue-400" />}
            <span>Preview</span>
          </button>

          {/* Export Button */}
          <button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all">
            Export
          </button>

          <div className="h-5 w-[1px] bg-[#1a243a]"></div>

          <button className="text-slate-400 hover:text-white p-1.5 hover:bg-[#141b2c] rounded-lg">
            <HelpCircle size={16} />
          </button>
          <button className="text-slate-400 hover:text-white p-1.5 hover:bg-[#141b2c] rounded-lg relative">
            <Bell size={16} />
            <span className="w-2 h-2 bg-blue-500 rounded-full absolute top-1 right-1"></span>
          </button>
          <UserMenuDropdown placement="top-bar" />
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Left Tools + Scenes + Canvas + Right Inspector) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOOL ICON RAIL */}
        <aside className="w-16 min-w-16 bg-[#090c15] border-r border-[#151c2d] flex flex-col justify-between py-3 select-none z-20">
          <div className="flex flex-col items-center gap-1">
            <button className="w-11 h-11 mb-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Plus size={18} />
            </button>

            {[
              { id: "scenes", label: "Scenes", icon: Clapperboard },
              { id: "avatar", label: "Avatar", icon: User },
              { id: "voice", label: "Voice", icon: Mic },
              { id: "script", label: "Script", icon: FileText },
              { id: "media", label: "Media", icon: ImageIcon },
              { id: "text", label: "Text", icon: Type },
              { id: "elements", label: "Elements", icon: Component },
              { id: "music", label: "Music", icon: Music },
              { id: "transitions", label: "Transitions", icon: Shuffle },
              { id: "captions", label: "Captions", icon: Subtitles },
              { id: "brand_kit", label: "Brand Kit", icon: Palette },
            ].map((tool) => {
              const Icon = tool.icon;
              const isActive = activeLeftTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveLeftTool(tool.id)}
                  className={`w-11 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] transition-colors ${
                    isActive
                      ? "bg-[#18233a] text-blue-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#101625]"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Credits Box */}
          <div className="p-1.5 flex flex-col items-center text-center">
            <div className="w-full bg-[#101626] border border-[#1a2640] rounded-xl p-2 mb-1">
              <span className="text-[9px] text-slate-400 block">AI Credits</span>
              <span className="text-[11px] font-bold text-white">850/1000</span>
              <div className="w-full h-1 bg-[#1c2742] rounded-full mt-1 overflow-hidden">
                <div className="w-[85%] h-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>
            </div>
            <button className="w-full py-1 text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-center gap-1 hover:bg-amber-500/20">
              <Crown size={11} /> Upgrade
            </button>
          </div>
        </aside>

        {/* SCENES THUMBNAILS STRIP */}
        <div className="w-44 min-w-44 bg-[#0a0d16] border-r border-[#151c2d] flex flex-col p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Scenes</span>
            <button className="p-1 text-slate-400 hover:text-white hover:bg-[#151d30] rounded">
              <Plus size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            {scenes.map((sc, idx) => (
              <div
                key={sc.id}
                onClick={() => setActiveSceneIndex(idx)}
                className={`relative rounded-xl p-2 cursor-pointer transition-all border ${
                  activeSceneIndex === idx
                    ? "bg-[#162035] border-blue-500 shadow-md shadow-blue-500/15"
                    : "bg-[#0e1322] border-[#1a233a] hover:border-[#283758]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-semibold text-slate-300">{sc.label}</span>
                  <span>{sc.duration}</span>
                </div>
                <div className="aspect-video bg-[#1a2236] rounded-lg overflow-hidden relative flex items-center justify-center border border-white/5">
                  <div className="text-xl">👩‍💼</div>
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black/70 px-1 rounded text-white">
                    {sc.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER VIDEO CANVAS & PLAYER */}
        <div className="flex-1 bg-[#06080d] flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Main Video Viewport Canvas */}
          <div className="relative w-full max-w-3xl aspect-video bg-[#0b0e18] rounded-2xl border border-[#1f2a44] shadow-2xl overflow-hidden flex flex-col items-center justify-center">
            {/* Background Studio Office Scene */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#12192c] via-[#0b101c] to-[#07090e]"></div>

            {/* Simulated AI Avatar in Scene */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-t from-transparent to-blue-500/10 flex items-center justify-center">
                <span className="text-8xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]">👩‍💼</span>
              </div>
            </div>

            {/* Overlay Badges and Text */}
            <div className="absolute left-8 bottom-12 z-20 max-w-sm">
              <div className="bg-blue-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md inline-block uppercase tracking-wider mb-2 shadow-lg">
                AI Video Creator
              </div>
              <h2 className="text-2xl font-extrabold text-white leading-tight drop-shadow-lg">
                Create Engaging Videos with AI Avatars
              </h2>
            </div>

            {/* Video Player Floating Bottom Control Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between z-30">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-all shadow-md cursor-pointer"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-white" />}
                </button>
                <span className="text-xs font-medium text-slate-300">
                  00:02.15 / 00:46.00
                </span>
              </div>

              {/* Scrubber preview slider */}
              <div className="flex-1 mx-6">
                <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden cursor-pointer relative">
                  <div className="w-[18%] h-full bg-blue-500 rounded-full"></div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300">
                <Volume2 size={16} className="hover:text-white cursor-pointer" />
                <Maximize2 size={16} className="hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL */}
        <aside className="w-72 min-w-72 bg-[#090d16] border-l border-[#151c2d] flex flex-col select-none">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#171f33]">
            {(["scene", "avatar", "voice"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold capitalize transition-all border-b-2 ${
                  activeTab === tab
                    ? "border-blue-500 text-white bg-[#111728]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Inspector Content */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scene Settings</h4>
              <button className="text-[11px] text-blue-400 hover:underline flex items-center gap-1">
                <Sliders size={12} /> Change Layout
              </button>
            </div>

            {/* Background Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">Background</label>
              <div className="p-2 bg-[#121828] border border-[#1e2a44] rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-xs">
                    🏢
                  </div>
                  <span className="text-xs font-medium text-white">Office Room</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>

            {/* Transition Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">Transition</label>
              <div className="p-2 bg-[#121828] border border-[#1e2a44] rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-600">
                <div className="flex items-center gap-2">
                  <Shuffle size={14} className="text-blue-400" />
                  <span className="text-xs font-medium text-white">Fade</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>

            {/* Duration Slider / Counter */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Duration</span>
                <span className="text-white font-bold">8.0s</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-[#121828] border border-[#1e2a44] text-white flex items-center justify-center font-bold">
                  -
                </button>
                <div className="flex-1 h-2 bg-[#172034] rounded-full overflow-hidden">
                  <div className="w-3/5 h-full bg-blue-500"></div>
                </div>
                <button className="w-8 h-8 rounded-lg bg-[#121828] border border-[#1e2a44] text-white flex items-center justify-center font-bold">
                  +
                </button>
              </div>
            </div>

            {/* Layers Section */}
            <div className="pt-3 border-t border-[#171f33]">
              <h5 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
                <Layers size={13} className="text-blue-400" /> Layers
              </h5>
              <div className="space-y-1.5">
                {[
                  { name: "AI VIDEO CREATOR", type: "T" },
                  { name: "Create Engaging Videos with AI Avatars", type: "T" },
                  { name: "Rectangle Badge", type: "▭" },
                ].map((layer, i) => (
                  <div
                    key={i}
                    className="p-2 bg-[#121828] border border-[#1a253d] rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-blue-400 font-bold">{layer.type}</span>
                      <span className="text-slate-200 truncate">{layer.name}</span>
                    </div>
                    <Eye size={13} className="text-slate-400 hover:text-white cursor-pointer ml-2" />
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-2 bg-[#141b2c] hover:bg-[#1a243c] border border-[#233150] rounded-xl text-xs font-semibold text-slate-200 transition-colors">
              Apply to All Scenes
            </button>
          </div>
        </aside>
      </div>

      {/* 3. MULTI-TRACK BOTTOM TIMELINE */}
      <div className="h-44 min-h-44 bg-[#080b12] border-t border-[#151c2d] flex flex-col select-none">
        {/* Timeline Action Bar */}
        <div className="h-9 bg-[#0b0e18] border-b border-[#151c2d] px-4 flex items-center justify-between text-slate-400 text-xs">
          <div className="flex items-center gap-3">
            <button className="hover:text-white p-1">
              <RotateCcw size={13} />
            </button>
            <button className="hover:text-white p-1">
              <RotateCw size={13} />
            </button>
            <div className="h-4 w-[1px] bg-[#1a243a]"></div>
            <button className="hover:text-white p-1" title="Split clip">
              <Scissors size={13} />
            </button>
            <button className="hover:text-white p-1" title="Delete">
              <Trash2 size={13} />
            </button>
            <button className="hover:text-white p-1" title="Duplicate">
              <Copy size={13} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">Zoom:</span>
            <input type="range" className="w-24 accent-blue-500 h-1 bg-[#1a243a] rounded-lg" />
          </div>
        </div>

        {/* Tracks Container */}
        <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
          {/* Left Track Labels */}
          <div className="w-36 min-w-36 bg-[#090d16] border-r border-[#151c2d] flex flex-col py-1 text-[11px] text-slate-400">
            <div className="h-7 px-3 flex items-center justify-between border-b border-[#131929]">
              <span>🎬 Video</span>
              <div className="flex gap-1">
                <Lock size={11} />
                <Eye size={11} />
              </div>
            </div>
            <div className="h-7 px-3 flex items-center justify-between border-b border-[#131929]">
              <span>👤 Avatar</span>
              <div className="flex gap-1">
                <Lock size={11} />
                <Eye size={11} />
              </div>
            </div>
            <div className="h-7 px-3 flex items-center justify-between border-b border-[#131929]">
              <span>🔤 Text</span>
              <div className="flex gap-1">
                <Lock size={11} />
                <Eye size={11} />
              </div>
            </div>
            <div className="h-7 px-3 flex items-center justify-between">
              <span>🎵 Audio</span>
              <div className="flex gap-1">
                <Lock size={11} />
                <Eye size={11} />
              </div>
            </div>
          </div>

          {/* Right Track Timeline Lanes */}
          <div className="flex-1 flex flex-col py-1 relative min-w-[700px] bg-[#07090f]">
            {/* Timeline Playhead Needle */}
            <div className="absolute top-0 bottom-0 left-[18%] w-[2px] bg-blue-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(59,130,246,0.8)]">
              <div className="w-3 h-3 bg-blue-500 transform -translate-x-[5px] rotate-45 rounded-xs"></div>
            </div>

            {/* Video Track */}
            <div className="h-7 px-2 flex items-center gap-1 border-b border-[#131929]">
              <div className="w-24 h-5.5 bg-blue-900/40 border border-blue-500/50 rounded text-[10px] text-blue-200 px-2 flex items-center truncate">
                Clip 1 (0:08)
              </div>
              <div className="w-28 h-5.5 bg-blue-900/40 border border-blue-500/50 rounded text-[10px] text-blue-200 px-2 flex items-center truncate">
                Clip 2 (0:07)
              </div>
              <div className="w-36 h-5.5 bg-blue-900/40 border border-blue-500/50 rounded text-[10px] text-blue-200 px-2 flex items-center truncate">
                Clip 3 (0:10)
              </div>
            </div>

            {/* Avatar Track */}
            <div className="h-7 px-2 flex items-center gap-1 border-b border-[#131929]">
              <div className="w-80 h-5.5 bg-purple-900/50 border border-purple-500/60 rounded text-[10px] text-purple-200 px-2 flex items-center truncate font-medium">
                Emma - Professional (AI Avatar)
              </div>
            </div>

            {/* Text Track */}
            <div className="h-7 px-2 flex items-center gap-1 border-b border-[#131929]">
              <div className="w-28 h-5.5 bg-emerald-900/40 border border-emerald-500/50 rounded text-[10px] text-emerald-200 px-2 flex items-center truncate">
                AI VIDEO CREATOR
              </div>
              <div className="w-48 h-5.5 bg-emerald-900/40 border border-emerald-500/50 rounded text-[10px] text-emerald-200 px-2 flex items-center truncate">
                Create Engaging Videos
              </div>
            </div>

            {/* Audio Waveform Track */}
            <div className="h-7 px-2 flex items-center gap-1">
              <div className="w-96 h-5.5 bg-indigo-950/60 border border-indigo-500/40 rounded text-[10px] text-indigo-300 px-2 flex items-center justify-between">
                <span>🎙️ Voice Over (Emma AI - Neutral)</span>
                <span className="opacity-70">~~~~~~~~~</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
