"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  Edit2,
  Copy,
  PlusSquare,
  Users,
  FolderInput,
  CheckSquare,
  Square,
  X,
  Sparkles,
  Gem,
} from "lucide-react";
import AskRhysWidget from "../dashboard/AskRhysWidget";

interface ProjectItem {
  id: string;
  title: string;
  type: "avatar_video" | "agent" | "translations" | "apps" | "assets";
  badgeLabel: string;
  status: "Draft" | "Rendered" | "Processing";
  createdAt: string;
  source: string;
  creator: string;
}

interface ProjectsManagerProps {
  activeSection?: "my_projects" | "trash";
  onOpenStudio?: (projectId?: string) => void;
}

export default function ProjectsManager({
  activeSection = "my_projects",
  onOpenStudio,
}: ProjectsManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "my_projects" | "avatar_video" | "agent" | "translations" | "apps" | "assets"
  >("my_projects");

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Open menu id
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  // Inline rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [trashProjects, setTrashProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/v2/projects");
        if (res.ok) {
          const data = await res.json();
          if (data.projects && data.projects.length > 0) {
            setProjects(data.projects);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    loadProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesTab =
      activeTab === "my_projects" ||
      (activeTab === "avatar_video" && p.type === "avatar_video") ||
      (activeTab === "agent" && p.type === "agent") ||
      (activeTab === "translations" && p.type === "translations") ||
      (activeTab === "apps" && p.type === "apps") ||
      (activeTab === "assets" && p.type === "assets");

    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    alert(`Project ID "${id}" copied to clipboard!`);
    setOpenMenuId(null);
  };

  const handleEditAsNew = async (p: ProjectItem) => {
    try {
      const res = await fetch("/api/v2/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${p.title} (Copy)` }),
      });
      if (res.ok) {
        const data = await res.json();
        setOpenMenuId(null);
        if (onOpenStudio) onOpenStudio(data.project.id);
        return;
      }
    } catch {
      // fallback
    }
    const duplicated: ProjectItem = {
      ...p,
      id: `proj_${Date.now()}`,
      title: `${p.title} (Copy)`,
      createdAt: "just now",
    };
    setProjects([duplicated, ...projects]);
    setOpenMenuId(null);
    if (onOpenStudio) onOpenStudio(duplicated.id);
  };

  const handleStartRename = (p: ProjectItem) => {
    setRenamingId(p.id);
    setNewTitle(p.title);
    setOpenMenuId(null);
  };

  const handleSaveRename = async (id: string) => {
    if (newTitle.trim()) {
      setProjects(
        projects.map((p) => (p.id === id ? { ...p, title: newTitle.trim() } : p))
      );
      try {
        await fetch(`/api/v2/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newTitle.trim() }),
        });
      } catch (err) {
        console.error("Rename project error:", err);
      }
    }
    setRenamingId(null);
  };

  const handleDeleteProject = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const item = projects.find((p) => p.id === id);
    if (item) {
      setProjects(projects.filter((p) => p.id !== id));
      setTrashProjects([...trashProjects, item]);
      try {
        await fetch(`/api/v2/projects/${id}`, { method: "DELETE" });
      } catch (err) {
        console.error("Delete project error:", err);
      }
    }
    setOpenMenuId(null);
  };

  const handleRestoreProject = (id: string) => {
    const item = trashProjects.find((p) => p.id === id);
    if (item) {
      setTrashProjects(trashProjects.filter((p) => p.id !== id));
      setProjects([...projects, item]);
    }
  };

  return (
    <div
      onClick={() => setOpenMenuId(null)}
      className="flex-1 h-screen overflow-y-auto bg-[#07090e] text-slate-100 flex flex-col font-sans select-none relative"
    >
      {/* 1. TOP HEADER & TABS BAR (Exact Screenshot Match) */}
      <div className="w-full px-10 pt-7 pb-3 border-b border-[#141b2c] z-20">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {activeSection === "trash" ? "Trash" : "Projects"}
          </h1>

          {/* Right Action Icons (Search, Filter, Date, Sort + Ask Rhys) */}
          <div className="flex items-center gap-2.5">
            {isSearchOpen ? (
              <div className="relative w-48 animate-in fade-in">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  autoFocus
                  className="w-full bg-[#111728] border border-[#1e2a44] rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
                <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="w-9 h-9 rounded-full bg-[#0c111e] hover:bg-[#151f36] border border-[#1c2740] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Search"
              >
                <Search size={15} />
              </button>
            )}

            <button
              onClick={() => alert("Filter projects by status or date")}
              className="w-9 h-9 rounded-full bg-[#0c111e] hover:bg-[#151f36] border border-[#1c2740] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Filter"
            >
              <Filter size={15} />
            </button>

            <button
              onClick={() => alert("Sort by date range")}
              className="w-9 h-9 rounded-full bg-[#0c111e] hover:bg-[#151f36] border border-[#1c2740] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Calendar Filter"
            >
              <Calendar size={15} />
            </button>

            <button
              onClick={() => alert("Sort: Newest first")}
              className="w-9 h-9 rounded-full bg-[#0c111e] hover:bg-[#151f36] border border-[#1c2740] flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Sort Ordering"
            >
              <ArrowUpDown size={15} />
            </button>

            <div className="ml-2">
              <AskRhysWidget />
            </div>
          </div>
        </div>

        {/* Sub-Tabs Row (Exact Screenshot Match: My Projects, Avatar Video, Agent, Translations, Apps, Assets) */}
        {activeSection === "my_projects" && (
          <div className="flex items-center gap-7 text-xs font-bold pt-1">
            {[
              { id: "my_projects", label: "My Projects" },
              { id: "avatar_video", label: "Avatar Video" },
              { id: "agent", label: "Agent" },
              { id: "translations", label: "Translations" },
              { id: "apps", label: "Apps" },
              { id: "assets", label: "Assets" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 transition-colors cursor-pointer relative ${
                  activeTab === tab.id
                    ? "text-white font-extrabold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400"></span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. MAIN WORKSPACE */}
      <div className="max-w-7xl w-full mx-auto px-10 py-6 flex-1 flex flex-col justify-between pb-16">
        {activeSection === "trash" ? (
          /* TRASH VIEW */
          <div>
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Deleted Items ({trashProjects.length})
            </h2>

            {trashProjects.length === 0 ? (
              <div className="text-center py-24 text-slate-500 text-xs font-semibold">
                Trash is empty
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trashProjects.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0c111e] border border-[#1c2740] rounded-3xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{p.title}</h4>
                      <p className="text-[10px] text-slate-400">{p.source}</p>
                    </div>
                    <button
                      onClick={() => handleRestoreProject(p.id)}
                      className="px-3 py-1 bg-[#151f36] hover:bg-[#1d2b4a] border border-[#243354] rounded-xl text-xs font-semibold text-cyan-400 cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* MY PROJECTS VIEW */
          <div>
            {/* Group Label: TODAY */}
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              TODAY
            </h2>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => {
                const isSelected = selectedIds.includes(project.id);
                const isMenuOpen = openMenuId === project.id;

                return (
                  <div key={project.id} className="flex flex-col relative group">
                    {/* Aspect 16:10 Thumbnail Card Frame (Exact Screenshot Match) */}
                    <div
                      onClick={() => {
                        if (onOpenStudio) onOpenStudio(project.id);
                      }}
                      className="aspect-[16/10] bg-[#1a2130] hover:bg-[#20293d] border border-[#222d42] hover:border-cyan-500/60 rounded-3xl overflow-hidden relative shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer flex items-center justify-center p-4"
                    >
                      {/* Top-Left: Rounded Checkbox Icon (Matches Screenshot) */}
                      <button
                        onClick={(e) => toggleSelect(project.id, e)}
                        className={`absolute top-3 left-3 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer z-10 ${
                          isSelected
                            ? "bg-cyan-500 border-cyan-500 text-slate-950"
                            : "bg-white/90 hover:bg-white border-white/60 text-slate-900 shadow-sm"
                        }`}
                        title="Select project"
                      >
                        {isSelected && <CheckSquare size={14} className="fill-slate-950 text-cyan-500" />}
                      </button>

                      {/* Top-Right: Three Dots Menu Button (Matches Screenshot: white circle with dark dots) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(isMenuOpen ? null : project.id);
                        }}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-800 shadow-md transition-colors cursor-pointer z-20"
                        title="More options"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Center: Circular Edit Button with Pencil (Exact Screenshot Match) */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenStudio) onOpenStudio(project.id);
                        }}
                        className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer"
                        title="Edit project in Studio"
                      >
                        <Edit2 size={18} />
                      </div>

                      {/* Bottom-Left Badge: Avatar Video (Exact Screenshot Match) */}
                      <span className="absolute bottom-3 left-3 bg-black/80 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                        {project.badgeLabel}
                      </span>
                    </div>

                    {/* Title & Subtitle Below Card (Exact Match) */}
                    <div className="mt-2.5 px-1">
                      {renamingId === project.id ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSaveRename(project.id)}
                            autoFocus
                            className="bg-[#121828] border border-cyan-500 rounded px-2 py-0.5 text-xs text-white outline-none w-full"
                          />
                          <button
                            onClick={() => handleSaveRename(project.id)}
                            className="text-cyan-400 text-xs font-bold hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {project.title}
                        </h3>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {project.createdAt} • {project.source}
                      </p>
                    </div>

                    {/* CONTEXT MENU DROPDOWN (Exact Screenshot Match) */}
                    {isMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-12 right-0 w-48 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-100 p-2 z-40 animate-in fade-in zoom-in-95 duration-150 font-sans"
                      >
                        {/* Header: Created by Riya (Matches Screenshot) */}
                        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                          Created by {project.creator}
                        </div>

                        {/* Menu Item 1: Copy ID */}
                        <button
                          onClick={() => handleCopyId(project.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <Copy size={14} className="text-slate-600" />
                          <span>Copy ID</span>
                        </button>

                        {/* Menu Item 2: Edit as New */}
                        <button
                          onClick={() => handleEditAsNew(project)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <PlusSquare size={14} className="text-slate-600" />
                          <span>Edit as New</span>
                        </button>

                        {/* Menu Item 3: Collaborate with Diamond */}
                        <button
                          onClick={() => {
                            alert("Collaborate: Invite team members to edit this project.");
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Users size={14} className="text-slate-600" />
                            <span>Collaborate</span>
                          </div>
                          <Gem size={13} className="text-amber-500 fill-amber-500" />
                        </button>

                        {/* Menu Item 4: Rename */}
                        <button
                          onClick={() => handleStartRename(project)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} className="text-slate-600" />
                          <span>Rename</span>
                        </button>

                        {/* Menu Item 5: Move */}
                        <button
                          onClick={() => {
                            alert("Move project to another folder");
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-100 text-slate-800 text-left transition-colors cursor-pointer"
                        >
                          <FolderInput size={14} className="text-slate-600" />
                          <span>Move</span>
                        </button>

                        {/* Divider */}
                        <div className="h-[1px] bg-slate-100 my-1"></div>

                        {/* Menu Item 6: Trash */}
                        <button
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-rose-50 text-rose-600 text-left transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} className="text-rose-600" />
                          <span>Trash</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Center Text: "You've reached the end" (Exact Screenshot Match) */}
        <div className="pt-16 pb-4 text-center">
          <p className="text-xs font-medium text-slate-500">
            You've reached the end
          </p>
        </div>
      </div>
    </div>
  );
}
