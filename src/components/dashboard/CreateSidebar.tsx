"use client";

import React, { useState } from "react";
import {
  Home,
  Bot,
  Clapperboard,
  Image as ImageIcon,
  Languages,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface CreateSidebarProps {
  activeSection?: string;
  onSelectSection?: (section: string) => void;
}

export default function CreateSidebar({
  activeSection = "home",
  onSelectSection,
}: CreateSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentActive, setCurrentActive] = useState(activeSection);

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "video_agent", label: "Video agent", icon: Bot },
    { id: "scene_by_scene", label: "Scene by scene", icon: Clapperboard },
    { id: "single_scene", label: "Single scene", icon: ImageIcon },
    { id: "translate", label: "Translate", icon: Languages },
  ];

  const handleSelect = (id: string) => {
    setCurrentActive(id);
    if (onSelectSection) onSelectSection(id);
  };

  if (isCollapsed) {
    return (
      <div className="h-screen py-4 px-2 bg-[#090d16] border-r border-[#151c2d] flex flex-col items-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-slate-400 hover:text-white hover:bg-[#151f33] rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 min-w-56 h-screen bg-[#090d16] border-r border-[#151c2d] flex flex-col py-5 px-3 select-none">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <span className="text-white font-semibold text-sm tracking-wide">
          Create
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="text-slate-400 hover:text-white p-1 hover:bg-[#151f33] rounded-md transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={17} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentActive === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#18233c] text-white shadow-sm border border-[#2b3a5d]/50 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#101625]"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-blue-400" : "text-slate-400"}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
