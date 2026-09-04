"use client";

import React from "react";
import {
  Home,
  Layers,
  PanelLeftClose,
  Sparkles,
  Link as LinkIcon,
  Clock,
} from "lucide-react";

interface AppsSidebarProps {
  activeSection: "home" | "integrations" | "outputs";
  onSelectSection: (section: "home" | "integrations" | "outputs") => void;
  onSeeAllOutputs?: () => void;
}

export default function AppsSidebar({
  activeSection,
  onSelectSection,
  onSeeAllOutputs,
}: AppsSidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[#0a0e17] border-r border-[#141b2c] flex flex-col justify-between shrink-0 font-sans select-none">
      <div className="p-4 flex flex-col">
        {/* Header (Matches Screenshot) */}
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          <span className="text-sm font-bold text-white">Apps</span>
          <button
            title="Collapse sidebar"
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#121828]"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Navigation Items (Matches Screenshot) */}
        <nav className="space-y-1">
          {/* Home Item */}
          <button
            onClick={() => onSelectSection("home")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSection === "home"
                ? "bg-[#151f36] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:bg-[#111728] hover:text-slate-200"
            }`}
          >
            <Home size={16} className="shrink-0" />
            <span>Home</span>
          </button>

          {/* Integrations Item */}
          <button
            onClick={() => onSelectSection("integrations")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSection === "integrations"
                ? "bg-[#151f36] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:bg-[#111728] hover:text-slate-200"
            }`}
          >
            <LinkIcon size={16} className="shrink-0" />
            <span>Integrations</span>
          </button>
        </nav>

        {/* Divider */}
        <div className="h-[1px] bg-[#141b2c] my-4 mx-2"></div>

        {/* RECENTS Section (Matches Screenshot) */}
        <div className="px-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Recents
            </span>
            <button
              onClick={onSeeAllOutputs}
              className="text-[10px] font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              See all ›
            </button>
          </div>

          <div
            onClick={() => alert("Opening Untitled Video from AI Studio...")}
            className="p-2.5 rounded-xl bg-[#0e1422] hover:bg-[#131b2e] border border-[#1a253e] cursor-pointer transition-colors"
          >
            <h4 className="text-xs font-bold text-white truncate">Untitled Video</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">9m ago • AI Studio</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
