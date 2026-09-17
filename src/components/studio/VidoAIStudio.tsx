"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  FolderClosed,
  LayoutTemplate,
  HelpCircle,
  Bell,
  Plus,
  Clapperboard,
  User,
  Mic,
  FileText,
  Image as ImageIcon,
  Type,
  Component,
  Music,
  Shuffle,
  Subtitles,
  Palette,
  Crown,
  Volume2,
  Maximize2,
  Lock,
  Eye,
  Scissors,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Layers,
  Download,
  Check,
  AlertCircle,
  X,
  RefreshCw,
  Loader2,
  Wand2,
  Move,
  Share2,
  Bot,
} from "lucide-react";
import UserMenuDropdown from "../dashboard/UserMenuDropdown";
import VideoAgentModal from "./VideoAgentModal";
import { useAuth } from "@/context/AuthContext";

export interface TextOverlayItem {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  positionX: number;
  positionY: number;
  animation?: string;
}

export interface AvatarPose {
  x: number;
  y: number;
  scale: number;
}

export interface SceneItem {
  id: string;
  orderIndex: number;
  scriptText: string;
  avatarId: string | null;
  avatarPose?: string | null;
  voiceId: string | null;
  durationSeconds: number;
  backgroundType: string;
  backgroundValue: string;
  captionsEnabled: boolean;
  transitionToNext: string;
  textOverlays?: TextOverlayItem[];
}

interface AvatarItem {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  category: string;
  gender: string;
}

interface VoiceItem {
  id: string;
  name: string;
  languageDefault: string;
  description: string | null;
  gender: string;
}

