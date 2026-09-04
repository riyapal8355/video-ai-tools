"use client";

import React, { useState } from "react";
import {
  Plus,
  Heart,
  MoreHorizontal,
  Sparkles,
  Upload,
  Palette,
  Type,
  Video,
  X,
  Check,
  BookOpen,
  Volume2,
  Trash2,
  Edit2,
  Copy,
  ArrowRight,
  ToggleLeft,
  ToggleRight,
  Languages,
  ShieldCheck,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";

export interface BrandKitItem {
  id: string;
  name: string;
  isFavorite: boolean;
  logoUrl?: string;
  logoText: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  fontFamily: string;
  updatedAt: string;
}

const defaultBrandKits: BrandKitItem[] = [
  {
    id: "kit_1",
    name: "Demo HeyGen Brand Kit",
    isFavorite: false,
    logoText: "Hey\nGen",
    primaryColor: "#000000",
    accentColor: "#00d2ff",
    secondaryColor: "#7928ca",
    fontFamily: "Inter, sans-serif",
    updatedAt: "Just now",
  },
];

interface GlossaryEntry {
  id: string;
  type: "pronunciation" | "force_translate" | "dont_translate";
  originalTerm: string;
  targetTerm?: string;
  language?: string;
}

import BrandGlossaryDetail from "./BrandGlossaryDetail";
import BrandKitEditor from "./BrandKitEditor";

interface BrandSystemsProps {
  activeSubSection?: "brand_systems" | "brand_glossary";
  onOpenStudio?: () => void;
}

export default function BrandSystems({
  activeSubSection = "brand_systems",
  onOpenStudio,
}: BrandSystemsProps) {
  const [kits, setKits] = useState<BrandKitItem[]>(defaultBrandKits);
  const [glossaryEntries, setGlossaryEntries] = useState<GlossaryEntry[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGlossaryDetailOpen, setIsGlossaryDetailOpen] = useState(false);
  const [isKitEditorOpen, setIsKitEditorOpen] = useState(false); // starts at Brand Systems overview
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);

  // New Brand Kit Form State
  const [newKitName, setNewKitName] = useState("");
  const [newPrimaryColor, setNewPrimaryColor] = useState("#0f172a");
  const [newAccentColor, setNewAccentColor] = useState("#06b6d4");
  const [newSecondaryColor, setNewSecondaryColor] = useState("#8b5cf6");
  const [newFont, setNewFont] = useState("Inter");

  // Glossary Builder Modal State
  const [glossaryTab, setGlossaryTab] = useState<"pronunciation" | "force_translate" | "dont_translate">("pronunciation");
  const [inputWord, setInputWord] = useState("");
  const [replacementWord, setReplacementWord] = useState("");

  if (isGlossaryDetailOpen) {
    return <BrandGlossaryDetail onBack={() => setIsGlossaryDetailOpen(false)} />;
  }

  if (isKitEditorOpen && activeSubSection === "brand_systems") {
    return (
      <BrandKitEditor
        onBack={() => setIsKitEditorOpen(false)}
        onOpenStudio={onOpenStudio}
      />
    );
  }

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setKits(
      kits.map((k) => (k.id === id ? { ...k, isFavorite: !k.isFavorite } : k))
    );
  };

  const handleCreateKit = () => {
    if (!newKitName.trim()) return;
    const newKit: BrandKitItem = {
      id: "kit_" + Date.now(),
      name: newKitName,
      isFavorite: false,
      logoText: newKitName.slice(0, 6),
      primaryColor: newPrimaryColor,
      accentColor: newAccentColor,
      secondaryColor: newSecondaryColor,
      fontFamily: newFont,
      updatedAt: "Just now",
    };
    setKits([...kits, newKit]);
    setNewKitName("");
    setIsCreateModalOpen(false);
  };

  const handleAddGlossaryRule = () => {
    if (!inputWord.trim()) return;
    const newRule: GlossaryEntry = {
      id: "rule_" + Date.now(),
      type: glossaryTab,
      originalTerm: inputWord,
      targetTerm: replacementWord || undefined,
    };
    setGlossaryEntries([...glossaryEntries, newRule]);
    setInputWord("");
    setReplacementWord("");
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header Section (Matches Screenshot) */}
      <div className="w-full px-10 pt-7 pb-4 flex items-center justify-between border-b border-[#141b2c] z-20">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {activeSubSection === "brand_systems" ? "Brand Systems" : "Brand Glossary"}
          </h1>
          {activeSubSection === "brand_systems" && (
            <p className="text-xs text-slate-400 mt-1">
              Brand systems keep every video consistent without restyling elements one by one.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeSubSection === "brand_glossary" && (
            <button
              onClick={() => setIsGlossaryDetailOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold rounded-full shadow-md transition-all cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>New Brand Glossary</span>
            </button>
          )}

          <AskRhysWidget />
        </div>
      </div>

      {/* Main Workspace Area */}
      {activeSubSection === "brand_systems" ? (
        <div className="max-w-6xl w-full mx-auto px-10 py-6 flex-1">
          {/* Brand Kits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: + Add new */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="aspect-[16/11] bg-[#0c111e] border-2 border-dashed border-[#1e2a44] hover:border-cyan-400 rounded-3xl flex items-center justify-center cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 shadow-sm"
            >
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#151e34] border border-[#223152] rounded-full text-xs font-bold text-slate-200 shadow-sm group-hover:scale-105 group-hover:border-cyan-500 transition-all pointer-events-none">
                <Plus size={15} />
                <span>Add new</span>
              </button>
            </div>

            {/* Card 2 & Dynamic Created Kits */}
            {kits.map((kit) => (
              <div key={kit.id} className="flex flex-col group">
                {/* Visual Card Frame */}
                <div
                  onClick={() => {
                    setIsKitEditorOpen(true);
                  }}
                  className="aspect-[16/11] bg-[#0c111e] border border-[#1d273f] hover:border-cyan-500/70 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 relative flex flex-col justify-between cursor-pointer p-6"
                >
                  {/* Top Right Action Icons: Heart & More */}
                  <div className="flex items-center justify-end gap-2 z-10">
                    <button
                      onClick={(e) => handleToggleFavorite(kit.id, e)}
                      className={`w-7 h-7 rounded-full bg-[#162138] border border-[#223254] flex items-center justify-center transition-colors ${
                        kit.isFavorite
                          ? "text-rose-500 fill-rose-500"
                          : "text-slate-400 hover:text-white"
                      }`}
                      title="Favorite"
                    >
                      <Heart size={13} className={kit.isFavorite ? "fill-rose-500" : ""} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Options for "${kit.name}": Edit, Duplicate, Export, Delete`);
                      }}
                      className="w-7 h-7 rounded-full bg-[#162138] border border-[#223254] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      title="More options"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {/* Centered Brand Logo & Visual Emblem */}
                  <div className="flex items-center justify-center gap-3 my-auto">
                    <div className="text-left font-black tracking-tighter text-3xl md:text-4xl text-white leading-tight">
                      <div>Hey</div>
                      <div>Gen</div>
                    </div>

                    {/* Prism Logo Symbol */}
                    <div className="w-14 h-14 relative flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-tr from-cyan-400 via-fuchsia-400 to-emerald-400 rounded-2xl shadow-lg transform rotate-12 group-hover:rotate-45 transition-transform duration-500"></div>
                    </div>
                  </div>

                  {/* Bottom Color Swatches Bar */}
                  <div className="w-full h-4 rounded-xl overflow-hidden flex shadow-inner border border-white/10">
                    <div className="flex-1 bg-black"></div>
                    <div className="flex-1 bg-[#00d2ff]"></div>
                    <div className="w-8 bg-[#7928ca]"></div>
                  </div>
                </div>

                {/* Kit Name Below Card */}
                <span className="text-xs font-bold text-slate-200 mt-2.5 px-1">
                  {kit.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* BRAND GLOSSARY WORKSPACE (Matches Screenshot Exactly) */
        <div className="max-w-4xl w-full mx-auto px-10 py-10 flex-1 flex flex-col items-center justify-center text-center">
          {glossaryEntries.length === 0 ? (
            <div className="flex flex-col items-center max-w-lg mx-auto">
              {/* Central Visual Graphic Mockup (Matches Screenshot) */}
              <div className="w-full max-w-sm bg-[#0c111e] border border-[#1e2a44] rounded-2xl p-4 shadow-2xl mb-8 relative">
                {/* Apply Glossary To Script Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#18233b] mb-3 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-4 bg-cyan-500 rounded-full p-0.5 flex justify-end">
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                    </div>
                    <span className="font-semibold text-slate-200">Apply Glossary to script</span>
                  </div>
                </div>

                {/* Script Phrase with Tooltip */}
                <div className="bg-[#111728] border border-[#1c2742] rounded-xl p-3 text-xs text-left mb-3 relative">
                  <p className="text-slate-300">
                    We are thrilled to introduce{" "}
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">
                      Xander
                    </span>
                  </p>
                  <span className="absolute -top-3 right-8 bg-black/90 border border-cyan-500/40 text-cyan-300 text-[9px] font-mono px-2 py-0.5 rounded shadow-lg">
                    "Zander"
                  </span>
                </div>

                {/* Mini Popover Dialog Inside Mockup */}
                <div className="bg-[#090d18] border border-[#1f2d4d] rounded-xl p-2.5 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 pb-1.5 border-b border-[#17223b]">
                    <span>Brand Glossary</span>
                    <X size={10} className="text-slate-500" />
                  </div>

                  <div className="flex gap-1 my-2">
                    <span className="text-[8px] bg-[#1a2540] text-cyan-400 px-2 py-0.5 rounded-full font-bold">
                      Pronunciation
                    </span>
                    <span className="text-[8px] text-slate-500 px-2 py-0.5">Force Translate</span>
                    <span className="text-[8px] text-slate-500 px-2 py-0.5">Don't Translate</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px]">
                    <div className="flex-1 bg-[#121828] border border-[#22304d] rounded px-2 py-1 text-slate-300">
                      Xander
                    </div>
                    <span className="text-slate-500">→</span>
                    <div className="flex-1 bg-[#121828] border border-[#22304d] rounded px-2 py-1 text-cyan-400 font-mono">
                      Zander
                    </div>
                    <button className="bg-slate-200 text-slate-950 font-bold px-2 py-1 rounded text-[9px]">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Headline & Description (Matches Screenshot) */}
              <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                Stay linguistically consistent, every time
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md mb-6">
                Store brand terms, translation preferences, and pronunciation rules for consistent voice across videos.
              </p>

              {/* Big Center CTA Button (Matches Screenshot) */}
              <button
                onClick={() => setIsGlossaryDetailOpen(true)}
                className="px-8 py-3 bg-[#162035] hover:bg-[#1f2d4a] border border-[#28395f] hover:border-cyan-400 text-white text-xs font-bold rounded-full shadow-lg transition-all cursor-pointer hover:scale-105"
              >
                Create Brand Glossary
              </button>
            </div>
          ) : (
            /* Active Glossary Rules List */
            <div className="w-full text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">
                  Active Brand Rules ({glossaryEntries.length})
                </h3>
                <button
                  onClick={() => setIsGlossaryModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121828] hover:bg-[#1a233c] border border-[#243354] rounded-full text-xs font-semibold text-cyan-400"
                >
                  <Plus size={13} />
                  <span>Add Rule</span>
                </button>
              </div>

              <div className="bg-[#0c111e] border border-[#1c2740] rounded-2xl divide-y divide-[#17223b]">
                {glossaryEntries.map((rule) => (
                  <div key={rule.id} className="p-4 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#141d33] text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                        {rule.type.replace("_", " ")}
                      </span>
                      <span className="font-bold text-white">{rule.originalTerm}</span>
                      {rule.targetTerm && (
                        <>
                          <span className="text-slate-500">→</span>
                          <span className="font-mono text-cyan-400">{rule.targetTerm}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setGlossaryEntries(glossaryEntries.filter((g) => g.id !== rule.id))
                      }
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE BRAND SYSTEM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <Palette size={16} className="text-cyan-400" />
                <span>Create New Brand System</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={newKitName}
                  onChange={(e) => setNewKitName(e.target.value)}
                  placeholder="e.g. Acme Studio Media"
                  className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Color Palette Selectors */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Brand Color Palette
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Primary</span>
                    <div className="flex items-center gap-2 bg-[#121828] border border-[#202c49] p-1.5 rounded-xl">
                      <input
                        type="color"
                        value={newPrimaryColor}
                        onChange={(e) => setNewPrimaryColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono text-slate-300 truncate">
                        {newPrimaryColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Accent</span>
                    <div className="flex items-center gap-2 bg-[#121828] border border-[#202c49] p-1.5 rounded-xl">
                      <input
                        type="color"
                        value={newAccentColor}
                        onChange={(e) => setNewAccentColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono text-slate-300 truncate">
                        {newAccentColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Secondary</span>
                    <div className="flex items-center gap-2 bg-[#121828] border border-[#202c49] p-1.5 rounded-xl">
                      <input
                        type="color"
                        value={newSecondaryColor}
                        onChange={(e) => setNewSecondaryColor(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <span className="text-[11px] font-mono text-slate-300 truncate">
                        {newSecondaryColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Brand Typography
                </label>
                <select
                  value={newFont}
                  onChange={(e) => setNewFont(e.target.value)}
                  className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option>Inter (Modern Sans)</option>
                  <option>Outfit (Tech Geometric)</option>
                  <option>Playfair Display (Luxury Serif)</option>
                  <option>Montserrat (Bold Grotesque)</option>
                  <option>Roboto (Clean Corporate)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-[#1c2742]">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateKit}
                disabled={!newKitName.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                Save Brand System
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BRAND GLOSSARY BUILDER MODAL */}
      {isGlossaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-white">
                <BookOpen size={16} className="text-cyan-400" />
                <span>Brand Glossary Rule</span>
              </h3>
              <button
                onClick={() => setIsGlossaryModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* 3 Tabs: Pronunciation, Force Translate, Don't Translate */}
            <div className="flex items-center gap-2 p-1 bg-[#121828] border border-[#202c49] rounded-2xl mb-5">
              <button
                onClick={() => setGlossaryTab("pronunciation")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  glossaryTab === "pronunciation"
                    ? "bg-[#1f2b48] text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Pronunciation
              </button>

              <button
                onClick={() => setGlossaryTab("force_translate")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  glossaryTab === "force_translate"
                    ? "bg-[#1f2b48] text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Force Translate
              </button>

              <button
                onClick={() => setGlossaryTab("dont_translate")}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  glossaryTab === "dont_translate"
                    ? "bg-[#1f2b48] text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Don't Translate
              </button>
            </div>

            {/* Form Fields according to Tab */}
            <div className="space-y-4">
              {glossaryTab === "pronunciation" && (
                <>
                  <p className="text-xs text-slate-400">
                    Replace acronyms, medical terms, or founder names with phonetic spellings for speech generation.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Original Word
                      </label>
                      <input
                        type="text"
                        value={inputWord}
                        onChange={(e) => setInputWord(e.target.value)}
                        placeholder="e.g. Xander"
                        className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Pronounce As
                      </label>
                      <input
                        type="text"
                        value={replacementWord}
                        onChange={(e) => setReplacementWord(e.target.value)}
                        placeholder="e.g. Zander"
                        className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-cyan-400 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {glossaryTab === "force_translate" && (
                <>
                  <p className="text-xs text-slate-400">
                    Guarantee specific localized naming for features across languages.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Source Phrase
                      </label>
                      <input
                        type="text"
                        value={inputWord}
                        onChange={(e) => setInputWord(e.target.value)}
                        placeholder="e.g. Cloud Sync"
                        className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Mandatory Translation
                      </label>
                      <input
                        type="text"
                        value={replacementWord}
                        onChange={(e) => setReplacementWord(e.target.value)}
                        placeholder="e.g. Sincronización Nube"
                        className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {glossaryTab === "dont_translate" && (
                <>
                  <p className="text-xs text-slate-400">
                    Lock brand trademarks, slogans, and product titles so translation models never alter them.
                  </p>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Protected Word / Trademark
                    </label>
                    <input
                      type="text"
                      value={inputWord}
                      onChange={(e) => setInputWord(e.target.value)}
                      placeholder="e.g. VidoAI Studio, iPhone, Coca-Cola"
                      className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-[#1c2742]">
              <button
                onClick={() => setIsGlossaryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAddGlossaryRule();
                  setIsGlossaryModalOpen(false);
                }}
                disabled={!inputWord.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                Add Rule to Glossary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
