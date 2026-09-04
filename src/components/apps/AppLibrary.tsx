"use client";

import React, { useState } from "react";
import {
  Mic,
  Video,
  Sparkles,
  Languages,
  Film,
  FileText,
  PlaySquare,
  Scissors,
  TrendingUp,
  ShoppingBag,
  UserCheck,
  RefreshCw,
  Image as ImageIcon,
  Volume2,
  MousePointerClick,
  MessageSquare,
  Search,
  ArrowRight,
  X,
  Play,
  Upload,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";
import FeaturedAppModals from "./FeaturedAppModals";

interface AppItem {
  id: string;
  name: string;
  description: string;
  category: "create" | "enhance" | "edit" | "interactive";
  icon: React.ReactNode;
  modalTitle: string;
  modalDescription: string;
}

const allAppsList: AppItem[] = [
  {
    id: "app_podcast",
    name: "Video Podcast",
    description: "Generate a podcast video with multiple ...",
    category: "create",
    icon: <Mic size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "AI Video Podcast Studio",
    modalDescription: "Generate multi-speaker video podcasts with automatic speaker switching, camera cuts, and mic waveforms.",
  },
  {
    id: "app_studio",
    name: "AI Studio",
    description: "Create and produce professional avatar...",
    category: "create",
    icon: <Video size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "VidoAI Studio Editor",
    modalDescription: "Full multi-scene video timeline with custom canvas layouts, script synchronization, and 4K exports.",
  },
  {
    id: "app_agent",
    name: "Video Agent",
    description: "Describe your video and let an AI agent...",
    category: "create",
    icon: <Sparkles size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "AI Video Agent Copilot",
    modalDescription: "Give a one-sentence prompt and the AI agent writes the script, selects avatars, generates scenes, and edits the video.",
  },
  {
    id: "app_translate",
    name: "Translate Videos",
    description: "Convert any video into 175+ languages",
    category: "enhance",
    icon: <Languages size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "AI Video Translation & Lip-Sync",
    modalDescription: "Translate video audio into 175+ languages while preserving the original speaker's authentic voice timbre and adjusting lip movements.",
  },
  {
    id: "app_shots",
    name: "Avatar Shots",
    description: "AI-powered cinematic, film-quali...",
    category: "create",
    icon: <Film size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Cinematic Avatar Shots",
    modalDescription: "Generate Hollywood-grade closeups, over-the-shoulder angles, and walking shots for high-production value commercials.",
  },
  {
    id: "app_pdf",
    name: "PPT/PDF to Video",
    description: "Transform documents into engaging avatar...",
    category: "create",
    icon: <FileText size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Document to Video Converter",
    modalDescription: "Upload any PowerPoint slide deck or PDF report. AI turns each page into an interactive video scene presented by your chosen avatar.",
  },
  {
    id: "app_generator",
    name: "AI Video Genera...",
    description: "Create AI-generated video clips for your...",
    category: "create",
    icon: <PlaySquare size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Generative Video Engine",
    modalDescription: "Turn text prompts into high-motion B-roll backgrounds, dynamic cinematic cuts, and photorealistic environments.",
  },
  {
    id: "app_clipping",
    name: "AI Clipping",
    description: "Add a longer video and AI will create...",
    category: "edit",
    icon: <Scissors size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Viral Shorts & Reels Clipper",
    modalDescription: "Upload long webinars, interviews, or YouTube videos. AI finds the most viral moments, crops to 9:16 vertical, and adds animated captions.",
  },
  {
    id: "app_upscale",
    name: "Upscale Video",
    description: "Create high resolution outputs from your...",
    category: "enhance",
    icon: <TrendingUp size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "AI 4K Video Upscaler",
    modalDescription: "Restore low-res videos to crystal clear 4K resolution with neural artifact removal and facial detail enhancement.",
  },
  {
    id: "app_product",
    name: "Product Placem...",
    description: "Create a video ad showcasing your...",
    category: "create",
    icon: <ShoppingBag size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "E-Commerce Product Placement",
    modalDescription: "Place your physical 3D product or software mockup directly into the avatar's hands with realistic physics and lighting.",
  },
  {
    id: "app_batch",
    name: "Batch Mode",
    description: "Create multiple avatar videos at once from ...",
    category: "create",
    icon: <UserCheck size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Personalized Batch Generator",
    modalDescription: "Connect CSV spreadsheet variables (Customer Name, Company, City) to generate 1,000s of personalized outreach videos in minutes.",
  },
  {
    id: "app_faceswap",
    name: "Face Swap",
    description: "Make any avatar your own by swapping yo...",
    category: "enhance",
    icon: <RefreshCw size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Avatar Face Swap Studio",
    modalDescription: "Upload a single front-facing photo to swap facial features onto any body, wardrobe, or custom environment.",
  },
  {
    id: "app_images",
    name: "Generate Images",
    description: "Create AI-generated images for your vide...",
    category: "create",
    icon: <ImageIcon size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "AI Media Generator",
    modalDescription: "Synthesize bespoke photographic backgrounds, illustration graphics, and brand assets directly inside the video studio.",
  },
  {
    id: "app_speech",
    name: "Speech Cleanup",
    description: "Remove unwanted pauses and words...",
    category: "enhance",
    icon: <Volume2 size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Studio Audio Cleanup Engine",
    modalDescription: "One-click noise removal: eliminate room reverberation, breathing noises, 'ums', and 'uhs' to achieve broadcast studio clarity.",
  },
  {
    id: "app_interactive",
    name: "Interactive Video",
    description: "Create branching, interactive video...",
    category: "interactive",
    icon: <MousePointerClick size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "Branching Interactive Funnels",
    modalDescription: "Add interactive buttons, clickable cards, quiz questions, and Calendly embeds directly onto playing video timelines.",
  },
  {
    id: "app_live",
    name: "LiveAvatar",
    description: "Build real-time, interactive avatar...",
    category: "interactive",
    icon: <MessageSquare size={18} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />,
    modalTitle: "LiveAvatar Real-Time Agent",
    modalDescription: "Connect WebRTC low-latency streaming to power real-time AI avatars for customer support, sales demos, and interactive kiosks.",
  },
];

interface AppLibraryProps {
  onOpenStudio?: () => void;
}

export default function AppLibrary({ onOpenStudio }: AppLibraryProps) {
  const [activeTab, setActiveTab] = useState<"all" | "create" | "enhance" | "edit" | "interactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [activeFeaturedModal, setActiveFeaturedModal] = useState<"generator" | "podcast" | "speech" | null>(null);

  const filteredApps = allAppsList.filter((app) => {
    const matchesCategory = activeTab === "all" || app.category === activeTab;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none relative">
      {/* 1. TOP HEADER (Exact Screenshot Match) */}
      <div className="w-full px-10 pt-7 pb-4 flex items-center justify-between border-b border-[#141b2c] z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            App Library
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Use HeyGen Apps to up-level your creative process
          </p>
        </div>

        <AskRhysWidget />
      </div>

      {/* 2. MAIN SCROLLABLE CONTAINER */}
      <div className="max-w-7xl w-full mx-auto px-10 py-6 flex-1 space-y-8 pb-16">
        {/* FEATURED APPS SECTION (Top 3 Interactive Cards) */}
        <div>
          <h2 className="text-sm font-bold text-white mb-4">Featured Apps</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: AI Video Generator (Torii Gate at sunset) */}
            <div
              onClick={() => setActiveFeaturedModal("generator")}
              className="group aspect-[16/11] rounded-3xl overflow-hidden relative border border-[#1e2a44] shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/50"
            >
              <img
                src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop"
                alt="AI Video Generator"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-black text-[#F4D06F] tracking-tight leading-tight mb-2 drop-shadow-md">
                  AI Video<br />Generator
                </h3>
                <span className="text-xs font-bold text-white group-hover:text-amber-400 flex items-center gap-1 transition-colors">
                  Create now →
                </span>
              </div>
            </div>

            {/* Card 2: Video Podcast (Neon studio stairs & boom mics) */}
            <div
              onClick={() => setActiveFeaturedModal("podcast")}
              className="group aspect-[16/11] rounded-3xl overflow-hidden relative border border-[#1e2a44] shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-cyan-500/50"
            >
              <img
                src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=800&auto=format&fit=crop"
                alt="Video Podcast"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-black text-[#67E8F9] tracking-tight leading-tight mb-2 drop-shadow-md">
                  Video<br />Podcast
                </h3>
                <span className="text-xs font-bold text-white group-hover:text-cyan-400 flex items-center gap-1 transition-colors">
                  Create now →
                </span>
              </div>
            </div>

            {/* Card 3: Speech Cleanup (3D geometric ribbon waves) */}
            <div
              onClick={() => setActiveFeaturedModal("speech")}
              className="group aspect-[16/11] rounded-3xl overflow-hidden relative border border-[#1e2a44] shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-yellow-500/50"
            >
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
                alt="Speech Cleanup"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-black text-[#FDE047] tracking-tight leading-tight mb-2 drop-shadow-md">
                  Speech<br />Cleanup
                </h3>
                <span className="text-xs font-bold text-white group-hover:text-yellow-400 flex items-center gap-1 transition-colors">
                  Create now →
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TABS & SEARCH ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-b border-[#141b2c] pb-3">
          {/* Sub-Tabs */}
          <div className="flex items-center gap-6 text-xs font-bold">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2 transition-colors cursor-pointer relative ${
                activeTab === "all"
                  ? "text-white font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Apps
              {activeTab === "all" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`pb-2 transition-colors cursor-pointer relative ${
                activeTab === "create"
                  ? "text-white font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create
              {activeTab === "create" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("enhance")}
              className={`pb-2 transition-colors cursor-pointer relative ${
                activeTab === "enhance"
                  ? "text-white font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Enhance
              {activeTab === "enhance" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("edit")}
              className={`pb-2 transition-colors cursor-pointer relative ${
                activeTab === "edit"
                  ? "text-white font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Edit
              {activeTab === "edit" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("interactive")}
              className={`pb-2 transition-colors cursor-pointer relative ${
                activeTab === "interactive"
                  ? "text-white font-extrabold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Interactive
              {activeTab === "interactive" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-64">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Apps"
              className="w-full bg-[#111728] border border-[#1e2a44] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>
        </div>

        {/* 4. 16-APP ROUNDED PILL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-[#0c111e] hover:bg-[#131b2e] border border-[#1c2740] hover:border-cyan-500/60 rounded-full p-2.5 px-4 flex items-center gap-3.5 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="w-10 h-10 rounded-full bg-[#151e33] border border-[#223152] flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-cyan-500/50 transition-all shadow-sm">
                {app.icon}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                  {app.name}
                </h3>
                <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                  {app.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURED APPS DEDICATED STUDIOS & MODALS */}
      <FeaturedAppModals
        activeModal={activeFeaturedModal}
        onClose={() => setActiveFeaturedModal(null)}
        onOpenStudio={onOpenStudio}
      />

      {/* APP LAUNCH / INSPECTOR MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#151e33] border border-[#223152] flex items-center justify-center">
                  {selectedApp.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedApp.modalTitle}</h3>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                    {selectedApp.category} Engine
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              {selectedApp.modalDescription}
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1c2742]">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedApp(null);
                  if (onOpenStudio) onOpenStudio();
                }}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch in Studio Editor</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
