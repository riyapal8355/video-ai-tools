"use client";

import React from "react";
import { Palette, BookOpen, PanelLeftClose, ChevronRight, Plus } from "lucide-react";

interface BrandSidebarProps {
  activeSection: "brand_systems" | "brand_glossary";
  onSelectSection: (section: "brand_systems" | "brand_glossary") => void;
  brandKits?: string[];
  selectedKit?: string;
  onSelectKit?: (kitName: string) => void;
  onAddNewKit?: () => void;
}

export default function BrandSidebar({
  activeSection,
  onSelectSection,
  brandKits = ["Demo HeyGen Brand Kit Copy", "Demo HeyGen Brand Kit"],
  selectedKit = "Demo HeyGen Brand Kit Copy",
  onSelectKit,
  onAddNewKit,
}: BrandSidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[#0a0e17] border-r border-[#141b2c] flex flex-col justify-between shrink-0 font-sans select-none">
      <div className="p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          <span className="text-sm font-bold text-white">Brand</span>
          <button
            title="Collapse sidebar"
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#121828]"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {/* Brand Systems Item */}
          <button
            onClick={() => onSelectSection("brand_systems")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSection === "brand_systems"
                ? "bg-[#151f36] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:bg-[#111728] hover:text-slate-200"
            }`}
          >
            <Palette size={16} className="shrink-0" />
            <span>Brand Systems</span>
          </button>

          {/* Brand Glossary Item */}
          <button
            onClick={() => onSelectSection("brand_glossary")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSection === "brand_glossary"
                ? "bg-[#151f36] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:bg-[#111728] hover:text-slate-200"
            }`}
          >
            <BookOpen size={16} className="shrink-0" />
            <span>Brand Glossary</span>
          </button>
        </nav>

        {/* Divider */}
        <div className="h-[1px] bg-[#141b2c] my-4 mx-2"></div>

        {/* Brand Kits Sub-List */}
        <div className="space-y-1">
          {brandKits.map((kit) => (
            <button
              key={kit}
              onClick={() => {
                onSelectSection("brand_systems");
                if (onSelectKit) onSelectKit(kit);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                selectedKit === kit
                  ? "text-white font-bold bg-[#121828]"
                  : "text-slate-400 font-medium hover:text-white hover:bg-[#0f1422]"
              }`}
            >
              <span className="truncate">{kit}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