export default function VidoAIStudio({
  onBackToDashboard,
  projectId: initialProjectId,
}: {
  onBackToDashboard?: () => void;
  projectId?: string;
}) {
  const { user, refreshUser } = useAuth();
  const [projectId, setProjectId] = useState<string | null>(initialProjectId || null);
  const [projectName, setProjectName] = useState("Product Explainer Video");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<SceneItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Avatars & Voices from DB
  const [avatarsList, setAvatarsList] = useState<AvatarItem[]>([]);
  const [voicesList, setVoicesList] = useState<VoiceItem[]>([]);
  const [brandKitData, setBrandKitData] = useState<any | null>(null);

  // Editor states
  const [activeTab, setActiveTab] = useState<"scene" | "avatar" | "voice" | "layer">("scene");
  const [activeLeftTool, setActiveLeftTool] = useState("scenes");
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  // Canvas Layer Selection & Dragging
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("avatar");
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // AI Script Assistant Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAction, setAiAction] = useState<"generate" | "rewrite" | "generate_scenes">("generate");
  const [aiTopic, setAiTopic] = useState("");
  const [aiAudience, setAiAudience] = useState("General Audience");
  const [aiTone, setAiTone] = useState<"professional" | "casual" | "enthusiastic" | "concise" | "urgent">("professional");
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [aiGeneratedScript, setAiGeneratedScript] = useState("");
  const [aiGeneratedScenes, setAiGeneratedScenes] = useState<any[]>([]);

  // Export / Render modal states
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);
  const [renderStatus, setRenderStatus] = useState<"queued" | "processing" | "completed" | "failed">("queued");
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderOutputUrl, setRenderOutputUrl] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Sharing modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // AI Video Agent modal state
  const [isVideoAgentOpen, setIsVideoAgentOpen] = useState(false);

  // Real-time lip-sync & speech playback states
  const [isLipSyncing, setIsLipSyncing] = useState(false);
  const [activeSpokenWord, setActiveSpokenWord] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch initial project data and libraries
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [avatarsRes, voicesRes, brandRes] = await Promise.all([
          fetch("/api/v2/avatars"),
          fetch("/api/v2/voices"),
          fetch("/api/v2/brand"),
        ]);

        if (avatarsRes.ok) {
          const data = await avatarsRes.json();
          setAvatarsList(data.avatars || []);
        }
        if (voicesRes.ok) {
          const data = await voicesRes.json();
          setVoicesList(data.voices || []);
        }
        if (brandRes.ok) {
          const data = await brandRes.json();
          if (data.brandKit) setBrandKitData(data.brandKit);
        }

        let targetProjId = projectId;
        if (!targetProjId) {
          const projListRes = await fetch("/api/v2/projects");
          if (projListRes.ok) {
            const data = await projListRes.json();
            if (data.projects && data.projects.length > 0) {
              targetProjId = data.projects[0].id;
              setProjectId(targetProjId);
            }
          }
        }

        if (targetProjId) {
          const projRes = await fetch(`/api/v2/projects/${targetProjId}`);
          if (projRes.ok) {
            const data = await projRes.json();
            if (data.project) {
              setProjectName(data.project.name);
              setAspectRatio(data.project.orientation === "portrait" ? "9:16" : "16:9");
              if (data.project.scenes && data.project.scenes.length > 0) {
                setScenes(data.project.scenes);
                setHistory([data.project.scenes]);
                setHistoryIndex(0);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load studio data:", err);
      }
    }

    loadInitialData();
  }, [projectId]);

  // Current active scene
  const currentScene = scenes[activeSceneIndex] || scenes[0];
  const activeAvatar = avatarsList.find((a) => a.id === currentScene?.avatarId) || avatarsList[0];
  const activeVoice = voicesList.find((v) => v.id === currentScene?.voiceId) || voicesList[0];

  // Parse avatar pose safely with robust fallbacks
  const avatarPose: AvatarPose = (() => {
    try {
      if (currentScene?.avatarPose && currentScene.avatarPose !== "null") {
        const parsed =
          typeof currentScene.avatarPose === "string"
            ? JSON.parse(currentScene.avatarPose)
            : currentScene.avatarPose;
        if (
          parsed &&
          typeof parsed === "object" &&
          typeof parsed.x === "number" &&
          typeof parsed.y === "number"
        ) {
          return {
            x: parsed.x,
            y: parsed.y,
            scale: typeof parsed.scale === "number" ? parsed.scale : 1.0,
          };
        }
      }
    } catch {
      // fallback
    }
    return { x: 50, y: 50, scale: 1.0 };
  })();

  // 2. Push state to history for Undo/Redo
  const pushState = (newScenes: SceneItem[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newScenes);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setScenes(newScenes);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setScenes(history[newIndex]);
      triggerSceneAutoSave(history[newIndex][activeSceneIndex] || history[newIndex][0]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setScenes(history[newIndex]);
      triggerSceneAutoSave(history[newIndex][activeSceneIndex] || history[newIndex][0]);
    }
  };

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, historyIndex, activeSceneIndex]);

  // 3. Debounced scene auto-save
  const triggerSceneAutoSave = (updatedScene: SceneItem) => {
    setIsAutoSaving(true);
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);

    autoSaveTimeout.current = setTimeout(async () => {
      try {
        if (projectId && updatedScene.id) {
          await fetch(`/api/v2/projects/${projectId}/scenes`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sceneId: updatedScene.id,
              scriptText: updatedScene.scriptText,
              avatarId: updatedScene.avatarId,
              avatarPose: updatedScene.avatarPose,
              voiceId: updatedScene.voiceId,
              durationSeconds: updatedScene.durationSeconds,
              backgroundValue: updatedScene.backgroundValue,
              captionsEnabled: updatedScene.captionsEnabled,
              textOverlays: updatedScene.textOverlays || [],
            }),
          });
        }
        setLastSaved(new Date());
      } catch (err) {
        console.error("Autosave error:", err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 800);
  };

  const handleScriptChange = (text: string) => {
    if (!currentScene) return;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const estDuration = Math.max(3.0, parseFloat((wordCount / 2.5).toFixed(1)));

    const updated = {
      ...currentScene,
      scriptText: text,
      durationSeconds: estDuration,
    };

    const newScenes = [...scenes];
    newScenes[activeSceneIndex] = updated;
    pushState(newScenes);
    triggerSceneAutoSave(updated);
  };

  const handleAvatarSelect = (avatarId: string) => {
    if (!currentScene) return;
    const selectedAvatarObj = avatarsList.find((a) => a.id === avatarId);
    const avGender = (selectedAvatarObj?.gender || "Female").toLowerCase();

    // Check if the current scene's voice matches the new avatar's gender
    const currentVoiceObj = voicesList.find((v) => v.id === currentScene.voiceId);
    const isCurrentVoiceCompatible = currentVoiceObj && (currentVoiceObj.gender || "").toLowerCase() === avGender;

    let targetVoiceId = currentScene.voiceId;
    if (!isCurrentVoiceCompatible) {
      // Auto-switch voice to first compatible voice of the selected avatar's gender!
      const compatibleVoice = voicesList.find((v) => (v.gender || "").toLowerCase() === avGender);
      targetVoiceId = compatibleVoice?.id || (avGender === "male" ? "voice_ben" : "voice_annie");
    }

    const updated = { ...currentScene, avatarId, voiceId: targetVoiceId };
    const newScenes = [...scenes];
    newScenes[activeSceneIndex] = updated;
    pushState(newScenes);
    triggerSceneAutoSave(updated);
  };

  const handleVoiceSelect = (voiceId: string) => {
    if (!currentScene) return;
    const selectedVoiceObj = voicesList.find((v) => v.id === voiceId);
    const avGender = (activeAvatar?.gender || "Female").toLowerCase();

    // Safety check: only allow selecting voices of matching gender
    if (selectedVoiceObj && (selectedVoiceObj.gender || "").toLowerCase() !== avGender) {
      return;
    }

    const updated = { ...currentScene, voiceId };
    const newScenes = [...scenes];
    newScenes[activeSceneIndex] = updated;
    pushState(newScenes);
    triggerSceneAutoSave(updated);
  };

  // Avatar Pose Update (Position / Scale)
  const handleUpdateAvatarPose = (updates: Partial<AvatarPose>) => {
    if (!currentScene) return;
    const currentPose = avatarPose || { x: 50, y: 50, scale: 1.0 };
    const newPose: AvatarPose = {
      x: updates.x ?? currentPose.x ?? 50,
      y: updates.y ?? currentPose.y ?? 50,
      scale: updates.scale ?? currentPose.scale ?? 1.0,
    };
    const updated = {
      ...currentScene,
      avatarPose: JSON.stringify(newPose),
    };
    const newScenes = [...scenes];
    newScenes[activeSceneIndex] = updated;
    pushState(newScenes);
    triggerSceneAutoSave(updated);
  };

  // Text Overlays Management
  const handleAddTextOverlay = (type: "heading" | "subtitle" | "body") => {
    if (!currentScene) return;
    const overlays = currentScene.textOverlays || [];
    const newOverlay: TextOverlayItem = {
      id: "overlay_" + Date.now(),
      text: type === "heading" ? "Add Headline Text" : type === "subtitle" ? "Add Subtitle Here" : "Add body explanation text...",
      font: brandKitData?.fontFamily || "Inter",
      size: type === "heading" ? 36 : type === "subtitle" ? 24 : 16,
      color: type === "heading" ? (brandKitData?.accentColor || "#00c4ff") : "#ffffff",
      positionX: 50,
      positionY: type === "heading" ? 25 : type === "subtitle" ? 38 : 75,
    };

    const updated = {
      ...currentScene,
      textOverlays: [...overlays, newOverlay],
    };

    const newScenes = [...scenes];
    newScenes[activeSceneIndex] = updated;
    pushState(newScenes);
    setSelectedLayerId(newOverlay.id);
    setActiveTab("layer");
    triggerSceneAutoSave(updated);
  };

  const handleUpdateTextOverlay = (id: string, updates: Partial<TextOverlayItem>) => {
    if (!currentScene) return;
    const overlays = (currentScene.textOverlays || []).map((to) =>
      to.id === id ? { ...to, ...updates } : to
    );

    const updated = {
      ...currentScene,
      textOverlays: overlays,
    };

    const newScenes = [...scenes];
    newScenes[activeSceneIndex] = updated;
    pushState(newScenes);
    triggerSceneAutoSave(updated);
  };

  const handleDeleteTextOverlay = (id: string) => {
    if (!currentScene) return;
    const overlays = (currentScene.textOverlays || []).filter((to) => to.id !== id);
    const updated = {
      ...currentScene,
      textOverlays: overlays,
    };

    const newScenes = [...scenes];
    newScenes[activeSceneIndex] = updated;
    pushState(newScenes);
    setSelectedLayerId("avatar");
    triggerSceneAutoSave(updated);
  };

  // Canvas Mouse Drag Handler
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingLayer || !selectedLayerId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const yPct = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    if (selectedLayerId === "avatar") {
      handleUpdateAvatarPose({ x: xPct, y: yPct });
    } else {
      handleUpdateTextOverlay(selectedLayerId, { positionX: xPct, positionY: yPct });
    }
  };

  const handleAddScene = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/v2/projects/${projectId}/scenes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scriptText: "New Scene script...",
          avatarId: currentScene?.avatarId || "avatar_emma",
          voiceId: currentScene?.voiceId || "voice_annie",
          durationSeconds: 5.0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const newScenes = [...scenes, data.scene];
        pushState(newScenes);
        setActiveSceneIndex(scenes.length);
      }
    } catch (err) {
      console.error("Failed to add scene:", err);
    }
  };

  const handleDeleteScene = async (index: number) => {
    if (scenes.length <= 1) return;
    const sceneToDelete = scenes[index];
    try {
      if (projectId && sceneToDelete.id) {
        await fetch(`/api/v2/projects/${projectId}/scenes?sceneId=${sceneToDelete.id}`, {
          method: "DELETE",
        });
      }
      const updated = scenes.filter((_, i) => i !== index);
      pushState(updated);
      setActiveSceneIndex(Math.max(0, index - 1));
    } catch (err) {
      console.error("Failed to delete scene:", err);
    }
  };

  // 4. Voice Preview Player with Real-Time Lip-Sync & Word Sync
  const handlePlayVoicePreview = async () => {
    if (isPlayingPreview && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingPreview(false);
      setIsLipSyncing(false);
      setActiveSpokenWord(null);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      return;
    }

    try {
      setAudioLoading(true);
      const res = await fetch("/api/v2/tts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentScene?.scriptText || "Hello, this is your AI voice preview.",
          voiceId: currentScene?.voiceId || "voice_annie",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl) {
          if (!audioRef.current) {
            audioRef.current = new Audio();
          }
          audioRef.current.src = data.audioUrl;
          
          const timestamps = data.wordTimestamps || [];

          audioRef.current.onended = () => {
            setIsPlayingPreview(false);
            setIsLipSyncing(false);
            setActiveSpokenWord(null);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
          };

          await audioRef.current.play();
          setIsPlayingPreview(true);
          setIsLipSyncing(true);

          if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
          audioIntervalRef.current = setInterval(() => {
            if (!audioRef.current) return;
            const curTime = audioRef.current.currentTime;
            
            if (timestamps.length > 0) {
              const matched = timestamps.find(
                (w: any) => curTime >= w.start && curTime <= w.end
              );
              setActiveSpokenWord(matched ? matched.word : null);
            }
          }, 50);
        }
      }
    } catch (err) {
      console.error("Voice preview error:", err);
    } finally {
      setAudioLoading(false);
    }
  };

  // 5. AI Script Assistant Handlers
  const handleRunAiScriptAction = async () => {
    try {
      setAiIsLoading(true);
      const res = await fetch("/api/v2/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: aiAction,
          topic: aiTopic || projectName,
          targetAudience: aiAudience,
          scriptText: currentScene?.scriptText || "",
          tone: aiTone,
          prompt: aiTopic || projectName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (aiAction === "generate_scenes") {
          setAiGeneratedScenes(data.scenes || []);
        } else {
          setAiGeneratedScript(data.script || "");
        }
      }
    } catch (e) {
      console.error("AI Script generation error:", e);
    } finally {
      setAiIsLoading(false);
    }
  };

  const handleApplyAiScript = () => {
    if (aiGeneratedScript) {
      handleScriptChange(aiGeneratedScript);
      setIsAiModalOpen(false);
      setAiGeneratedScript("");
    }
  };

  const handleApplyAiScenes = async () => {
    if (!aiGeneratedScenes || aiGeneratedScenes.length === 0 || !projectId) return;

    try {
      const createdScenes: SceneItem[] = [];
      for (const sc of aiGeneratedScenes) {
        const res = await fetch(`/api/v2/projects/${projectId}/scenes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scriptText: sc.scriptText,
            durationSeconds: sc.durationSeconds || 5.0,
            backgroundValue: sc.backgroundValue || "#0b101c",
            avatarId: currentScene?.avatarId || "avatar_emma",
            voiceId: currentScene?.voiceId || "voice_annie",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          createdScenes.push(data.scene);
        }
      }
      if (createdScenes.length > 0) {
        const updated = [...scenes, ...createdScenes];
        pushState(updated);
        setActiveSceneIndex(scenes.length);
      }
      setIsAiModalOpen(false);
      setAiGeneratedScenes([]);
    } catch (e) {
      console.error("Apply AI scenes error:", e);
    }
  };

  // 6. Real Render Trigger
  const handleTriggerExport = async () => {
    if (!projectId) return;
    setIsRenderModalOpen(true);
    setRenderStatus("queued");
    setRenderProgress(10);
    setRenderOutputUrl(null);
    setRenderError(null);

    try {
      const res = await fetch(`/api/v2/projects/${projectId}/render`, {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to start render");
      }

      const { render } = await res.json();
      const renderId = render.id;

      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/v2/renders/${renderId}`);
          if (statusRes.ok) {
            const data = await statusRes.json();
            const r = data.render;
            setRenderProgress(r.progressPercentage || 25);
            setRenderStatus(r.status);

            if (r.status === "completed") {
              clearInterval(interval);
              setRenderOutputUrl(r.outputAssetUrl);
              refreshUser();
            } else if (r.status === "failed") {
              clearInterval(interval);
              setRenderError(r.errorMessage || "Rendering failed during video encoding.");
            }
          }
        } catch {
          // ignore transient polling errors
        }
      }, 1500);
    } catch (err: any) {
      setRenderStatus("failed");
      setRenderError(err?.message || "Render request failed");
    }
  };

  const selectedOverlay = (currentScene?.textOverlays || []).find((to) => to.id === selectedLayerId);

  return (
    <div
      className="w-full h-screen bg-[#07090e] text-slate-200 flex flex-col overflow-hidden select-none"
      onMouseUp={() => setIsDraggingLayer(false)}
    >
      {/* 1. TOP NAVIGATION BAR */}
      <header className="h-14 min-h-14 bg-[#0a0d16] border-b border-[#171f33] px-4 flex items-center justify-between z-30">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-1.5 rounded-lg bg-[#141b2c] hover:bg-[#1c263e] text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs cursor-pointer"
              title="Return to Home"
            >
              <ArrowLeft size={15} /> Dashboard
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
              ▶
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight">VidoAI</span>
              <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline">Studio Editor</span>
            </div>
          </div>

          <div className="h-5 w-[1px] bg-[#1a243a]"></div>

          {/* Undo / Redo buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                historyIndex > 0 ? "hover:bg-[#151e33] text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                historyIndex < history.length - 1 ? "hover:bg-[#151e33] text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={14} />
            </button>
          </div>

          <div className="h-5 w-[1px] bg-[#1a243a]"></div>

          {/* Auto-Save indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {isAutoSaving ? (
              <span className="flex items-center gap-1 text-cyan-400 text-[11px] ml-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                <Loader2 size={11} className="animate-spin" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] ml-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={11} /> Saved to cloud
              </span>
            )}
          </div>
        </div>

        {/* Center: Project Title Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (projectId) {
                fetch(`/api/v2/projects/${projectId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: e.target.value }),
                });
              }
            }}
            className="bg-transparent hover:bg-[#121827] focus:bg-[#121827] border border-transparent hover:border-[#1e2a44] focus:border-cyan-500 rounded-lg px-2.5 py-1 text-sm font-semibold text-white focus:outline-none text-center"
          />
        </div>

        {/* Right: Aspect Ratio, Voice Preview & Export */}
        <div className="flex items-center gap-3">
          {/* Aspect Ratio Switcher */}
          <button
            onClick={() => {
              const newRatio = aspectRatio === "16:9" ? "9:16" : "16:9";
              setAspectRatio(newRatio);
              if (projectId) {
                fetch(`/api/v2/projects/${projectId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orientation: newRatio === "16:9" ? "landscape" : "portrait" }),
                });
              }
            }}
            className="flex items-center gap-1 bg-[#101625] border border-[#1e2940] hover:border-cyan-500 rounded-lg px-2.5 py-1 text-xs text-slate-300 cursor-pointer"
            title="Toggle Aspect Ratio"
          >
            <span>{aspectRatio}</span>
            <ChevronDown size={13} />
          </button>

          {/* Voice Preview Button */}
          <button
            onClick={handlePlayVoicePreview}
            disabled={audioLoading}
            className="flex items-center gap-1.5 bg-[#121828] hover:bg-[#1a233a] border border-[#212e48] hover:border-blue-500/50 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {audioLoading ? (
              <Loader2 size={13} className="text-cyan-400 animate-spin" />
            ) : isPlayingPreview ? (
              <Pause size={13} className="text-cyan-400 fill-cyan-400" />
            ) : (
              <Play size={13} className="text-cyan-400 fill-cyan-400" />
            )}
            <span>{isPlayingPreview ? "Pause Audio" : "Voice Preview"}</span>
          </button>

          {/* AI Video Agent Button */}
          <button
            onClick={() => setIsVideoAgentOpen(true)}
            className="flex items-center gap-1.5 bg-[#141b2d] hover:bg-[#1e2a44] border border-[#233355] hover:border-cyan-500/50 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
            title="AI Video Agent Copilot"
          >
            <Bot size={13} className="text-cyan-400" />
            <span>AI Agent</span>
          </button>

          {/* Share Project Button */}
          <button
            onClick={async () => {
              if (!projectId) return;
              setIsShareModalOpen(true);
              setShareLoading(true);
              try {
                const res = await fetch(`/api/v2/projects/${projectId}/share`, { method: "POST" });
                const data = await res.json();
                if (data.shareUrl) {
                  setShareUrl(data.shareUrl);
                }
              } catch (e) {
                console.error("Share error:", e);
              } finally {
                setShareLoading(false);
              }
            }}
            className="flex items-center gap-1.5 bg-[#121828] hover:bg-[#1a233a] border border-[#212e48] hover:border-blue-500/50 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            title="Share & Collaborate"
          >
            <Share2 size={13} className="text-blue-400" />
            <span>Share</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleTriggerExport}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles size={13} />
            <span>Export Video</span>
          </button>

          <div className="h-5 w-[1px] bg-[#1a243a]"></div>

          <UserMenuDropdown placement="top-bar" />
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOOL ICON RAIL */}
        <aside className="w-16 min-w-16 bg-[#090c15] border-r border-[#151c2d] flex flex-col justify-between py-3 select-none z-20">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleAddScene}
              className="w-11 h-11 mb-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 cursor-pointer"
              title="Add New Scene"
            >
              <Plus size={18} />
            </button>

            {[
              { id: "scenes", label: "Scenes", icon: Clapperboard },
              { id: "avatar", label: "Avatar", icon: User },
              { id: "voice", label: "Voice", icon: Mic },
              { id: "text", label: "Text", icon: Type },
              { id: "brand_kit", label: "Brand Kit", icon: Palette },
            ].map((tool) => {
              const Icon = tool.icon;
              const isActive = activeLeftTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveLeftTool(tool.id);
                    if (tool.id === "avatar") setActiveTab("avatar");
                    else if (tool.id === "voice") setActiveTab("voice");
                    else if (tool.id === "text") handleAddTextOverlay("heading");
                  }}
                  className={`w-11 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[9px] transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#18233a] text-cyan-400 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#101625]"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          {/* Credits Box */}
          <div className="p-1.5 flex flex-col items-center text-center">
            <div className="w-full bg-[#101626] border border-[#1a2640] rounded-xl p-2 mb-1">
              <span className="text-[9px] text-slate-400 block">AI Credits</span>
              <span className="text-[11px] font-bold text-white">
                {user?.credits ?? 1000}/{user?.maxCredits ?? 1000}
              </span>
              <div className="w-full h-1 bg-[#1c2742] rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{ width: `${Math.min(100, ((user?.credits ?? 1000) / (user?.maxCredits ?? 1000)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </aside>

        {/* SECONDARY LEFT PANEL: SCENES OR BRAND KIT */}
        {activeLeftTool === "brand_kit" ? (
          <div className="w-56 min-w-56 bg-[#0a0d16] border-r border-[#151c2d] flex flex-col p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Palette size={13} className="text-cyan-400" /> Brand Kit
            </h3>
            <p className="text-[10px] text-slate-400 mb-4">One-click apply brand identity.</p>

            {/* Brand Colors */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">Brand Colors</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Primary", hex: brandKitData?.primaryColor || "#0b101c" },
                  { name: "Accent", hex: brandKitData?.accentColor || "#00c4ff" },
                  { name: "Secondary", hex: brandKitData?.secondaryColor || "#7928ca" },
                ].map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      if (!currentScene) return;
                      const updated = { ...currentScene, backgroundValue: c.hex };
                      const newScenes = [...scenes];
                      newScenes[activeSceneIndex] = updated;
                      pushState(newScenes);
                      triggerSceneAutoSave(updated);
                    }}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-lg border border-white/10 hover:border-cyan-400 cursor-pointer group"
                    title={`Apply ${c.name} (${c.hex}) to Scene Background`}
                  >
                    <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: c.hex }}></span>
                    <span className="text-[9px] text-slate-400 group-hover:text-white">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Font */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-300 block mb-1">Brand Typography</span>
              <p className="text-xs font-bold text-white mb-2">{brandKitData?.fontFamily || "Inter, sans-serif"}</p>
              <button
                onClick={() => {
                  if (!currentScene) return;
                  const overlays = (currentScene.textOverlays || []).map((to) => ({
                    ...to,
                    font: brandKitData?.fontFamily || "Inter",
                  }));
                  const updated = { ...currentScene, textOverlays: overlays };
                  const newScenes = [...scenes];
                  newScenes[activeSceneIndex] = updated;
                  pushState(newScenes);
                  triggerSceneAutoSave(updated);
                }}
                className="w-full py-1.5 bg-[#141b2c] hover:bg-[#1a243c] border border-[#22304f] rounded-lg text-xs font-semibold text-cyan-300 cursor-pointer"
              >
                Apply Font to Overlays
              </button>
            </div>

            {/* Brand Logo Overlay Button */}
            <div>
              <span className="text-[11px] font-semibold text-slate-300 block mb-1">Brand Watermark / Logo</span>
              <button
                onClick={() => {
                  handleAddTextOverlay("heading");
                  if (selectedOverlay) {
                    handleUpdateTextOverlay(selectedOverlay.id, { text: "VidoAI" });
                  }
                }}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Insert Logo Text Overlay
              </button>
            </div>
          </div>
        ) : (
          <div className="w-48 min-w-48 bg-[#0a0d16] border-r border-[#151c2d] flex flex-col p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Scenes ({scenes.length})
              </span>
              <button
                onClick={handleAddScene}
                className="p-1 text-slate-400 hover:text-white hover:bg-[#151d30] rounded cursor-pointer"
                title="Add Scene"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {scenes.map((sc, idx) => {
                const scAvatar = avatarsList.find((a) => a.id === sc.avatarId);
                return (
                  <div
                    key={sc.id || idx}
                    onClick={() => {
                      setActiveSceneIndex(idx);
                      setSelectedLayerId("avatar");
                    }}
                    className={`relative rounded-xl p-2 cursor-pointer transition-all border group ${
                      activeSceneIndex === idx
                        ? "bg-[#162035] border-cyan-500 shadow-md shadow-cyan-500/15"
                        : "bg-[#0e1322] border-[#1a233a] hover:border-[#283758]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-300">Scene 0{idx + 1}</span>
                      <span>{Math.round(sc.durationSeconds)}s</span>
                    </div>

                    <div className="aspect-video bg-[#1a2236] rounded-lg overflow-hidden relative flex items-center justify-center border border-white/5">
                      {scAvatar?.thumbnailUrl ? (
                        <img src={scAvatar.thumbnailUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xl">👩‍💼</div>
                      )}
                      <span className="absolute bottom-1 right-1 text-[8px] bg-black/70 px-1 rounded text-white font-mono">
                        0:0{Math.round(sc.durationSeconds)}
                      </span>
                    </div>

                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScene(idx);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-rose-600 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete scene"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CENTER INTERACTIVE VIDEO CANVAS & SCRIPT EDITOR */}
        <div className="flex-1 bg-[#06080d] flex flex-col items-center justify-between p-6 relative overflow-hidden">
          {/* Canvas Floating Top Controls: Add Text / Avatar Tools */}
          <div className="w-full max-w-2xl flex items-center justify-between mb-2 z-20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddTextOverlay("heading")}
                className="px-3 py-1 bg-[#121828] hover:bg-[#1a243c] border border-[#202c46] hover:border-cyan-500 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Type size={13} className="text-cyan-400" /> + Headline
              </button>
              <button
                onClick={() => handleAddTextOverlay("subtitle")}
                className="px-3 py-1 bg-[#121828] hover:bg-[#1a243c] border border-[#202c46] hover:border-cyan-500 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Type size={12} className="text-blue-400" /> + Subtitle
              </button>
              <button
                onClick={() => handleAddTextOverlay("body")}
                className="px-3 py-1 bg-[#121828] hover:bg-[#1a243c] border border-[#202c46] hover:border-cyan-500 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Type size={11} className="text-slate-400" /> + Body
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Selected: <strong className="text-cyan-300">{selectedLayerId === "avatar" ? "Avatar" : selectedOverlay ? "Text Overlay" : "None"}</strong></span>
              {selectedLayerId && selectedLayerId !== "avatar" && (
                <button
                  onClick={() => handleDeleteTextOverlay(selectedLayerId)}
                  className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 rounded cursor-pointer"
                  title="Delete Selected Layer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Main Interactive Video Viewport Canvas */}
          <div
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            className={`relative w-full ${
              aspectRatio === "9:16" ? "max-w-xs aspect-[9/16]" : "max-w-2xl aspect-video"
            } bg-[#0b0e18] rounded-2xl border-2 ${
              isDraggingLayer ? "border-cyan-400" : "border-[#1f2a44]"
            } shadow-2xl overflow-hidden select-none transition-all duration-300`}
            style={{ backgroundColor: currentScene?.backgroundValue || "#0b101c" }}
          >
            {/* Dynamic Avatar Layer with Real-Time Lip-Sync Animation */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedLayerId("avatar");
                setActiveTab("avatar");
                setIsDraggingLayer(true);
              }}
              style={{
                position: "absolute",
                left: `${avatarPose?.x ?? 50}%`,
                top: `${avatarPose?.y ?? 50}%`,
                transform: `translate(-50%, -50%) scale(${avatarPose?.scale ?? 1.0})`,
                zIndex: 10,
              }}
              className={`cursor-move transition-all duration-100 ${
                selectedLayerId === "avatar" ? "ring-2 ring-cyan-400 rounded-full" : ""
              } ${isLipSyncing ? "scale-105" : ""}`}
            >
              {activeAvatar?.previewVideoUrl && activeAvatar.previewVideoUrl.endsWith(".mp4") ? (
                <div className={`relative w-56 h-56 rounded-full overflow-hidden border-2 shadow-2xl bg-slate-900 pointer-events-none transition-all duration-150 ${
                  isLipSyncing ? "border-cyan-400 shadow-cyan-400/40 ring-4 ring-cyan-400/20 scale-105" : "border-cyan-400/40 shadow-cyan-500/20"
                }`}>
                  <video
                    src={activeAvatar.previewVideoUrl}
                    autoPlay={isLipSyncing}
                    loop
                    muted
                    playsInline
                    className={`w-full h-full object-cover transition-transform duration-100 ${
                      isLipSyncing ? "scale-[1.02] brightness-105" : ""
                    }`}
                    ref={(el) => {
                      if (el) {
                        if (isLipSyncing) el.play().catch(() => {});
                        else {
                          el.pause();
                          el.currentTime = 0;
                        }
                      }
                    }}
                  />
                  {isLipSyncing && (
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent pointer-events-none" />
                  )}
                </div>
              ) : activeAvatar?.thumbnailUrl ? (
                <div className={`relative w-52 h-52 rounded-full overflow-hidden border-2 shadow-2xl bg-slate-900 pointer-events-none transition-all duration-150 ${
                  isLipSyncing ? "border-cyan-400 shadow-cyan-400/40 ring-4 ring-cyan-400/20" : "border-cyan-400/40 shadow-cyan-500/20"
                }`}>
                  <img
                    src={activeAvatar.thumbnailUrl}
                    alt={activeAvatar.name}
                    className={`w-full h-full object-cover transition-transform duration-100 ${
                      isLipSyncing ? "scale-[1.02] brightness-105" : ""
                    }`}
                  />
                  {/* Subtle Speaking Indicator Pulse */}
                  {isLipSyncing && (
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-transparent animate-pulse pointer-events-none" />
                  )}
                </div>
              ) : (
                <div className={`w-48 h-48 rounded-full bg-gradient-to-t from-transparent to-blue-500/10 flex items-center justify-center pointer-events-none transition-transform duration-100 ${
                  isLipSyncing ? "scale-105" : ""
                }`}>
                  <span className="text-8xl drop-shadow-xl">👩‍💼</span>
                </div>
              )}
            </div>

            {/* Dynamic Text Overlay Layers */}
            {(currentScene?.textOverlays || []).map((to) => {
              const isSelected = selectedLayerId === to.id;
              return (
                <div
                  key={to.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setSelectedLayerId(to.id);
                    setActiveTab("layer");
                    setIsDraggingLayer(true);
                  }}
                  style={{
                    position: "absolute",
                    left: `${to.positionX}%`,
                    top: `${to.positionY}%`,
                    transform: "translate(-50%, -50%)",
                    color: to.color,
                    fontSize: `${to.size}px`,
                    fontFamily: to.font,
                    zIndex: 25,
                  }}
                  className={`cursor-move px-3 py-1 font-bold whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? "ring-2 ring-cyan-400 bg-black/40 rounded-lg shadow-xl"
                      : "hover:ring-1 hover:ring-white/40"
                  }`}
                >
                  {to.text}
                </div>
              );
            })}

            {/* Captions Overlay with Live Word-by-Word Karaoke Highlight */}
            {currentScene?.captionsEnabled && currentScene?.scriptText && (
              <div className="absolute bottom-6 inset-x-8 z-20 text-center pointer-events-none">
                <div className="inline-block max-w-lg bg-black/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 shadow-2xl">
                  {activeSpokenWord ? (
                    <p className="text-xs md:text-sm font-semibold tracking-wide text-slate-300">
                      {currentScene.scriptText.split(/\s+/).slice(0, 18).map((word, wIdx) => {
                        const cleanWord = word.replace(/[^\w]/g, "").toLowerCase();
                        const activeClean = activeSpokenWord.replace(/[^\w]/g, "").toLowerCase();
                        const isMatch = cleanWord === activeClean;
                        return (
                          <span
                            key={wIdx}
                            className={`inline-block mx-0.5 transition-all duration-100 ${
                              isMatch
                                ? "text-cyan-300 font-extrabold scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                : "text-slate-300"
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </p>
                  ) : (
                    <p className="text-cyan-300 font-bold text-xs md:text-sm">
                      "{currentScene.scriptText.slice(0, 70)}..."
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Script Textarea Input Strip with AI Assistant Button */}
          <div className="w-full max-w-2xl bg-[#0c111e] border border-[#1c2740] rounded-2xl p-3 shadow-xl mt-4">
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <FileText size={13} className="text-cyan-400" /> Scene 0{activeSceneIndex + 1} Script Text
              </span>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono">
                  {currentScene?.scriptText?.split(/\s+/).filter(Boolean).length || 0} words • ~{Math.round(currentScene?.durationSeconds || 5)}s
                </span>

                {/* AI Script Assistant Trigger */}
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105"
                >
                  <Sparkles size={12} />
                  <span>AI Script Assistant</span>
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={currentScene?.scriptText || ""}
              onChange={(e) => handleScriptChange(e.target.value)}
              placeholder="Write or paste your talking avatar script here..."
              className="w-full bg-[#111728] border border-[#1e2a44] focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none resize-none transition-colors"
            />
          </div>
        </div>

        {/* RIGHT INSPECTOR PANEL */}
        <aside className="w-72 min-w-72 bg-[#090d16] border-l border-[#151c2d] flex flex-col select-none">
          {/* Tab Switcher */}
          <div className="flex border-b border-[#171f33]">
            {(["scene", "avatar", "voice", "layer"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold capitalize transition-all border-b-2 cursor-pointer ${
                  activeTab === tab
                    ? "border-cyan-500 text-white bg-[#111728]"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab 1: Scene Settings */}
          {activeTab === "scene" && (
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">Background Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {["#0b101c", "#12192c", "#18233a", "#052e16", "#311042", "#1f1d1d"].map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        if (!currentScene) return;
                        const updated = { ...currentScene, backgroundValue: col };
                        const newScenes = [...scenes];
                        newScenes[activeSceneIndex] = updated;
                        pushState(newScenes);
                        triggerSceneAutoSave(updated);
                      }}
                      className={`h-8 rounded-lg border ${
                        currentScene?.backgroundValue === col ? "border-cyan-400 ring-2 ring-cyan-400/30" : "border-white/10"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Transition */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">Transition</label>
                <div className="flex items-center gap-2">
                  {["cut", "fade", "slide"].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        if (!currentScene) return;
                        const updated = { ...currentScene, transitionToNext: t };
                        const newScenes = [...scenes];
                        newScenes[activeSceneIndex] = updated;
                        pushState(newScenes);
                        triggerSceneAutoSave(updated);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs capitalize border ${
                        currentScene?.transitionToNext === t
                          ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold"
                          : "bg-[#121828] border-[#1e2a44] text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Captions Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#111728] border border-[#1e2a44] rounded-xl">
                <span className="text-xs font-semibold text-slate-200">Show Captions</span>
                <button
                  onClick={() => {
                    if (!currentScene) return;
                    const updated = { ...currentScene, captionsEnabled: !currentScene.captionsEnabled };
                    const newScenes = [...scenes];
                    newScenes[activeSceneIndex] = updated;
                    pushState(newScenes);
                    triggerSceneAutoSave(updated);
                  }}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    currentScene?.captionsEnabled ? "bg-cyan-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      currentScene?.captionsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Avatar Picker & Controls */}
          {activeTab === "avatar" && (
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Avatar Size Scale ({(avatarPose?.scale ?? 1.0).toFixed(2)}x)</label>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={avatarPose?.scale ?? 1.0}
                  onChange={(e) => handleUpdateAvatarPose({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Select Avatar</h4>
              <div className="grid grid-cols-2 gap-2.5">
                {avatarsList.map((av) => {
                  const isSelected = currentScene?.avatarId === av.id;
                  return (
                    <div
                      key={av.id}
                      onClick={() => handleAvatarSelect(av.id)}
                      className={`rounded-xl overflow-hidden border p-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#18233a] border-cyan-500 shadow-md shadow-cyan-500/20"
                          : "bg-[#0f1526] border-[#1c2740] hover:border-[#2b3c63]"
                      }`}
                    >
                      <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden mb-1.5">
                        {av.thumbnailUrl ? (
                          <img src={av.thumbnailUrl} alt={av.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">👩‍💼</div>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-white truncate">{av.name}</p>
                      <p className="text-[10px] text-slate-400">{av.category}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Voice Picker (Strict Gender-Locked to Selected Avatar) */}
          {activeTab === "voice" && (
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Select Voice</h4>
                  <p className="text-[11px] text-cyan-400 mt-0.5">
                    Showing {(activeAvatar?.gender || "Female")} voices for {activeAvatar?.name || "Avatar"}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  {activeAvatar?.gender || "Female"} Only
                </span>
              </div>

              <div className="space-y-2">
                {voicesList
                  .filter((v) => (v.gender || "").toLowerCase() === (activeAvatar?.gender || "Female").toLowerCase())
                  .map((v) => {
                    const isSelected = currentScene?.voiceId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleVoiceSelect(v.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#18233a] border-cyan-500 text-white font-semibold shadow-md shadow-cyan-500/15"
                            : "bg-[#0f1526] border-[#1c2740] text-slate-300 hover:border-[#2b3c63]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold">{v.name}</h5>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              {v.gender}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{v.languageDefault} • Neural HD</p>
                        </div>
                        {isSelected && <Check size={16} className="text-cyan-400" />}
                      </div>
                    );
                  })}
              </div>

              {/* Informative notice about gender auto-locking */}
              <div className="p-2.5 rounded-xl bg-[#111726] border border-[#1d273f] text-[10px] text-slate-400 flex items-center gap-2">
                <span className="text-cyan-400 font-bold">🔒 Gender-Locked:</span>
                <span>Opposite-gender voices are filtered out to ensure realistic avatar speech.</span>
              </div>
            </div>
          )}

          {/* Tab 4: Layer Inspector */}
          {activeTab === "layer" && (
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {selectedOverlay ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Text Layer</span>
                    <button
                      onClick={() => handleDeleteTextOverlay(selectedOverlay.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                    >
                      Delete Layer
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Text Content</label>
                    <input
                      type="text"
                      value={selectedOverlay.text}
                      onChange={(e) => handleUpdateTextOverlay(selectedOverlay.id, { text: e.target.value })}
                      className="w-full bg-[#121828] border border-[#202c46] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Font Size ({selectedOverlay.size}px)</label>
                    <input
                      type="range"
                      min="14"
                      max="72"
                      value={selectedOverlay.size}
                      onChange={(e) => handleUpdateTextOverlay(selectedOverlay.id, { size: parseInt(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Text Color</label>
                    <div className="grid grid-cols-5 gap-2">
                      {["#ffffff", "#00c4ff", "#38bdf8", "#facc15", "#f43f5e", "#10b981", "#a855f7"].map((col) => (
                        <button
                          key={col}
                          onClick={() => handleUpdateTextOverlay(selectedOverlay.id, { color: col })}
                          className={`w-7 h-7 rounded-full border ${
                            selectedOverlay.color === col ? "border-cyan-400 ring-2 ring-cyan-400/40" : "border-white/10"
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <Layers size={32} className="mx-auto mb-2 text-slate-600" />
                  <p>Click on any text layer on the canvas to inspect and customize it.</p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* 3. AI SCRIPT ASSISTANT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0e1322] border border-[#22304f] rounded-3xl p-6 shadow-2xl text-slate-200 relative">
            <div className="flex items-center justify-between mb-4 border-b border-[#1c2742] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">AI Script Assistant</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#18233a] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Action Tabs */}
            <div className="flex gap-2 p-1 bg-[#141b2c] rounded-xl mb-4">
              {[
                { id: "generate", label: "Topic to Script" },
                { id: "rewrite", label: "Tone Rewriter" },
                { id: "generate_scenes", label: "Multi-Scene Storyboard" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setAiAction(t.id as any);
                    setAiGeneratedScript("");
                    setAiGeneratedScenes([]);
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    aiAction === t.id ? "bg-cyan-500 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Inputs based on action */}
            {aiAction === "generate" && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">What is your video about?</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. AI-powered real estate video tours for brokers"
                    className="w-full bg-[#121828] border border-[#22304f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={aiAudience}
                    onChange={(e) => setAiAudience(e.target.value)}
                    placeholder="e.g. Real estate agents, founders, creators"
                    className="w-full bg-[#121828] border border-[#22304f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {aiAction === "rewrite" && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Current Script Text</label>
                  <p className="p-2.5 bg-[#121828] rounded-xl text-xs text-slate-300 max-h-24 overflow-y-auto italic">
                    "{currentScene?.scriptText || "No script text written yet."}"
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Select Rewriting Tone</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["professional", "casual", "enthusiastic", "concise", "urgent"] as const).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setAiTone(tone)}
                        className={`py-1.5 text-xs capitalize rounded-xl border transition-all cursor-pointer ${
                          aiTone === tone
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold"
                            : "bg-[#121828] border-[#22304f] text-slate-400 hover:text-white"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {aiAction === "generate_scenes" && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Video Storyboard Prompt</label>
                  <textarea
                    rows={2}
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. 3-step product launch announcement explaining problems, solution, and CTA"
                    className="w-full bg-[#121828] border border-[#22304f] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Generated Results Area */}
            {aiGeneratedScript && (
              <div className="p-3 bg-[#111728] border border-cyan-500/30 rounded-2xl mb-4 max-h-36 overflow-y-auto">
                <span className="text-[10px] text-cyan-400 font-bold block mb-1">Generated Voiceover Script:</span>
                <p className="text-xs text-white leading-relaxed">{aiGeneratedScript}</p>
              </div>
            )}

            {aiGeneratedScenes.length > 0 && (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                <span className="text-[10px] text-cyan-400 font-bold block mb-1">Generated Storyboard Scenes ({aiGeneratedScenes.length}):</span>
                {aiGeneratedScenes.map((sc, idx) => (
                  <div key={idx} className="p-2 bg-[#121828] rounded-xl border border-white/10 text-xs">
                    <span className="font-bold text-cyan-300 block mb-0.5">{sc.title || `Scene 0${idx + 1}`}</span>
                    <p className="text-slate-300 text-[11px]">{sc.scriptText}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1c2742]">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleRunAiScriptAction}
                disabled={aiIsLoading}
                className="px-5 py-2 bg-[#1b2640] hover:bg-[#25355a] text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer"
              >
                {aiIsLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Generate with AI</span>
              </button>

              {aiGeneratedScript && (
                <button
                  onClick={handleApplyAiScript}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Apply to Scene
                </button>
              )}

              {aiGeneratedScenes.length > 0 && (
                <button
                  onClick={handleApplyAiScenes}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Apply Storyboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. RENDER / EXPORT PROGRESS MODAL */}
      {isRenderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1322] border border-[#22304f] rounded-3xl p-6 shadow-2xl text-slate-200 text-center relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-1">
              {renderStatus === "completed"
                ? "Video Export Ready!"
                : renderStatus === "failed"
                ? "Render Failed"
                : "Rendering Your AI Video"}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {renderStatus === "completed"
                ? "Your high-definition MP4 video has been composed with audio and visuals."
                : renderStatus === "failed"
                ? (renderError || "An unexpected error occurred during rendering.")
                : "Our FFmpeg composition pipeline is synthesizing scenes, speech, and motion."}
            </p>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-[#151c2e] rounded-full overflow-hidden mb-3 border border-white/5">
              <div
                className={`h-full transition-all duration-700 ${
                  renderStatus === "failed"
                    ? "bg-rose-500"
                    : renderStatus === "completed"
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                }`}
                style={{ width: `${renderProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-cyan-400 block mb-5">{renderProgress}%</span>

            {/* Video Player Preview when Completed */}
            {renderStatus === "completed" && renderOutputUrl && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-black aspect-video max-w-sm mx-auto">
                <video
                  src={renderOutputUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Output Download or Dismiss */}
            <div className="flex justify-center gap-3">
              {renderStatus === "completed" && renderOutputUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!renderOutputUrl) return;
                    const a = document.createElement("a");
                    a.href = renderOutputUrl;
                    a.download = `vidoai_video_${Date.now()}.mp4`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                >
                  <Download size={15} /> Download MP4 Video
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setIsRenderModalOpen(false)}
                className="px-5 py-2.5 bg-[#172034] hover:bg-[#202d4a] text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {renderStatus === "completed" || renderStatus === "failed" ? "Close" : "Run in Background"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SHARE & COLLABORATE MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c111e] border border-[#1e2a44] rounded-2xl p-6 shadow-2xl text-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Share2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Share Video & Review</h3>
                  <p className="text-[11px] text-slate-400">Collaborate with timestamped scene comments</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShareCopied(false);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#162035]"
              >
                <X size={16} />
              </button>
            </div>

            {shareLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 size={20} className="text-blue-400 animate-spin" />
                <span>Generating secure public preview link...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Public Review Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/share/${projectId}`}
                      className="flex-1 bg-[#101728] border border-[#1b2742] rounded-xl px-3 py-2 text-xs text-slate-200 font-mono select-all focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const url = shareUrl || `${window.location.origin}/share/${projectId}`;
                        navigator.clipboard.writeText(url);
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2500);
                      }}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {shareCopied ? (
                        <>
                          <Check size={14} className="text-emerald-300" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-[#11182a] border border-[#1a253f] rounded-xl text-xs text-slate-400">
                  <span className="font-semibold text-slate-200 block mb-1">Collaborator Capabilities:</span>
                  Anyone with this link can watch the video draft preview and leave timestamped comments directly on each scene.
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (shareUrl) window.open(shareUrl, "_blank");
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Public Player</span>
                    <ArrowLeft size={12} className="rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. AI VIDEO AGENT MODAL */}
      {isVideoAgentOpen && (
        <VideoAgentModal
          isOpen={isVideoAgentOpen}
          avatars={avatarsList}
          onClose={() => setIsVideoAgentOpen(false)}
          onProjectCreated={(newProjId) => {
            setIsVideoAgentOpen(false);
            setProjectId(newProjId);
          }}
        />
      )}
    </div>
  );
}
