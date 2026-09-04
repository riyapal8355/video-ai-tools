"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Upload,
  Plus,
  FileText,
  Volume2,
  Trash2,
  X,
  Check,
  Languages,
  ShieldCheck,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";

interface PronunciationRule {
  id: string;
  word: string;
  phonetic: string;
}

interface ForceTranslateRule {
  id: string;
  sourceWord: string;
  targetWord: string;
}

interface DontTranslateRule {
  id: string;
  term: string;
}

interface BrandGlossaryDetailProps {
  onBack: () => void;
}

export default function BrandGlossaryDetail({ onBack }: BrandGlossaryDetailProps) {
  const [activeTab, setActiveTab] = useState<"pronunciations" | "translations">("translations");
  const [searchQuery, setSearchQuery] = useState("");
  const [pronunciations, setPronunciations] = useState<PronunciationRule[]>([]);
  const [forceRules, setForceRules] = useState<ForceTranslateRule[]>([]);
  const [dontTranslateRules, setDontTranslateRules] = useState<DontTranslateRule[]>([]);

  // Modals & form states
  const [isAddPronunciationOpen, setIsAddPronunciationOpen] = useState(false);
  const [isAddForceOpen, setIsAddForceOpen] = useState(false);
  const [isAddDontTranslateOpen, setIsAddDontTranslateOpen] = useState(false);

  const [newWord, setNewWord] = useState("");
  const [newPhonetic, setNewPhonetic] = useState("");
  const [newForceSource, setNewForceSource] = useState("");
  const [newForceTarget, setNewForceTarget] = useState("");
  const [newDontTerm, setNewDontTerm] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPronunciation = () => {
    if (!newWord.trim() || !newPhonetic.trim()) return;
    const rule: PronunciationRule = {
      id: "pron_" + Date.now(),
      word: newWord,
      phonetic: newPhonetic,
    };
    setPronunciations([...pronunciations, rule]);
    setNewWord("");
    setNewPhonetic("");
    setIsAddPronunciationOpen(false);
  };

  const handleAddForceRule = () => {
    if (!newForceSource.trim() || !newForceTarget.trim()) return;
    const rule: ForceTranslateRule = {
      id: "force_" + Date.now(),
      sourceWord: newForceSource,
      targetWord: newForceTarget,
    };
    setForceRules([...forceRules, rule]);
    setNewForceSource("");
    setNewForceTarget("");
    setIsAddForceOpen(false);
  };

  const handleAddDontTranslateRule = () => {
    if (!newDontTerm.trim()) return;
    const rule: DontTranslateRule = {
      id: "dont_" + Date.now(),
      term: newDontTerm,
    };
    setDontTranslateRules([...dontTranslateRules, rule]);
    setNewDontTerm("");
    setIsAddDontTranslateOpen(false);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Glossary CSV "${file.name}" uploaded successfully!`);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCsvUpload}
        className="hidden"
        accept=".csv,.txt"
      />

      {/* 1. TOP BAR (Matches Screenshot) */}
      <div className="w-full px-8 pt-6 pb-4 flex items-center justify-between border-b border-[#141b2c] z-20">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full border border-[#22304d] hover:bg-[#18233a] flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Back to Brand"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Brand Glossary
          </h1>
        </div>

        {/* Search & Ask Rhys */}
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Glossary"
              className="w-full bg-[#111728] border border-[#1e2a44] rounded-full pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <AskRhysWidget />
        </div>
      </div>

      {/* 2. SUB-TAB PILLS (Matches Screenshot) */}
      <div className="flex justify-center pt-5 pb-5">
        <div className="flex items-center p-1 bg-[#111728] border border-[#1e2942] rounded-full max-w-xs w-full shadow-inner">
          <button
            onClick={() => setActiveTab("pronunciations")}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "pronunciations"
                ? "bg-[#1f2b48] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pronunciations
          </button>

          <button
            onClick={() => setActiveTab("translations")}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "translations"
                ? "bg-[#1f2b48] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Translations
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT WORKSPACE */}
      <div className="max-w-5xl w-full mx-auto px-8 pb-20 flex-1 flex flex-col space-y-8">
        {activeTab === "pronunciations" ? (
          /* PRONUNCIATIONS VIEW */
          <div className="flex flex-col flex-1">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white mb-1">Pronunciations</h2>
              <p className="text-xs text-slate-400">
                Ensure correct pronunciation of brand terms by entering phonetic spellings.
              </p>
            </div>

            <div className="flex-1 min-h-[360px] bg-[#0c111e] border border-[#1c2740] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md">
              {pronunciations.length === 0 ? (
                <div className="flex flex-col items-center max-w-sm">
                  <div className="w-12 h-14 rounded-lg bg-[#182238] border border-[#243354] flex items-center justify-center mb-4 text-slate-400 shadow-md">
                    <FileText size={24} />
                  </div>

                  <h3 className="text-sm font-bold text-white mb-6">
                    No pronunciations added yet
                  </h3>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#162035] hover:bg-[#1f2d4a] border border-[#243354] rounded-full text-xs font-bold text-slate-200 hover:text-white shadow-sm transition-all cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>Upload CSV</span>
                    </button>

                    <button
                      onClick={() => setIsAddPronunciationOpen(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#162035] hover:bg-[#1f2d4a] border border-[#243354] rounded-full text-xs font-bold text-slate-200 hover:text-white shadow-sm transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add manually</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full text-left self-start">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-300">
                      {pronunciations.length} Active Rules
                    </span>
                    <button
                      onClick={() => setIsAddPronunciationOpen(true)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Rule
                    </button>
                  </div>

                  <div className="divide-y divide-[#17223b] border border-[#17223b] rounded-2xl overflow-hidden bg-[#0a0e19]">
                    {pronunciations.map((item) => (
                      <div key={item.id} className="p-3.5 px-4 flex items-center justify-between text-xs hover:bg-[#0e1422]">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-white">{item.word}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-mono text-cyan-400 font-semibold">
                            /{item.phonetic}/
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setPronunciations(pronunciations.filter((p) => p.id !== item.id))
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TRANSLATIONS VIEW (Matches Screenshot with 2 Vertically Stacked Cards) */
          <>
            {/* 1. Force Translate Section (Matches Screenshot) */}
            <div className="flex flex-col">
              <div className="mb-3">
                <h2 className="text-base font-bold text-white mb-0.5">Force Translate</h2>
                <p className="text-xs text-slate-400">
                  A list of words you wish to translate into specific words.
                </p>
              </div>

              <div className="min-h-[220px] bg-[#0c111e] border border-[#1c2740] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md">
                {forceRules.length === 0 ? (
                  <div className="flex flex-col items-center max-w-sm">
                    <div className="w-10 h-12 rounded-lg bg-[#182238] border border-[#243354] flex items-center justify-center mb-3 text-slate-400 shadow-md">
                      <FileText size={20} />
                    </div>

                    <h3 className="text-xs font-bold text-slate-300 mb-4">
                      No 'Force Translate' rules added yet
                    </h3>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#162035] hover:bg-[#1f2d4a] border border-[#243354] rounded-full text-xs font-bold text-slate-200 hover:text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Upload CSV</span>
                      </button>

                      <button
                        onClick={() => setIsAddForceOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#162035] hover:bg-[#1f2d4a] border border-[#243354] rounded-full text-xs font-bold text-slate-200 hover:text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Add manually</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-left self-start">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-300">
                        {forceRules.length} Mandatory Translations
                      </span>
                      <button
                        onClick={() => setIsAddForceOpen(true)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Rule
                      </button>
                    </div>
                    <div className="divide-y divide-[#17223b] border border-[#17223b] rounded-xl overflow-hidden bg-[#0a0e19]">
                      {forceRules.map((r) => (
                        <div key={r.id} className="p-3 px-4 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white">{r.sourceWord}</span>
                            <span className="text-slate-500">→</span>
                            <span className="font-semibold text-cyan-400">{r.targetWord}</span>
                          </div>
                          <button
                            onClick={() => setForceRules(forceRules.filter((f) => f.id !== r.id))}
                            className="text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Don't Translate Section (Matches Screenshot) */}
            <div className="flex flex-col">
              <div className="mb-3">
                <h2 className="text-base font-bold text-white mb-0.5">Don't Translate</h2>
                <p className="text-xs text-slate-400">
                  Add product names, acronyms, or brand phrases that should always stay as-is.
                </p>
              </div>

              <div className="min-h-[220px] bg-[#0c111e] border border-[#1c2740] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-md">
                {dontTranslateRules.length === 0 ? (
                  <div className="flex flex-col items-center max-w-sm">
                    <div className="w-10 h-12 rounded-lg bg-[#182238] border border-[#243354] flex items-center justify-center mb-3 text-slate-400 shadow-md">
                      <FileText size={20} />
                    </div>

                    <h3 className="text-xs font-bold text-slate-300 mb-4">
                      No 'Don't Translate' rules added yet
                    </h3>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#162035] hover:bg-[#1f2d4a] border border-[#243354] rounded-full text-xs font-bold text-slate-200 hover:text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Upload CSV</span>
                      </button>

                      <button
                        onClick={() => setIsAddDontTranslateOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#162035] hover:bg-[#1f2d4a] border border-[#243354] rounded-full text-xs font-bold text-slate-200 hover:text-white shadow-sm transition-all cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Add manually</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full text-left self-start">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-300">
                        {dontTranslateRules.length} Protected Trademarks
                      </span>
                      <button
                        onClick={() => setIsAddDontTranslateOpen(true)}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <Plus size={12} /> Add Rule
                      </button>
                    </div>
                    <div className="divide-y divide-[#17223b] border border-[#17223b] rounded-xl overflow-hidden bg-[#0a0e19]">
                      {dontTranslateRules.map((d) => (
                        <div key={d.id} className="p-3 px-4 flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{d.term}</span>
                          <button
                            onClick={() =>
                              setDontTranslateRules(dontTranslateRules.filter((item) => item.id !== d.id))
                            }
                            className="text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ADD PRONUNCIATION MODAL */}
      {isAddPronunciationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <h3 className="text-base font-bold text-white">Add Pronunciation Rule</h3>
              <button
                onClick={() => setIsAddPronunciationOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Brand Word / Name
                </label>
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="e.g. Xander"
                  className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pronounce As (Phonetic)
                </label>
                <input
                  type="text"
                  value={newPhonetic}
                  onChange={(e) => setNewPhonetic(e.target.value)}
                  placeholder="e.g. Zander"
                  className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3.5 py-2 text-xs text-cyan-400 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-[#1c2742]">
              <button
                onClick={() => setIsAddPronunciationOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPronunciation}
                disabled={!newWord.trim() || !newPhonetic.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                Save Pronunciation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FORCE TRANSLATE MODAL */}
      {isAddForceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <h3 className="text-base font-bold text-white">Add Force Translate Rule</h3>
              <button
                onClick={() => setIsAddForceOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Source Word / Phrase
                </label>
                <input
                  type="text"
                  value={newForceSource}
                  onChange={(e) => setNewForceSource(e.target.value)}
                  placeholder="e.g. Cloud Sync"
                  className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mandatory Translation
                </label>
                <input
                  type="text"
                  value={newForceTarget}
                  onChange={(e) => setNewForceTarget(e.target.value)}
                  placeholder="e.g. Sincronización en la Nube"
                  className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-[#1c2742]">
              <button
                onClick={() => setIsAddForceOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddForceRule}
                disabled={!newForceSource.trim() || !newForceTarget.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                Save Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD DON'T TRANSLATE MODAL */}
      {isAddDontTranslateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1322] text-white rounded-3xl p-6 shadow-2xl border border-[#22304f]">
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2742] mb-4">
              <h3 className="text-base font-bold text-white">Protect Word From Translation</h3>
              <button
                onClick={() => setIsAddDontTranslateOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Protected Word / Trademark
              </label>
              <input
                type="text"
                value={newDontTerm}
                onChange={(e) => setNewDontTerm(e.target.value)}
                placeholder="e.g. VidoAI Studio, iPhone, ChatGPT"
                className="w-full bg-[#121828] border border-[#202c49] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 mt-5 pt-3 border-t border-[#1c2742]">
              <button
                onClick={() => setIsAddDontTranslateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#18233a]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDontTranslateRule}
                disabled={!newDontTerm.trim()}
                className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
              >
                Protect Term
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
