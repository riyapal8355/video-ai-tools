"use client";

import React, { useState, useRef } from "react";
import {
  UserPlus,
  Sparkles,
  ArrowRight,
  Video,
  Image as ImageIcon,
  Play,
  Search,
  Filter,
  Check,
  ChevronRight,
  ExternalLink,
  Crown,
  Upload,
  X,
  Wand2,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";
import CreateAvatarWizard from "./CreateAvatarWizard";

interface PublicAvatar {
  id: string;
  name: string;
  category: string;
  attire: string;
  tag: string;
  avatarEmoji: string;
  imageSrc?: string;
  gender: "Female" | "Male";
  bgGradient: string;
}

const publicAvatarsList: PublicAvatar[] = [
  {
    id: "emma_prof",
    name: "Emma in Navy Blazer",
    category: "Corporate",
    attire: "Business Professional",
    tag: "Studio",
    avatarEmoji: "👩🏼‍💼",
    imageSrc: "/avatars/emma.jpg",
    gender: "Female",
    bgGradient: "from-blue-900/40 via-indigo-950 to-[#0c101c]",
  },
  {
    id: "riya_casual",
    name: "Riya - Casual Modern",
    category: "Creator",
    attire: "Modern Casual",
    tag: "Instant",
    avatarEmoji: "👩🏽‍💼",
    imageSrc: "/avatars/riya.jpg",
    gender: "Female",
    bgGradient: "from-purple-900/40 via-slate-900 to-[#0c101c]",
  },
  {
    id: "alex_tech",
    name: "Alex in Tech Hoodie",
    category: "Software",
    attire: "Casual Hoodie",
    tag: "Studio",
    avatarEmoji: "👨🏻‍💻",
    imageSrc: "/avatars/alex.jpg",
    gender: "Male",
    bgGradient: "from-cyan-900/40 via-blue-950 to-[#0c101c]",
  },
  {
    id: "sarah_health",
    name: "Dr. Sarah Miller",
    category: "Healthcare",
    attire: "Medical Coat",
    tag: "Studio",
    avatarEmoji: "👩🏻‍⚕️",
    imageSrc: "/avatars/sarah.jpg",
    gender: "Female",
    bgGradient: "from-teal-900/40 via-slate-900 to-[#0c101c]",
  },
  {
    id: "marcus_suit",
    name: "Marcus Executive",
    category: "Executive",
    attire: "Formal Tuxedo",
    tag: "Photo",
    avatarEmoji: "👨🏾‍💼",
    imageSrc: "/avatars/marcus.jpg",
    gender: "Male",
    bgGradient: "from-amber-900/40 via-slate-900 to-[#0c101c]",
  },
  {
    id: "chloe_creative",
    name: "Chloe Vlogger",
    category: "Social Media",
    attire: "Streetwear",
    tag: "Instant",
    avatarEmoji: "👩🏼",
    imageSrc: "/avatars/riya.jpg",
    gender: "Female",
    bgGradient: "from-fuchsia-900/40 via-purple-950 to-[#0c101c]",
  },
];

export default function AvatarsManager({
  onOpenStudio,
}: {
  onOpenStudio?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"my_avatars" | "public_avatars">("my_avatars");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isNewAvatarMode, setIsNewAvatarMode] = useState(false);
  const [isVirtualModalOpen, setIsVirtualModalOpen] = useState(false);
  const [characterPrompt, setCharacterPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customAvatars, setCustomAvatars] = useState<any[]>([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAvatars = async () => {
    try {
      setIsLoadingAvatars(true);
      const res = await fetch("/api/v2/avatars");
      if (res.ok) {
        const data = await res.json();
        const all: any[] = data.avatars || [];
        setCustomAvatars(all.filter((a) => a.category === "Custom" || a.type === "instant" || a.type === "photo"));
      }
    } catch (e) {
      console.error("Failed to load custom avatars:", e);
    } finally {
      setIsLoadingAvatars(false);
    }
  };

  React.useEffect(() => {
    fetchAvatars();
  }, []);

  if (isWizardOpen) {
    return (
      <CreateAvatarWizard
        onBack={() => setIsWizardOpen(false)}
        onSuccess={() => {
          setIsWizardOpen(false);
          fetchAvatars();
        }}
      />
    );
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none relative">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={() => {
          alert("Photo uploaded! Synthesizing photo avatar motion.");
        }}
      />

      {/* 1. TOP HEADER & TABS BAR */}
      <div className="w-full px-8 pt-6 pb-4 flex items-center justify-between border-b border-[#141b2c] z-20">
        {/* Tabs: My Avatars & Public Avatars */}
        {!isNewAvatarMode ? (
          <div className="flex items-center gap-8 text-base font-bold">
            <button
              onClick={() => setActiveTab("my_avatars")}
              className={`transition-colors relative pb-2 cursor-pointer ${
                activeTab === "my_avatars"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              My Avatars
              {activeTab === "my_avatars" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("public_avatars")}
              className={`transition-colors relative pb-2 cursor-pointer ${
                activeTab === "public_avatars"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Public Avatars
              {activeTab === "public_avatars" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>
          </div>
        ) : (
          <div></div>
        )}

        {/* Right Actions: New Avatar & Ask Rhys OR Close Button */}
        <div className="flex items-center gap-3">
          {!isNewAvatarMode ? (
            <>
              <button
                onClick={() => setIsNewAvatarMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#121828] hover:bg-[#1a243c] border border-[#243354] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <UserPlus size={15} />
                <span>New Avatar</span>
              </button>

              <AskRhysWidget />
            </>
          ) : (
            <button
              onClick={() => setIsNewAvatarMode(false)}
              className="w-9 h-9 rounded-full border border-[#22304d] hover:bg-[#18233a] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN CONTENT VIEW */}
      {activeTab === "my_avatars" && customAvatars.length > 0 && !isNewAvatarMode ? (
        <div className="max-w-6xl w-full mx-auto px-8 py-8 flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                My Custom Avatars ({customAvatars.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Trained AI personas authorized with verified consent records.
              </p>
            </div>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Create New Avatar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {customAvatars.map((av) => (
              <div
                key={av.id}
                className="bg-white dark:bg-[#0c111e] border border-slate-200 dark:border-[#1d273f] hover:border-cyan-400 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group"
              >
                <div className="aspect-[3/4] bg-gradient-to-tr from-blue-900/30 to-purple-900/30 relative flex items-center justify-center overflow-hidden">
                  {av.thumbnailUrl ? (
                    <img src={av.thumbnailUrl} alt={av.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-6xl">👩‍💼</span>
                  )}
                  <span className="absolute top-2 left-2 text-[9px] font-bold bg-emerald-500/90 text-white px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Ready
                  </span>
                  <span className="absolute top-2 right-2 text-[9px] font-bold bg-black/60 text-cyan-300 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    Consent ✓
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {av.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {av.attire || "Custom Persona"} • {av.gender}
                  </p>
                  <button
                    onClick={() => {
                      if (onOpenStudio) onOpenStudio();
                    }}
                    className="w-full mt-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Open in Studio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "my_avatars" || isNewAvatarMode ? (
        <div className="max-w-5xl w-full mx-auto px-6 py-10 flex flex-col items-center justify-center flex-1">
          {/* Main Hero Header (Matches Screenshot) */}
          <div className="text-center mb-9">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              {isNewAvatarMode ? "Create a new avatar" : "Create Your First Avatar"}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Create an identity that looks, moves, and sounds consistently in any outfit and setting.{" "}
              <button
                onClick={() => alert("Opening avatar creation guide & best practices...")}
                className="text-slate-700 dark:text-slate-300 underline underline-offset-4 hover:text-blue-500 transition-colors"
              >
                View the guide
              </button>
            </p>
          </div>

          {/* 2 Big Choice Cards Grid (Matches Screenshot) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* Card 1: Clone a real person */}
            <div
              onClick={() => setIsWizardOpen(true)}
              className="bg-white dark:bg-[#0c111e] border border-slate-200 dark:border-[#1d273f] hover:border-cyan-400 dark:hover:border-cyan-500/70 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 flex flex-col cursor-pointer group"
            >
              {/* Visual Banner Header with Modern Photo Collage Mask */}
              <div className="h-56 bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 dark:from-[#111728] dark:via-[#162035] dark:to-[#0d1222] relative overflow-hidden flex items-center justify-center">
                {/* Triangular Collage Overlays with Real Faces Mock */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 p-4">
                  {/* Left Persona */}
                  <div className="w-28 h-36 rounded-2xl bg-gradient-to-b from-blue-400/20 to-blue-900/40 border border-blue-400/40 flex items-center justify-center text-4xl shadow-lg transform -rotate-6 group-hover:-rotate-8 transition-transform">
                    👨🏼‍💼
                  </div>
                  {/* Center Persona */}
                  <div className="w-32 h-44 rounded-2xl bg-gradient-to-b from-purple-400/30 to-purple-900/50 border border-cyan-400/60 flex items-center justify-center text-5xl shadow-2xl z-10 group-hover:scale-105 transition-transform">
                    👩🏼‍💼
                  </div>
                  {/* Right Persona */}
                  <div className="w-28 h-36 rounded-2xl bg-gradient-to-b from-emerald-400/20 to-emerald-900/40 border border-emerald-400/40 flex items-center justify-center text-4xl shadow-lg transform rotate-6 group-hover:rotate-8 transition-transform">
                    👩🏽‍💼
                  </div>
                </div>

                <div className="absolute top-2 left-1/4 w-32 h-32 rounded-full border-2 border-cyan-400/30 pointer-events-none"></div>
                <div className="absolute bottom-2 right-1/4 w-32 h-32 rounded-full border-2 border-purple-400/30 pointer-events-none"></div>
              </div>

              {/* Text Body */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white dark:bg-[#0c111e]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                      Clone a real person
                    </h3>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-500/30 px-2 py-0.5 rounded-md">
                      Avatar V
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Use real video footage to create an avatar that looks, moves, and sounds like you.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#19243d] flex items-center justify-between text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                  <span>Start recording or upload video</span>
                  <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 2: Create a virtual character (with Upload photo & Design with AI buttons matching Screenshot) */}
            <div
              className={`bg-white dark:bg-[#0c111e] rounded-3xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col relative group ${
                isNewAvatarMode
                  ? "border-2 border-cyan-400 dark:border-cyan-400 shadow-2xl shadow-cyan-500/15"
                  : "border border-slate-200 dark:border-[#1d273f] hover:border-purple-400 dark:hover:border-purple-500/70"
              }`}
            >
              {/* Visual Banner Header with Overlay Action Buttons */}
              <div className="h-56 bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 dark:from-[#151022] dark:via-[#1e1533] dark:to-[#0d0a17] relative overflow-hidden flex items-center justify-center">
                {/* Visual Collage representing 3D Virtual Characters */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 p-4 opacity-75">
                  <div className="w-28 h-36 rounded-2xl bg-gradient-to-b from-amber-400/20 to-amber-900/40 border border-amber-400/40 flex items-center justify-center text-4xl shadow-lg transform -rotate-6">
                    🧝‍♂️
                  </div>
                  <div className="w-32 h-44 rounded-2xl bg-gradient-to-b from-indigo-400/30 to-indigo-900/50 border border-purple-400/60 flex items-center justify-center text-5xl shadow-2xl z-10">
                    🧙‍♂️
                  </div>
                  <div className="w-28 h-36 rounded-2xl bg-gradient-to-b from-cyan-400/20 to-cyan-900/40 border border-cyan-400/40 flex items-center justify-center text-4xl shadow-lg transform rotate-6">
                    🤖
                  </div>
                </div>

                {/* Overlay Action Buttons (Matches Screenshot Exactly) */}
                <div className="relative z-20 flex flex-col items-center gap-3 w-full px-8">
                  {/* Upload photo button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-[210px] py-2.5 px-5 bg-slate-900/90 hover:bg-slate-900 dark:bg-black/85 dark:hover:bg-black text-white text-xs font-bold rounded-full backdrop-blur-md shadow-xl border border-white/10 flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Upload photo</span>
                  </button>

                  {/* Design with AI button */}
                  <button
                    onClick={() => setIsVirtualModalOpen(true)}
                    className="w-full max-w-[210px] py-2.5 px-5 bg-slate-900/90 hover:bg-slate-900 dark:bg-black/85 dark:hover:bg-black text-white text-xs font-bold rounded-full backdrop-blur-md shadow-xl border border-white/10 flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
                  >
                    <Wand2 size={14} />
                    <span>Design with AI</span>
                  </button>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white dark:bg-[#0c111e]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                      Create a virtual character
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Start with an image, and bring it to life with unique motion and voice.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Switch to Public Avatars Link */}
          {!isNewAvatarMode && (
            <div className="mt-10">
              <button
                onClick={() => setActiveTab("public_avatars")}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer group"
              >
                <span>Try a Public Avatar</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* PUBLIC AVATARS GALLERY VIEW */
        <div className="max-w-6xl w-full mx-auto px-8 py-6 flex-1">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {["All", "Corporate", "Software", "Healthcare", "Creator", "Social Media"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white"
                      : "bg-slate-100 dark:bg-[#121828] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search avatars..."
                className="w-full bg-slate-100 dark:bg-[#121828] border border-slate-200 dark:border-[#1e2a44] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Avatars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {publicAvatarsList
              .filter((av) => selectedCategory === "All" || av.category === selectedCategory)
              .map((avatar) => (
                <div
                  key={avatar.id}
                  className="bg-white dark:bg-[#0d1222] border border-slate-200 dark:border-[#1d273f] hover:border-cyan-400 dark:hover:border-cyan-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group cursor-pointer"
                >
                  <div
                    className={`aspect-[3/4] bg-gradient-to-b ${avatar.bgGradient} relative flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300`}
                  >
                    {avatar.imageSrc ? (
                      <img src={avatar.imageSrc} alt={avatar.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl drop-shadow-xl">{avatar.avatarEmoji}</span>
                    )}
                    <span className="absolute top-2 left-2 text-[9px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {avatar.tag}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#0d1222]">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {avatar.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {avatar.attire}
                    </p>

                    <button
                      onClick={() => {
                        if (onOpenStudio) onOpenStudio();
                        alert(`Avatar "${avatar.name}" selected! Opening Studio.`);
                      }}
                      className="w-full mt-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Use Avatar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Virtual Character Generation Modal */}
      {isVirtualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0e1322] text-slate-900 dark:text-white rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#22304f]">
            <h3 className="text-lg font-bold mb-1">Create Virtual AI Character</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Describe the character you want to bring to life with voice and expressive gestures.
            </p>

            <textarea
              rows={3}
              value={characterPrompt}
              onChange={(e) => setCharacterPrompt(e.target.value)}
              placeholder="e.g. A friendly 3D Pixar-style robotic character with expressive glowing blue eyes..."
              className="w-full bg-slate-50 dark:bg-[#121828] border border-slate-200 dark:border-[#22304d] rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 mb-4"
            ></textarea>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setIsVirtualModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#18233a] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("Generating virtual 3D character with animated lip-sync...");
                  setIsVirtualModalOpen(false);
                }}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Generate Character
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
