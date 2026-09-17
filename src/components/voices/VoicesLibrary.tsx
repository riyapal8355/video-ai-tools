"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Sparkles,
  Download,
  Search,
  Globe,
  Filter,
  Play,
  Pause,
  MoreHorizontal,
  ChevronDown,
  Volume2,
  Check,
  X,
  Upload,
  CheckSquare,
  Square,
  RotateCcw,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";
import CreateVoiceCloneModal from "./CreateVoiceCloneModal";
import DesignVoiceModal from "./DesignVoiceModal";
import ImportVoiceModal from "./ImportVoiceModal";

export interface VoiceItem {
  id: string;
  name: string;
  description: string;
  useCases: string[];
  age: "Young adult" | "Middle-aged" | "Old";
  gender: "Female" | "Male";
  language: string;
  flag: string;
  country: string;
  type: "Public" | "Custom";
}

const languagesList = [
  { code: "all", name: "All languages", flag: "🌐" },
  { code: "af", name: "Afrikaans (South Africa)", flag: "🇿🇦" },
  { code: "sq", name: "Albanian", flag: "🇦🇱" },
  { code: "am", name: "Amharic", flag: "🇪🇹" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "az", name: "Azerbaijani", flag: "🇦🇿" },
  { code: "bn", name: "Bengali (India / Bangladesh)", flag: "🇧🇩" },
  { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
  { code: "ca", name: "Catalan", flag: "🇪🇸" },
  { code: "zh", name: "Chinese (Mandarin)", flag: "🇨🇳" },
  { code: "hr", name: "Croatian", flag: "🇭🇷" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "en_us", name: "English (United States)", flag: "🇺🇸" },
  { code: "en_uk", name: "English (United Kingdom)", flag: "🇬🇧" },
  { code: "fil", name: "Filipino", flag: "🇵🇭" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "gu", name: "Gujarati (India)", flag: "🇮🇳" },
  { code: "he", name: "Hebrew (Israel)", flag: "🇮🇱" },
  { code: "hi", name: "Hindi (India)", flag: "🇮🇳" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "kn", name: "Kannada (India)", flag: "🇮🇳" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ms", name: "Malay", flag: "🇲🇾" },
  { code: "ml", name: "Malayalam (India)", flag: "🇮🇳" },
  { code: "mr", name: "Marathi (India)", flag: "🇮🇳" },
  { code: "ne", name: "Nepali (Nepal)", flag: "🇳🇵" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
  { code: "fa", name: "Persian (Iran)", flag: "🇮🇷" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "pt", name: "Portuguese (Brazil)", flag: "🇧🇷" },
  { code: "pa", name: "Punjabi (India)", flag: "🇮🇳" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "es", name: "Spanish (Spain / LatAm)", flag: "🇪🇸" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "ta", name: "Tamil (India)", flag: "🇮🇳" },
  { code: "te", name: "Telugu (India)", flag: "🇮🇳" },
  { code: "th", name: "Thai (Thailand)", flag: "🇹🇭" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "uk", name: "Ukrainian", flag: "🇺🇦" },
  { code: "ur", name: "Urdu (Pakistan)", flag: "🇵🇰" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
];

const mockVoices: VoiceItem[] = [
  {
    id: "annie",
    name: "Annie - Lifelike",
    description: "Natural, Explainer, Professional, Female, Ads, E-learning, Narration",
    useCases: ["Ads and Social", "Informative and educational"],
    age: "Young adult",
    gender: "Female",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "hope",
    name: "Hope",
    description: "Young, Energetic, Social Media, ElevenLabs V3, Multilingual, Female",
    useCases: ["Ads and Social", "Conversational"],
    age: "Young adult",
    gender: "Female",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "ben",
    name: "Ben",
    description: "Captivating, Warm, Middle Aged, ElevenLabs, Multilingual, Male",
    useCases: ["Narrative & Story", "Conversational"],
    age: "Middle-aged",
    gender: "Male",
    language: "All languages",
    flag: "🌐",
    country: "Global",
    type: "Public",
  },
  {
    id: "archer",
    name: "Archer",
    description: "Middle Aged, Soothing, Easy Listening, ElevenLabs, British, Male",
    useCases: ["Narrative & Story", "Informative and educational"],
    age: "Middle-aged",
    gender: "Male",
    language: "English (United Kingdom)",
    flag: "🇬🇧",
    country: "United Kingdom",
    type: "Public",
  },
  {
    id: "brittney",
    name: "Brittney",
    description: "Young, Upbeat, Social Media, ElevenLabs, Multilingual, Female",
    useCases: ["Ads and Social", "Conversational"],
    age: "Young adult",
    gender: "Female",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "sawyer",
    name: "Sawyer",
    description: "Young, Warm, Narration, ElevenLabs, Multilingual, Male",
    useCases: ["Narrative & Story", "Informative and educational"],
    age: "Young adult",
    gender: "Male",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "brianna",
    name: "Brianna",
    description: "Young, Energetic, Social Media, ElevenLabs, Multilingual, Female",
    useCases: ["Ads and Social"],
    age: "Young adult",
    gender: "Female",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "caryna",
    name: "Caryna",
    description: "Middle Aged, Calm, Podcasts, ElevenLabs, Multilingual, Female",
    useCases: ["Conversational", "Narrative & Story"],
    age: "Middle-aged",
    gender: "Female",
    language: "All languages",
    flag: "🌐",
    country: "Global",
    type: "Public",
  },
  {
    id: "brandon",
    name: "Brandon",
    description: "Serious, Narration, ElevenLabs, Multilingual, Male",
    useCases: ["Narrative & Story", "Informative and educational"],
    age: "Middle-aged",
    gender: "Male",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "monika",
    name: "Monika Sogam",
    description: "Middle-Aged, Enticing, Advertisement, ElevenLabs, Hindi & English",
    useCases: ["Ads and Social", "Conversational"],
    age: "Middle-aged",
    gender: "Female",
    language: "Hindi (India)",
    flag: "🇮🇳",
    country: "India",
    type: "Public",
  },
  {
    id: "pamela",
    name: "Pamela",
    description: "Young, Energetic, Podcasts, Orca, Multilingual, Female",
    useCases: ["Conversational", "Ads and Social"],
    age: "Young adult",
    gender: "Female",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "michael",
    name: "Michael C",
    description: "Calm, Professional, Middle-Aged, Education, ElevenLabs, Male",
    useCases: ["Informative and educational"],
    age: "Middle-aged",
    gender: "Male",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "armando",
    name: "Armando - Lifelike",
    description: "E-learning, News, Audiobooks, Explainer, Professional, Male",
    useCases: ["Informative and educational", "Narrative & Story"],
    age: "Middle-aged",
    gender: "Male",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "elora",
    name: "Elora",
    description: "Middle Aged, Gentle, Conversational, Orca, Multilingual, Female",
    useCases: ["Conversational"],
    age: "Middle-aged",
    gender: "Female",
    language: "All languages",
    flag: "🌐",
    country: "Global",
    type: "Public",
  },
  {
    id: "jessica",
    name: "Jessica Anne Bogart",
    description: "Middle-Aged, Confident, Corporate Training, ElevenLabs, Female",
    useCases: ["Informative and educational"],
    age: "Middle-aged",
    gender: "Female",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "daphne",
    name: "Daphne",
    description: "Crisp, E-learning, ElevenLabs, Multilingual, Female",
    useCases: ["Informative and educational"],
    age: "Young adult",
    gender: "Female",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "darlene",
    name: "Darlene",
    description: "Young, Engaging, Professional, Orca, Multilingual, Female",
    useCases: ["Conversational", "Ads and Social"],
    age: "Young adult",
    gender: "Female",
    language: "All languages",
    flag: "🌐",
    country: "Global",
    type: "Public",
  },
  {
    id: "iker",
    name: "Iker",
    description: "Young, Serious, News, Orca, Multilingual, Male",
    useCases: ["Informative and educational"],
    age: "Young adult",
    gender: "Male",
    language: "Spanish (Spain / LatAm)",
    flag: "🇪🇸",
    country: "Spain",
    type: "Public",
  },
  {
    id: "david",
    name: "David Castlemore",
    description: "Middle-Aged, Engaging, Advertisement, ElevenLabs, Male",
    useCases: ["Ads and Social", "Narrative & Story"],
    age: "Middle-aged",
    gender: "Male",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "margaret",
    name: "Margaret",
    description: "Middle-Aged, Confident, Narration, Orca, Multilingual, Female",
    useCases: ["Narrative & Story", "Informative and educational"],
    age: "Middle-aged",
    gender: "Female",
    language: "All languages",
    flag: "🌐",
    country: "Global",
    type: "Public",
  },
  {
    id: "elio",
    name: "Elio",
    description: "Young, Warm, Narration, Orca, Multilingual, Male",
    useCases: ["Narrative & Story"],
    age: "Young adult",
    gender: "Male",
    language: "Italian",
    flag: "🇮🇹",
    country: "Italy",
    type: "Public",
  },
  {
    id: "saskia",
    name: "Saskia",
    description: "Young, Enthusiastic, Advertising, ElevenLabs, Multilingual, Female",
    useCases: ["Ads and Social"],
    age: "Young adult",
    gender: "Female",
    language: "German",
    flag: "🇩🇪",
    country: "Germany",
    type: "Public",
  },
  {
    id: "carla",
    name: "Carla",
    description: "Middle Aged, Calm, Conversation, ElevenLabs, Multilingual, Female",
    useCases: ["Conversational"],
    age: "Middle-aged",
    gender: "Female",
    language: "Portuguese (Brazil)",
    flag: "🇧🇷",
    country: "Brazil",
    type: "Public",
  },
  {
    id: "emery",
    name: "Emery",
    description: "Middle-Aged, Energetic, News, ElevenLabs, Multilingual, Male",
    useCases: ["Informative and educational", "Ads and Social"],
    age: "Middle-aged",
    gender: "Male",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "aditya",
    name: "Aditya",
    description: "Orca, Multilingual, Male, Deep Clear Hindi & English",
    useCases: ["Informative and educational", "Narrative & Story"],
    age: "Young adult",
    gender: "Male",
    language: "Hindi (India)",
    flag: "🇮🇳",
    country: "India",
    type: "Public",
  },
  {
    id: "alex",
    name: "Alex",
    description: "Young, Upbeat, Advertisement, ElevenLabs, Multilingual, Male",
    useCases: ["Ads and Social"],
    age: "Young adult",
    gender: "Male",
    language: "English (United States)",
    flag: "🇺🇸",
    country: "United States",
    type: "Public",
  },
  {
    id: "jibran",
    name: "Jibran",
    description: "Upbeat, Entertainment, ElevenLabs, Multilingual, Male",
    useCases: ["Conversational", "Ads and Social"],
    age: "Young adult",
    gender: "Male",
    language: "Urdu (Pakistan)",
    flag: "🇵🇰",
    country: "Pakistan",
    type: "Public",
  },
  {
    id: "asher",
    name: "Asher",
    description: "Middle-Aged, Confident, Podcasts, Orca, Multilingual, Male",
    useCases: ["Conversational", "Narrative & Story"],
    age: "Middle-aged",
    gender: "Male",
    language: "All languages",
    flag: "🌐",
    country: "Global",
    type: "Public",
  },
  {
    id: "sevik",
    name: "Sevik",
    description: "Middle-Aged, Confident, Corporate, Training, Orca, Male",
    useCases: ["Informative and educational"],
    age: "Middle-aged",
    gender: "Male",
    language: "Russian",
    flag: "🇷🇺",
    country: "Russia",
    type: "Public",
  },
];

export default function VoicesLibrary({ onSelectVoice }: { onSelectVoice?: (voice: VoiceItem) => void }) {
  const [activeTab, setActiveTab] = useState<"my_voices" | "heygen_library">("heygen_library");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState<"All" | "Female" | "Male">("All");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All languages");
  const [languageSearch, setLanguageSearch] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(14);
  const [voiceCatalog, setVoiceCatalog] = useState<VoiceItem[]>(mockVoices);

  const fetchVoices = async () => {
    try {
      const res = await fetch("/api/v2/voices");
      if (res.ok) {
        const data = await res.json();
        const dbItems: any[] = data.voices || [];
        const customVoices: VoiceItem[] = dbItems
          .filter((v) => v.type === "instant_clone" || v.providerName === "custom_cloned")
          .map((v) => ({
            id: v.id,
            name: v.name,
            description: v.description || "Custom Cloned Voice",
            useCases: ["Conversational", "Ads and Social"],
            age: "Young adult",
            gender: (v.gender as any) || "Female",
            language: v.languageDefault || "English (United States)",
            flag: "🎙️",
            country: "Custom",
            type: "Custom",
          }));
        setVoiceCatalog([...customVoices, ...mockVoices]);
      }
    } catch (e) {
      console.error("Failed to load voices:", e);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  // Filters Dropdown State
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  // Selected Filters
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);

  // Modals state
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Outside click refs
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const genderDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target as Node)) {
        setIsGenderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUseCase = (useCase: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(useCase) ? prev.filter((u) => u !== useCase) : [...prev, useCase]
    );
  };

  const toggleAge = (age: string) => {
    setSelectedAges((prev) =>
      prev.includes(age) ? prev.filter((a) => a !== age) : [...prev, age]
    );
  };

  const clearAllFilters = () => {
    setSelectedUseCases([]);
    setSelectedAges([]);
  };

  const activeFilterCount = selectedUseCases.length + selectedAges.length;

  // Filtered Voices Logic
  const filteredVoices = voiceCatalog.filter((voice) => {
    const matchesTab = activeTab === "my_voices" ? voice.type === "Custom" : true;

    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGender = selectedGender === "All" || voice.gender === selectedGender;

    const matchesLang =
      selectedLanguage === "All languages" ||
      voice.language.toLowerCase().includes(selectedLanguage.toLowerCase()) ||
      selectedLanguage.toLowerCase().includes(voice.language.toLowerCase()) ||
      voice.language === "All languages";

    const matchesUseCase =
      selectedUseCases.length === 0 ||
      voice.useCases.some((u) => selectedUseCases.includes(u));

    const matchesAge =
      selectedAges.length === 0 || selectedAges.includes(voice.age);

    return matchesTab && matchesSearch && matchesGender && matchesLang && matchesUseCase && matchesAge;
  });

  const filteredLanguages = languagesList.filter((l) =>
    l.name.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const handlePlayVoice = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(voiceId);
      setTimeout(() => {
        setPlayingVoiceId((prev) => (prev === voiceId ? null : prev));
      }, 4000);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. TOP ACTION BAR */}
      <div className="w-full px-8 pt-6 pb-4 flex items-center justify-between border-b border-[#141b2c] z-30">
        <div className="flex items-center gap-3">
          {/* Clone your voice button */}
          <button
            onClick={() => setIsCloneModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#121828] hover:bg-[#19233b] border border-[#233152] hover:border-blue-500/50 text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
          >
            <Mic size={15} className="text-blue-400" />
            <span>Clone your voice</span>
          </button>

          {/* Design a voice button */}
          <button
            onClick={() => setIsDesignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#121828] hover:bg-[#19233b] border border-[#233152] hover:border-purple-500/50 text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles size={15} className="text-purple-400" />
            <span>Design a voice</span>
          </button>

          {/* Import from 3rd party button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#121828] hover:bg-[#19233b] border border-[#233152] hover:border-emerald-500/50 text-xs font-semibold text-slate-200 transition-all shadow-sm cursor-pointer"
          >
            <Download size={15} className="text-emerald-400" />
            <span>Import from 3rd party</span>
          </button>
        </div>

        {/* Ask Rhys Copilot Widget */}
        <AskRhysWidget />
      </div>

      {/* 2. TABS & FILTER TOOLBAR */}
      <div className="px-8 pt-6 max-w-7xl w-full mx-auto">
        {/* Tab Headers */}
        <div className="flex items-center gap-8 border-b border-[#172036] pb-3 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("my_voices")}
            className={`transition-colors relative pb-3 cursor-pointer ${
              activeTab === "my_voices"
                ? "text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            My voices
            {activeTab === "my_voices" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("heygen_library")}
            className={`transition-colors relative pb-3 cursor-pointer ${
              activeTab === "heygen_library"
                ? "text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            HeyGen library
            {activeTab === "heygen_library" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500"></span>
            )}
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 mb-4 relative z-20">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voices..."
              className="w-full bg-[#0d1222] border border-[#1e2a44] focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2.5">
            {/* 1. LANGUAGE DROPDOWN (Matches Screenshot 2) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => {
                  setIsLangDropdownOpen(!isLangDropdownOpen);
                  setIsFilterDropdownOpen(false);
                  setIsGenderDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors border cursor-pointer ${
                  selectedLanguage !== "All languages"
                    ? "bg-[#18233c] text-blue-300 border-blue-500/60 font-semibold"
                    : "bg-[#0d1222] border-[#1e2a44] text-slate-300 hover:text-white hover:border-[#2e3e63]"
                }`}
              >
                <Globe size={13} className="text-blue-400" />
                <span className="max-w-[130px] truncate">{selectedLanguage}</span>
                <ChevronDown size={13} className="text-slate-500" />
              </button>

              {/* Language Dropdown Menu */}
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 bg-[#0c111e] border border-[#222f4d] rounded-2xl shadow-2xl p-2 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {/* Search inside language dropdown */}
                  <div className="relative p-1 mb-1">
                    <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={languageSearch}
                      onChange={(e) => setLanguageSearch(e.target.value)}
                      placeholder="Search language..."
                      className="w-full bg-[#111728] border border-[#1e2a44] focus:border-blue-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* Languages list */}
                  <div className="overflow-y-auto max-h-80 space-y-0.5 pr-1">
                    {filteredLanguages.map((lang) => {
                      const isSelected = selectedLanguage === lang.name;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLanguage(lang.name);
                            setIsLangDropdownOpen(false);
                            setLanguageSearch("");
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#18233d] text-blue-400 font-semibold"
                              : "text-slate-300 hover:bg-[#131a2c] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-base">{lang.flag}</span>
                            <span className="truncate">{lang.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-blue-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. GENDER DROPDOWN */}
            <div className="relative" ref={genderDropdownRef}>
              <button
                onClick={() => {
                  setIsGenderDropdownOpen(!isGenderDropdownOpen);
                  setIsFilterDropdownOpen(false);
                  setIsLangDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-colors border cursor-pointer ${
                  selectedGender !== "All"
                    ? "bg-[#18233c] text-blue-300 border-blue-500/60 font-semibold"
                    : "bg-[#0d1222] border-[#1e2a44] text-slate-300 hover:text-white hover:border-[#2e3e63]"
                }`}
              >
                <span>{selectedGender === "All" ? "All genders" : selectedGender}</span>
                <ChevronDown size={13} className="text-slate-500" />
              </button>

              {isGenderDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#0c111e] border border-[#222f4d] rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-150 backdrop-blur-xl">
                  {["All", "Female", "Male"].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setSelectedGender(g as any);
                        setIsGenderDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        selectedGender === g
                          ? "bg-blue-600/30 text-blue-300 font-semibold"
                          : "text-slate-300 hover:bg-[#141b2c] hover:text-white"
                      }`}
                    >
                      <span>{g === "All" ? "All genders" : g}</span>
                      {selectedGender === g && <Check size={13} className="text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. FILTERS DROPDOWN (Matches Screenshot 1) */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                onClick={() => {
                  setIsFilterDropdownOpen(!isFilterDropdownOpen);
                  setIsLangDropdownOpen(false);
                  setIsGenderDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-colors cursor-pointer ${
                  activeFilterCount > 0
                    ? "bg-[#18233c] text-blue-300 border-blue-500/60 font-semibold"
                    : "bg-[#0d1222] border-[#1e2a44] text-slate-300 hover:text-white hover:border-[#2e3e63]"
                }`}
              >
                <Filter size={13} className={activeFilterCount > 0 ? "text-blue-400" : "text-slate-400"} />
                <span>{activeFilterCount} Filters</span>
                <ChevronDown size={13} className="text-slate-500" />
              </button>

              {/* Filters Panel Popover */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-[420px] bg-[#0c111e] border border-[#222f4d] rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1b2742] mb-4">
                    <h3 className="text-sm font-bold text-white">Filters</h3>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                      >
                        <RotateCcw size={11} /> Reset
                      </button>
                    )}
                  </div>

                  {/* Section 1: Use cases */}
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-slate-300 mb-2.5">Use cases</h4>
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                      {[
                        "Conversational",
                        "Ads and Social",
                        "Informative and educational",
                        "Narrative & Story",
                      ].map((useCase) => {
                        const isChecked = selectedUseCases.includes(useCase);
                        return (
                          <div
                            key={useCase}
                            onClick={() => toggleUseCase(useCase)}
                            className="flex items-center gap-2.5 text-slate-300 hover:text-white cursor-pointer group"
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                                isChecked
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : "bg-[#111728] border-[#22304d] group-hover:border-slate-500"
                              }`}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className="text-xs">{useCase}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Voice age */}
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold text-slate-300 mb-2.5">Voice age</h4>
                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                      {["Young adult", "Middle-aged", "Old"].map((age) => {
                        const isChecked = selectedAges.includes(age);
                        return (
                          <div
                            key={age}
                            onClick={() => toggleAge(age)}
                            className="flex items-center gap-2.5 text-slate-300 hover:text-white cursor-pointer group"
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                                isChecked
                                  ? "bg-blue-600 border-blue-500 text-white"
                                  : "bg-[#111728] border-[#22304d] group-hover:border-slate-500"
                              }`}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className="text-xs">{age}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. VOICES LIST TABLE */}
        <div className="space-y-1 mt-2 pb-16">
          {filteredVoices.length === 0 ? (
            <div className="p-12 text-center bg-[#090d17] border border-[#172035] rounded-2xl">
              <p className="text-sm text-slate-300 font-semibold mb-1">No voices found</p>
              <p className="text-xs text-slate-500 mb-3">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGender("All");
                  setSelectedLanguage("All languages");
                  clearAllFilters();
                }}
                className="px-3.5 py-1.5 bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredVoices.slice(0, visibleCount).map((voice) => {
              const isPlaying = playingVoiceId === voice.id;

              return (
                <div
                  key={voice.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 group ${
                    isPlaying
                      ? "bg-[#141c30] border-blue-500/60 shadow-md shadow-blue-500/10"
                      : "bg-[#090d17] border-[#151c2d] hover:bg-[#0f1525] hover:border-[#222f4c]"
                  }`}
                >
                  {/* Left: Play Button & Voice Details */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => handlePlayVoice(voice.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                        isPlaying
                          ? "bg-blue-600 text-white ring-2 ring-blue-400/50 shadow-md animate-pulse"
                          : "bg-[#151c2d] text-slate-300 hover:bg-blue-600 hover:text-white group-hover:bg-[#1f2a43]"
                      }`}
                    >
                      {isPlaying ? (
                        <Pause size={13} />
                      ) : (
                        <Play size={13} className="ml-0.5 fill-current" />
                      )}
                    </button>

                    {/* Voice Meta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                          {voice.name}
                        </h4>
                        {isPlaying && (
                          <span className="flex items-center gap-1 text-[10px] text-blue-400 font-mono">
                            <Volume2 size={12} className="animate-bounce" /> Playing sample...
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {voice.description}
                      </p>
                    </div>
                  </div>

                  {/* Right: Badges, Flag & Action Menu */}
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {voice.type}
                    </span>

                    <span className="text-base" title={voice.country}>
                      {voice.flag}
                    </span>

                    <button
                      onClick={() => {
                        if (onSelectVoice) onSelectVoice(voice);
                        alert(`Voice "${voice.name}" selected for your video project!`);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      Use
                    </button>

                    <button className="text-slate-500 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#18233a] transition-colors cursor-pointer">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* See More Expandable Button */}
          {visibleCount < filteredVoices.length && (
            <div className="text-center pt-5">
              <button
                onClick={() => setVisibleCount((prev) => prev + 10)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-4 py-2 rounded-xl bg-[#0e1423] border border-[#1b253c] hover:border-[#2a3a5f] transition-all cursor-pointer"
              >
                <span>See More</span>
                <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODALS (Create Voice Clone, Design Voice, Import) */}
      <CreateVoiceCloneModal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        onSuccess={() => {
          fetchVoices();
          setActiveTab("my_voices");
        }}
      />

      <DesignVoiceModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        onSuccess={(name) => {
          // Add newly generated voice
        }}
      />

      <ImportVoiceModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
