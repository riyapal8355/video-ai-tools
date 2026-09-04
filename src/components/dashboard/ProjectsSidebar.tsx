"use client";

import React from "react";
import {
  Video,
  FolderPlus,
  Trash2,
  PanelLeftClose,
  FolderClosed,
} from "lucide-react";

interface ProjectsSidebarProps {
  activeSection: "my_projects" | "trash";
  onSelectSection: (section: "my_projects" | "trash") => void;
  onNewFolder?: () => void;
}

export default function ProjectsSidebar({
  activeSection,
  onSelectSection,
  onNewFolder,
}: ProjectsSidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[#0a0e17] border-r border-[#141b2c] flex flex-col justify-between shrink-0 font-sans select-none">
      <div className="p-4 flex flex-col">
        {/* Header (Matches Screenshot) */}
        <div className="flex items-center justify-between px-2 py-2 mb-2">
          <span className="text-sm font-bold text-white">Projects</span>
          <button
            title="Collapse sidebar"
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#121828]"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Navigation Items (Matches Screenshot) */}
        <nav className="space-y-1">
          <div
            onClick={() => onSelectSection("my_projects")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeSection === "my_projects"
                ? "bg-[#151f36] text-cyan-400 shadow-sm"
                : "text-slate-400 hover:bg-[#111728] hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Video size={16} className="shrink-0" />
              <span>My Projects</span>
            </div>

            {/* New Folder Icon on right (Matches Screenshot) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onNewFolder) onNewFolder();
                else alert("Create new folder dialog opened!");
              }}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1f2b48] transition-colors cursor-pointer"
              title="New Folder"
            >
              <FolderPlus size={14} />
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Trash Button (Matches Screenshot) */}
      <div className="p-4 border-t border-[#141b2c]">
        <button
          onClick={() => onSelectSection("trash")}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeSection === "trash"
              ? "bg-[#151f36] text-rose-400 font-bold"
              : "text-slate-400 hover:text-rose-400 hover:bg-[#121828]"
          }`}
        >
          <Trash2 size={16} />
          <span>Trash</span>
        </button>
      </div>
    </aside>
  );
}
