"use client";

import React, { useState } from "react";
import { Video, ChevronRight, Sparkles, Rocket, Lightbulb, GraduationCap, Megaphone } from "lucide-react";

interface PromptCardData {
  id: string;
  title: string;
  category: string;
  bgGradient: string;
  accentColor: string;
  icon: any;
  visualType: "ad" | "rocket" | "idea" | "education";
}

const promptCards: PromptCardData[] = [
  {
    id: "ads_promo",
    title: "Ads & Promo",
    category: "Marketing",
    bgGradient: "from-[#20101b] via-[#171220] to-[#0c0f1c]",
    accentColor: "from-fuchsia-500 to-purple-600",
    icon: Megaphone,
    visualType: "ad",
  },
  {
    id: "product_launch",
    title: "Product Launch",
    category: "Software",
    bgGradient: "from-[#0d1629] via-[#0f1b34] to-[#090e1a]",
    accentColor: "from-blue-500 to-indigo-600",
    icon: Rocket,
    visualType: "rocket",
  },
  {
    id: "tips_how_to",
    title: "Tips & How-To",
    category: "Tutorial",
    bgGradient: "from-[#111c2e] via-[#10192a] to-[#0b101c]",
    accentColor: "from-cyan-500 to-blue-600",
    icon: Lightbulb,
    visualType: "idea",
  },
  {
    id: "educational_video",
    title: "Educational Video",
    category: "Learning",
    bgGradient: "from-[#241712] via-[#1a141d] to-[#0d0f17]",
    accentColor: "from-amber-500 to-orange-600",
    icon: GraduationCap,
    visualType: "education",
  },
];

export default function VideoPrompts({ onSelectPrompt }: { onSelectPrompt?: (id: string) => void }) {
  const [activeCategory, setActiveCategory] = useState("Software & Products");
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const categories = ["Software & Products", "E-Commerce", "Real Estate", "Personal Branding"];

  return (
    <div className="w-full mt-7">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Video size={14} />
          </div>
          <h3 className="text-white font-semibold text-sm">Video Prompts</h3>
        </div>

        {/* Personalization Dropdown / Toggle */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Personalization:</span>
          <div className="relative group">
            <button className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 cursor-pointer flex items-center gap-1 transition-colors">
              {activeCategory}
            </button>
            <div className="absolute right-0 mt-1 w-44 bg-[#111728] border border-[#233152] rounded-xl p-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-40">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    activeCategory === cat
                      ? "bg-blue-600/30 text-blue-300 font-medium"
                      : "text-slate-300 hover:bg-[#18233b]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 Rich Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {promptCards.map((card) => {
          return (
            <div
              key={card.id}
              onClick={() => {
                setSelectedPrompt(card.id);
                if (onSelectPrompt) onSelectPrompt(card.id);
              }}
              className="relative h-48 rounded-2xl bg-[#0d1222] border border-[#1b253e] hover:border-[#32456e] p-5 flex flex-col justify-between overflow-hidden group cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10"
            >
              {/* Card Background Graphics / Visual Elements */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${card.bgGradient} opacity-90 group-hover:scale-105 transition-transform duration-500`}
              ></div>

              {/* Dynamic Visual Art Representation for Each Type */}
              {card.visualType === "ad" && (
                <div className="absolute right-0 bottom-0 w-52 h-full flex items-end justify-end pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                  {/* Glowing ring light effect */}
                  <div className="absolute right-4 bottom-4 w-28 h-28 rounded-full border-4 border-cyan-400/70 shadow-[0_0_35px_rgba(34,211,238,0.5)]"></div>
                  {/* Creator Avatar Artwork */}
                  <div className="relative z-10 w-32 h-44 rounded-t-full bg-gradient-to-b from-[#b45309]/80 to-[#78350f]/80 flex items-center justify-center text-5xl shadow-2xl mr-2">
                    <span className="drop-shadow-lg">👩🏾‍💼</span>
                  </div>
                </div>
              )}

              {card.visualType === "rocket" && (
                <div className="absolute right-2 bottom-0 w-48 h-full flex items-end justify-end pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                  {/* Isometric base grid & smoke blast */}
                  <div className="absolute right-2 bottom-2 w-36 h-20 bg-gradient-to-t from-blue-600/30 to-transparent rounded-full blur-lg"></div>
                  <div className="relative z-10 flex flex-col items-center mr-6 mb-2 animate-bounce duration-1000">
                    <span className="text-6xl drop-shadow-[0_0_25px_rgba(96,165,250,0.8)]">🚀</span>
                    <div className="w-10 h-8 bg-gradient-to-b from-orange-400 via-amber-300 to-transparent rounded-full blur-sm opacity-80"></div>
                  </div>
                </div>
              )}

              {card.visualType === "idea" && (
                <div className="absolute right-2 bottom-0 w-52 h-full flex items-end justify-end pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                  {/* Glowing neon light bulb */}
                  <div className="absolute right-24 top-6 w-12 h-12 rounded-full bg-amber-400/20 blur-md"></div>
                  <div className="absolute right-24 top-7 text-2xl animate-pulse">💡</div>
                  {/* Floating Holographic Glass Cards */}
                  <div className="absolute right-14 top-14 w-16 h-10 rounded-lg bg-blue-500/20 border border-cyan-400/40 backdrop-blur-sm shadow-lg"></div>
                  <div className="relative z-10 w-32 h-44 rounded-t-full bg-gradient-to-b from-[#334155]/90 to-[#1e293b]/90 flex items-center justify-center text-5xl mr-2">
                    <span className="drop-shadow-lg">👩🏻‍💼</span>
                  </div>
                </div>
              )}

              {card.visualType === "education" && (
                <div className="absolute right-2 bottom-0 w-48 h-full flex items-end justify-end pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                  {/* Plate / Table tactile tutorial representation */}
                  <div className="relative z-10 flex items-center gap-2 mr-4 mb-4">
                    <div className="w-24 h-24 rounded-full bg-[#38261e] border-2 border-[#57392b] flex items-center justify-center text-3xl shadow-2xl">
                      🍪
                    </div>
                    <span className="text-4xl transform -rotate-45 drop-shadow-lg">👉</span>
                  </div>
                </div>
              )}

              {/* Title Content */}
              <div className="relative z-10">
                <h4 className="text-xl font-bold text-white tracking-tight drop-shadow-md group-hover:text-cyan-200 transition-colors">
                  {card.title}
                </h4>
              </div>

              {/* Bottom Action Button */}
              <div className="relative z-10">
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 group-hover:from-purple-500 group-hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-purple-900/40 flex items-center gap-1.5 transition-all duration-200 group-hover:scale-105">
                  <span>Create Now</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
