"use client";

import React, { useState } from "react";
import {
  User,
  LayoutGrid,
  Sparkles,
  FolderClosed,
  Code2,
  Gem,
  Palette,
  Wand2,
} from "lucide-react";

import UserMenuDropdown from "./UserMenuDropdown";

interface LeftRailNavProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onLogoClick?: () => void;
}

export default function LeftRailNav({
  activeTab = "home",
  onSelectTab,
  onLogoClick,
}: LeftRailNavProps) {
  const [currentActive, setCurrentActive] = useState(activeTab);

  const navItems = [
    { id: "home", icon: Sparkles, label: "Home / Dashboard" },
    { id: "avatar", icon: User, label: "Avatars & Voices" },
    { id: "brand", icon: Palette, label: "Brand Systems" },
    { id: "tools", icon: Wand2, label: "Apps" },
    { id: "projects", icon: FolderClosed, label: "Projects" },
    { id: "developer", icon: Code2, label: "API & Developers" },
  ];

  const handleSelect = (id: string) => {
    setCurrentActive(id);
    if (onSelectTab) onSelectTab(id);
  };


  return (
    <aside className="w-16 min-w-16 h-screen bg-[#07090e] border-r border-[#151c2d] flex flex-col items-center justify-between py-4 select-none z-30">
      {/* Top Section: App Glowing Logo & Navigation */}
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand Hologram Icon */}
        <div
          onClick={() => {
            handleSelect("home");
            if (onLogoClick) onLogoClick();
          }}
          className="relative group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-fuchsia-500 p-[1.5px] shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
              <div className="w-5 h-5 bg-gradient-to-tr from-cyan-400 to-purple-400 rounded-sm transform rotate-45 flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          {/* Tooltip */}
          <span className="absolute left-16 bg-[#161f33] text-xs text-white font-medium px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[#24324f] shadow-xl z-50">
            VidoAI Studio
          </span>
        </div>

        {/* Nav Icons */}
        <nav className="flex flex-col items-center gap-3 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? item.id === "brand"
                      ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 shadow-md shadow-fuchsia-500/10"
                      : "bg-[#162035] text-cyan-400 shadow-md shadow-cyan-900/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#111726]"
                }`}
                title={item.label}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.7} />
                {isActive && (
                  <span
                    className={`absolute left-0 w-1 h-5 rounded-r-full shadow-sm ${
                      item.id === "brand" ? "bg-fuchsia-500" : "bg-cyan-400"
                    }`}
                  ></span>
                )}
                {/* Hover Tooltip */}
                <span className="absolute left-16 bg-[#161f33] text-xs text-white px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[#24324f] shadow-xl z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Diamond Credits & User Profile Dropdown */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        {/* Diamond / Credits Plan Button */}
        <div className="relative group">
          <button className="w-10 h-10 rounded-full bg-gradient-to-b from-[#1b253b] to-[#121827] border border-amber-500/40 hover:border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 hover:scale-105 transition-all">
            <Gem size={19} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          </button>
          <span className="absolute left-16 bg-[#161f33] text-xs text-amber-300 font-medium px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-[#24324f] shadow-xl z-50">
            Pro Plan • 850 Credits
          </span>
        </div>

        {/* User Avatar with Dropdown */}
        <UserMenuDropdown placement="left-rail" />
      </div>
    </aside>
  );
}

