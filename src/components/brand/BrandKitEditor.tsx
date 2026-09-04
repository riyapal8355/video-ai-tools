"use client";

import React, { useState } from "react";
import {
  Plus,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Check,
} from "lucide-react";

interface ColorToken {
  id: string;
  name: string;
  hex: string;
}

interface FontToken {
  id: string;
  role: string;
  family: string;
  weight: string;
  size: string;
  cqw: string;
}

interface BrandKitEditorProps {
  onBack?: () => void;
  onOpenStudio?: () => void;
}

export default function BrandKitEditor({
  onBack,
  onOpenStudio,
}: BrandKitEditorProps) {
  const [activeTab, setActiveTab] = useState<"brand_spec" | "assets" | "logos">("brand_spec");
  const [brandTitle, setBrandTitle] = useState("Demo HeyGen Brand Kit Copy");

  // Exact Colors (Matches Screenshot)
  const [colors, setColors] = useState<ColorToken[]>([
    { id: "c1", name: "Background", hex: "#F7F8FA" },
    { id: "c2", name: "Main Text", hex: "#000000" },
    { id: "c3", name: "Accent 1", hex: "#00C4FF" },
    { id: "c4", name: "Panel Background", hex: "#FFFFFF" },
    { id: "c5", name: "Dark Panel", hex: "#232B33" },
    { id: "c6", name: "Secondary Text", hex: "#818999" },
    { id: "c7", name: "Extra 1", hex: "#E2E3E6" },
  ]);

  // Exact Fonts (Matches Screenshot with Albert Sans for Heading)
  const [fonts, setFonts] = useState<FontToken[]>([
    { id: "f1", role: "Body", family: "TT Norms Pro", weight: "400", size: "16px", cqw: "0.85cqw" },
    { id: "f2", role: "Link", family: "TT Norms Pro", weight: "400", size: "18px", cqw: "0.94cqw" },
    { id: "f3", role: "Heading", family: "Albert Sans", weight: "700", size: "36px", cqw: "2.1cqw" },
    { id: "f4", role: "Display Hero", family: "TT Norms Pro", weight: "600", size: "154px", cqw: "8cqw" },
    { id: "f5", role: "Wordmark Mega", family: "TT Norms Pro", weight: "600", size: "154px", cqw: "8.02cqw" },
  ]);

  const fontOptions = [
    "TT Norms Pro",
    "Albert Sans",
    "Inter",
    "Outfit",
    "Playfair Display",
    "Montserrat",
    "Roboto",
  ];

  const handleAddColor = () => {
    const newColor: ColorToken = {
      id: "c_" + Date.now(),
      name: `Color ${colors.length + 1}`,
      hex: "#3B82F6",
    };
    setColors([...colors, newColor]);
  };

  const handleAddFont = () => {
    const newFont: FontToken = {
      id: "f_" + Date.now(),
      role: `Custom Role ${fonts.length + 1}`,
      family: "TT Norms Pro",
      weight: "500",
      size: "24px",
      cqw: "1.2cqw",
    };
    setFonts([...fonts, newFont]);
  };

  const handleColorChange = (id: string, newHex: string) => {
    setColors(colors.map((c) => (c.id === id ? { ...c, hex: newHex } : c)));
  };

  const handleFontChange = (id: string, newFamily: string) => {
    setFonts(fonts.map((f) => (f.id === id ? { ...f, family: newFamily } : f)));
  };

  const handleSave = () => {
    alert(`Brand System "${brandTitle}" saved successfully!`);
    if (onBack) onBack();
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP HEADER */}
      <div className="w-full px-8 pt-6 pb-4 flex items-center justify-between border-b border-[#141b2c] z-20">
        <div>
          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-1">
            {onBack && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-full border border-[#22304d] hover:bg-[#18233a] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer mr-1"
                title="Back to Brand Systems"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <div className="w-8 h-8 flex flex-col justify-center font-black text-xs leading-none tracking-tighter text-white">
              <div>Hey</div>
              <div>Gen</div>
            </div>

            <input
              type="text"
              value={brandTitle}
              onChange={(e) => setBrandTitle(e.target.value)}
              className="text-2xl font-extrabold text-white tracking-tight bg-transparent focus:outline-none focus:border-b border-cyan-400"
            />
          </div>

          <p className="text-xs text-slate-400">
            Define your brand here. Edit brand colors, upload logos, fonts, assets, and more.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert(`Created copy: "${brandTitle} (Copy)"`)}
            className="px-5 py-2 bg-[#121828] hover:bg-[#1a233c] text-white border border-[#243354] text-xs font-semibold rounded-full shadow-sm transition-all cursor-pointer"
          >
            Make a copy
          </button>

          <button
            onClick={() => {
              if (onOpenStudio) onOpenStudio();
              alert(`Applying "${brandTitle}" to Video Studio!`);
            }}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-full shadow-md transition-all cursor-pointer"
          >
            Use this System
          </button>
        </div>
      </div>

      {/* 2. TABS ROW */}
      <div className="w-full px-8 pt-3 border-b border-[#141b2c]">
        <div className="flex items-center gap-8 text-xs font-bold">
          <button
            onClick={() => setActiveTab("brand_spec")}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === "brand_spec"
                ? "text-white font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Brand Spec
            {activeTab === "brand_spec" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("assets")}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === "assets"
                ? "text-white font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Assets
            {activeTab === "assets" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("logos")}
            className={`pb-2.5 transition-colors cursor-pointer relative ${
              activeTab === "logos"
                ? "text-white font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Logos
            {activeTab === "logos" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
            )}
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT (2 Columns: Left Controls + Right Spec Sheet & Frame Compositions) */}
      <div className="max-w-[1440px] w-full mx-auto px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Tokens + Bottom Cancel/Save Bar (Matches Screenshot) */}
        <div className="lg:col-span-5 flex flex-col justify-between max-h-[calc(100vh-170px)]">
          <div className="space-y-6 overflow-y-auto pr-2 flex-1 no-scrollbar">
            {/* COLORS SECTION */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-3">
                Colors
              </span>

              <div className="space-y-2">
                {colors.map((color) => (
                  <div
                    key={color.id}
                    className="bg-[#0c111e] border border-[#1c2740] hover:border-[#2a3a5f] rounded-2xl p-2.5 px-3.5 flex items-center justify-between shadow-sm transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => handleColorChange(color.id, e.target.value)}
                          className="w-6 h-6 rounded-full cursor-pointer border border-white/20 bg-transparent"
                        />
                      </div>

                      <div>
                        <span className="text-xs font-bold text-white block">
                          {color.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {color.hex.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add a new color button */}
                <button
                  onClick={handleAddColor}
                  className="w-full py-2.5 bg-[#0c111e] hover:bg-[#12192c] border border-dashed border-[#1e2a44] hover:border-cyan-500 rounded-2xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add a new color</span>
                </button>
              </div>
            </div>

            {/* FONTS SECTION */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-3">
                Fonts
              </span>

              <div className="space-y-2.5">
                {fonts.map((font) => (
                  <div
                    key={font.id}
                    className="bg-[#0c111e] border border-[#1c2740] rounded-2xl p-3 px-3.5 shadow-sm"
                  >
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      {font.role}
                    </label>

                    <div className="relative">
                      <select
                        value={font.family}
                        onChange={(e) => handleFontChange(font.id, e.target.value)}
                        className="w-full appearance-none bg-[#111728] border border-[#1e2a44] rounded-xl px-3 py-1.5 text-xs font-semibold text-white focus:outline-none cursor-pointer pr-8"
                      >
                        {fontOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ))}

                {/* Add a new font button */}
                <button
                  onClick={handleAddFont}
                  className="w-full py-2.5 bg-[#0c111e] hover:bg-[#12192c] border border-dashed border-[#1e2a44] hover:border-cyan-500 rounded-2xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add a new font</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM CANCEL & SAVE BAR (Matches Screenshot) */}
          <div className="pt-4 mt-3 border-t border-[#141b2c] flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-2.5 bg-[#0c111e] hover:bg-[#151f34] text-slate-300 border border-[#1e2a44] text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Spec Sheet & Live Frame Compositions (Matches Screenshot) */}
        <div className="lg:col-span-7 bg-[#0c111e] border border-[#1c2740] rounded-3xl p-6 shadow-xl flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-170px)]">
          <div className="space-y-8">
            {/* 1. TYPOGRAPHY SPEC SHEET SECTION (Exact Screenshot Match) */}
            <div className="bg-[#080c16] border border-[#17223b] rounded-2xl p-6 shadow-inner space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#141d33]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Typography Spec Sheet
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  Live Token Render
                </span>
              </div>

              {/* link Spec Row (Matches Screenshot) */}
              <div className="flex items-center justify-between pb-5 border-b border-[#141d33]/60">
                <div>
                  <h4 className="text-xs font-bold italic text-white mb-0.5">
                    link
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400">
                    TT Norms Pro 400 • 18px • 0.94cqw
                  </p>
                </div>

                <div className="text-sm font-semibold text-cyan-300 underline underline-offset-4">
                  Aa — link
                </div>
              </div>

              {/* display-hero Spec Row (Matches Screenshot) */}
              <div className="flex items-center justify-between pb-5 border-b border-[#141d33]/60">
                <div>
                  <h4 className="text-xs font-bold italic text-white mb-0.5">
                    display-hero
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400">
                    TT Norms Pro 600 • 154px • 8cqw
                  </p>
                </div>

                <div className="text-4xl font-extrabold tracking-tighter text-white">
                  S...
                </div>
              </div>

              {/* wordmark-mega Spec Row (Matches Screenshot) */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold italic text-white mb-0.5">
                    wordmark-mega
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400">
                    TT Norms Pro 600 • 154px • 8.02cqw
                  </p>
                </div>

                <div className="text-4xl font-black text-white">
                  Aa
                </div>
              </div>
            </div>

            {/* 2. FRAME COMPOSITIONS SECTION */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#17223b] mb-4">
                <h3 className="text-sm font-bold italic tracking-tight text-white flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-cyan-400 inline-block"></span>
                  <span>Frame Compositions</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  01 • 16:9
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frame 1: Identity / Cover */}
                <div className="flex flex-col">
                  <div className="aspect-[16/10] bg-slate-900 rounded-2xl overflow-hidden relative shadow-md border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=700&auto=format&fit=crop"
                      alt="Identity Cover"
                      className="w-full h-full object-cover object-top brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

                    <span className="absolute top-2.5 left-2.5 text-[8px] font-bold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-white tracking-widest border border-white/10">
                      SPECIAL REPORT
                    </span>

                    <div className="absolute bottom-2.5 left-2.5">
                      <h4 className="text-base font-serif italic text-white leading-none">
                        The brief.
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 px-1 text-[10px]">
                    <span className="font-bold text-slate-200">Identity / Cover</span>
                    <span className="text-slate-400 italic">avatar overlay + wordmark</span>
                  </div>
                </div>

                {/* Frame 2: Oversized Claim */}
                <div className="flex flex-col">
                  <div className="aspect-[16/10] bg-gradient-to-tr from-cyan-500 to-sky-400 rounded-2xl overflow-hidden relative shadow-md p-4 flex flex-col justify-between border border-cyan-300/30">
                    <span className="text-[8px] font-bold text-slate-900 uppercase tracking-widest">
                      THE LEAD
                    </span>

                    <p className="text-sm font-serif italic font-bold text-slate-950 leading-snug">
                      One bold idea, said once, owns the frame.
                    </p>

                    <div className="flex justify-end">
                      <span className="text-[7px] font-bold bg-slate-950 text-white px-1.5 py-0.5 rounded-full">
                        VIDOAI
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 px-1 text-[10px]">
                    <span className="font-bold text-slate-200">Oversized Claim</span>
                    <span className="text-slate-400 italic">serif-italic statement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="mt-6 pt-4 border-t border-[#17223b] flex items-center justify-between text-xs text-slate-400">
            <span>Tokens dynamically linked to Studio Video sequencer</span>
            <button
              onClick={() => {
                if (onOpenStudio) onOpenStudio();
              }}
              className="font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Test in Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
