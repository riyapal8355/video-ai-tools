"use client";

import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Clapperboard,
  Play,
  Clock,
  Layers,
  Check,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";
import TemplatePreviewModal, {
  VideoTemplate,
  samplePromptCourseTemplate,
} from "./TemplatePreviewModal";

const templatesList: VideoTemplate[] = [
  samplePromptCourseTemplate,
  {
    id: "template_b2b_saas",
    title: "B2B SaaS Product Demo Walkthrough",
    category: "sales",
    aspectRatio: "16:9",
    totalDuration: "1:45",
    scenesCount: 6,
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    scenes: samplePromptCourseTemplate.scenes.slice(0, 6),
  },
  {
    id: "template_tiktok_hook",
    title: "Viral Hook Social Commerce Ad",
    category: "marketing",
    aspectRatio: "9:16",
    totalDuration: "0:30",
    scenesCount: 4,
    thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
    scenes: samplePromptCourseTemplate.scenes.slice(0, 4),
  },
  {
    id: "template_onboarding",
    title: "New Employee HR Onboarding Welcome",
    category: "learning",
    aspectRatio: "16:9",
    totalDuration: "2:10",
    scenesCount: 8,
    thumbnail: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    scenes: samplePromptCourseTemplate.scenes,
  },
  {
    id: "template_product_release",
    title: "Feature Announcement & Release Notes",
    category: "explainer",
    aspectRatio: "16:9",
    totalDuration: "1:15",
    scenesCount: 5,
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop",
    scenes: samplePromptCourseTemplate.scenes.slice(0, 5),
  },
  {
    id: "template_real_estate",
    title: "Luxury Real Estate Virtual Property Tour",
    category: "sales",
    aspectRatio: "16:9",
    totalDuration: "1:55",
    scenesCount: 7,
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    scenes: samplePromptCourseTemplate.scenes.slice(0, 7),
  },
];

interface TemplatesLibraryProps {
  activeCategory?: string;
  onOpenStudio?: () => void;
}

export default function TemplatesLibrary({
  activeCategory = "all",
  onOpenStudio,
}: TemplatesLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [aspectFilter, setAspectFilter] = useState<"all" | "16:9" | "9:16">("all");

  const filteredTemplates = templatesList.filter((tpl) => {
    const matchesCategory =
      activeCategory === "all" ||
      (activeCategory === "learning" && tpl.category === "learning") ||
      (activeCategory === "sales" && tpl.category === "sales") ||
      (activeCategory === "marketing" && tpl.category === "marketing") ||
      (activeCategory === "explainer" && tpl.category === "explainer");

    const matchesAspect = aspectFilter === "all" || tpl.aspectRatio === aspectFilter;
    const matchesSearch = tpl.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesAspect && matchesSearch;
  });

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none relative">
      {/* 1. TOP HEADER */}
      <div className="w-full px-10 pt-7 pb-4 flex items-center justify-between border-b border-[#141b2c] z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Video Templates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Professionally designed multi-scene templates for learning, marketing, and sales
          </p>
        </div>

        <AskRhysWidget />
      </div>

      {/* 2. FILTER & SEARCH BAR */}
      <div className="max-w-7xl w-full mx-auto px-10 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Aspect Ratio Filters */}
        <div className="flex items-center gap-2 bg-[#0c111e] border border-[#1e2a44] p-1 rounded-2xl w-fit">
          <button
            onClick={() => setAspectFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              aspectFilter === "all"
                ? "bg-[#1f2b48] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Ratios
          </button>
          <button
            onClick={() => setAspectFilter("16:9")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              aspectFilter === "16:9"
                ? "bg-[#1f2b48] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Landscape 16:9
          </button>
          <button
            onClick={() => setAspectFilter("9:16")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              aspectFilter === "9:16"
                ? "bg-[#1f2b48] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Portrait 9:16
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
          <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Templates"
            className="w-full bg-[#111728] border border-[#1e2a44] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>
      </div>

      {/* 3. TEMPLATES GRID */}
      <div className="max-w-7xl w-full mx-auto px-10 py-6 flex-1 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              className="bg-[#0c111e] hover:bg-[#121828] border border-[#1c2740] hover:border-cyan-500/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="aspect-[16/10] w-full relative overflow-hidden bg-slate-900">
                <img
                  src={tpl.thumbnail}
                  alt={tpl.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-black/70 backdrop-blur-sm text-[10px] font-bold text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                    {tpl.aspectRatio}
                  </span>
                  <span className="bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Layers size={10} /> {tpl.scenesCount} Scenes
                  </span>
                </div>

                {/* Bottom Duration Badge */}
                <span className="absolute bottom-3 right-3 bg-black/80 text-[10px] font-mono font-bold text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock size={10} /> {tpl.totalDuration}
                </span>

                {/* Center Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                    <Play size={20} className="ml-1 fill-slate-950" />
                  </div>
                </div>
              </div>

              {/* Text Info */}
              <div className="p-4">
                <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {tpl.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-[#17223b]">
                  <span className="capitalize">{tpl.category}</span>
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    <span>Preview & Edit</span>
                    <Clapperboard size={11} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TEMPLATE PREVIEW MODAL (Exact Screenshot Match) */}
      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onCreateFromTemplate={async (tpl) => {
            try {
              const res = await fetch(`/api/v2/templates/${tpl.id}/use`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: tpl.title }),
              });
              const data = await res.json();
              setSelectedTemplate(null);
              if (onOpenStudio) {
                onOpenStudio();
              }
            } catch (err) {
              console.error("Failed to load template into Studio:", err);
              setSelectedTemplate(null);
              if (onOpenStudio) onOpenStudio();
            }
          }}
        />
      )}
    </div>
  );
}
