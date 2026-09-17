"use client";

import React, { useState } from "react";
import LeftRailNav from "@/components/dashboard/LeftRailNav";
import CreateSidebar from "@/components/dashboard/CreateSidebar";
import ManageAvatarsSidebar from "@/components/dashboard/ManageAvatarsSidebar";
import BrandSidebar from "@/components/dashboard/BrandSidebar";
import AppsSidebar from "@/components/dashboard/AppsSidebar";
import ProjectsSidebar from "@/components/dashboard/ProjectsSidebar";
import TemplatesSidebar from "@/components/dashboard/TemplatesSidebar";
import AskRhysWidget from "@/components/dashboard/AskRhysWidget";
import OnboardingSteps from "@/components/dashboard/OnboardingSteps";
import VideoPrompts from "@/components/dashboard/VideoPrompts";
import VoicesLibrary from "@/components/voices/VoicesLibrary";
import AvatarsManager from "@/components/avatars/AvatarsManager";
import DesignLookStudio from "@/components/avatars/DesignLookStudio";
import BrandSystems from "@/components/brand/BrandSystems";
import AppLibrary from "@/components/apps/AppLibrary";
import IntegrationsLibrary from "@/components/apps/IntegrationsLibrary";
import AllAppOutputs from "@/components/apps/AllAppOutputs";
import ProjectsManager from "@/components/projects/ProjectsManager";
import TemplatesLibrary from "@/components/templates/TemplatesLibrary";
import VidoAIStudio from "@/components/studio/VidoAIStudio";
import DeveloperPortal from "@/components/developer/DeveloperPortal";
import AuthPage from "@/components/auth/AuthPage";
import VideoAgentModal from "@/components/studio/VideoAgentModal";
import { useAuth } from "@/context/AuthContext";
import { Video } from "lucide-react";

function DashboardContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<
    "dashboard" | "avatars" | "design_look" | "voices" | "brand" | "apps" | "projects" | "templates" | "studio" | "developer"
  >("projects"); // starts on Projects matching screenshot
  const [activeRailTab, setActiveRailTab] = useState("projects");
  const [activeSidebarSection, setActiveSidebarSection] = useState("home");
  const [activeAvatarSection, setActiveAvatarSection] = useState<"avatars" | "design_look" | "voices">("avatars");
  const [activeBrandSection, setActiveBrandSection] = useState<"brand_systems" | "brand_glossary">("brand_systems");
  const [activeAppsSection, setActiveAppsSection] = useState<"home" | "integrations" | "outputs">("home");
  const [activeProjectsSection, setActiveProjectsSection] = useState<"my_projects" | "trash">("my_projects");
  const [activeTemplateCategory, setActiveTemplateCategory] = useState("all");
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>(undefined);
  const [isVideoAgentOpen, setIsVideoAgentOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#07090e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  const handleRailSelect = (tabId: string) => {
    setActiveRailTab(tabId);
    if (tabId === "avatar") {
      setCurrentView("avatars");
      setActiveAvatarSection("avatars");
    } else if (tabId === "brand") {
      setCurrentView("brand");
      setActiveBrandSection("brand_systems");
    } else if (tabId === "tools") {
      setCurrentView("apps");
      setActiveAppsSection("home");
    } else if (tabId === "projects") {
      setCurrentView("projects");
      setActiveProjectsSection("my_projects");
    } else if (tabId === "templates") {
      setCurrentView("templates");
      setActiveTemplateCategory("all");
    } else if (tabId === "home") {
      setCurrentView("dashboard");
      setActiveSidebarSection("home");
    } else if (tabId === "developer") {
      setCurrentView("developer");
    }
  };

  const handleAvatarSidebarSelect = (section: "avatars" | "design_look" | "voices") => {
    setActiveAvatarSection(section);
    if (section === "avatars") {
      setCurrentView("avatars");
    } else if (section === "voices") {
      setCurrentView("voices");
    } else if (section === "design_look") {
      setCurrentView("design_look");
    }
  };

  const handleOpenStudio = (projectId?: string) => {
    if (projectId) setActiveProjectId(projectId);
    setCurrentView("studio");
  };

  const handleSidebarSelect = (section: string) => {
    setActiveSidebarSection(section);
    if (section === "video_agent") {
      setIsVideoAgentOpen(true);
    } else if (section === "scene_by_scene" || section === "single_scene") {
      setCurrentView("studio");
    } else {
      setCurrentView("dashboard");
    }
  };

  if (currentView === "studio") {
    return (
      <VidoAIStudio
        onBackToDashboard={() => setCurrentView("dashboard")}
        projectId={activeProjectId}
      />
    );
  }

  const isAvatarContext =
    currentView === "avatars" || currentView === "design_look" || currentView === "voices";

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex overflow-hidden font-sans">
      {/* 1. Left Slim Icon Navigation Rail */}
      <LeftRailNav
        activeTab={activeRailTab}
        onSelectTab={handleRailSelect}
        onLogoClick={() => {
          setActiveRailTab("home");
          setCurrentView("dashboard");
        }}
      />

      {/* 2. Secondary Sidebar - Context Aware */}
      {currentView === "developer" ? null : isAvatarContext ? (
        <ManageAvatarsSidebar
          activeSection={activeAvatarSection}
          onSelectSection={handleAvatarSidebarSelect}
        />
      ) : currentView === "brand" ? (
        <BrandSidebar
          activeSection={activeBrandSection}
          onSelectSection={(sec) => setActiveBrandSection(sec)}
        />
      ) : currentView === "apps" ? (
        <AppsSidebar
          activeSection={activeAppsSection}
          onSelectSection={(sec) => setActiveAppsSection(sec)}
          onSeeAllOutputs={() => setActiveAppsSection("outputs")}
        />
      ) : currentView === "projects" ? (
        <ProjectsSidebar
          activeSection={activeProjectsSection}
          onSelectSection={(sec) => setActiveProjectsSection(sec)}
        />
      ) : currentView === "templates" ? (
        <TemplatesSidebar
          activeCategory={activeTemplateCategory}
          onSelectCategory={(cat) => setActiveTemplateCategory(cat)}
        />
      ) : (
        <CreateSidebar
          activeSection={activeSidebarSection}
          onSelectSection={handleSidebarSelect}
        />
      )}

      {/* 3. Main Workspace Area */}
      {currentView === "developer" ? (
        <DeveloperPortal />
      ) : currentView === "avatars" ? (
        <AvatarsManager onOpenStudio={handleOpenStudio} />
      ) : currentView === "design_look" ? (
        <DesignLookStudio onOpenStudio={handleOpenStudio} />
      ) : currentView === "voices" ? (
        <VoicesLibrary />
      ) : currentView === "brand" ? (
        <BrandSystems
          activeSubSection={activeBrandSection}
          onOpenStudio={handleOpenStudio}
        />
      ) : currentView === "apps" ? (
        activeAppsSection === "outputs" ? (
          <AllAppOutputs
            onBack={() => setActiveAppsSection("home")}
            onOpenStudio={handleOpenStudio}
          />
        ) : activeAppsSection === "integrations" ? (
          <IntegrationsLibrary onOpenStudio={handleOpenStudio} />
        ) : (
          <AppLibrary onOpenStudio={handleOpenStudio} />
        )
      ) : currentView === "projects" ? (
        <ProjectsManager
          activeSection={activeProjectsSection}
          onOpenStudio={handleOpenStudio}
        />
      ) : currentView === "templates" ? (
        <TemplatesLibrary
          activeCategory={activeTemplateCategory}
          onOpenStudio={handleOpenStudio}
        />
      ) : (
        <div className="flex-1 h-screen overflow-y-auto bg-[#07090e] flex flex-col">
          {/* Top Header with Studio Switcher & Ask Rhys */}
          <header className="w-full px-8 py-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOpenStudio()}
                className="bg-[#121828] hover:bg-[#1a233a] border border-[#222f4d] hover:border-[#384c7a] px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-400 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Video size={14} /> Open VidoAI Studio Editor
              </button>
            </div>

            <div className="flex items-center gap-3">
              <AskRhysWidget />
            </div>
          </header>

          {/* Hero & Content Container */}
          <div className="max-w-6xl w-full mx-auto px-8 pb-12">
            {/* Welcome Greeting Header (Dynamic) */}
            <div className="text-center mt-2 mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="text-white">Welcome, </span>
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  {user.name}
                </span>
              </h1>
            </div>

            {/* Account Setup 4-Step Cards */}
            <div className="mb-6">
              <OnboardingSteps />
            </div>

            {/* Video Prompts 2x2 Rich Templates Grid */}
            <div>
              <VideoPrompts onSelectPrompt={() => handleOpenStudio()} />
            </div>
          </div>
        </div>
      )}

      {/* AI Video Agent Modal */}
      {isVideoAgentOpen && (
        <VideoAgentModal
          isOpen={isVideoAgentOpen}
          onClose={() => setIsVideoAgentOpen(false)}
          onProjectCreated={(newProjId) => {
            setIsVideoAgentOpen(false);
            handleOpenStudio(newProjId);
          }}
        />
      )}
    </main>
  );
}

export default function Home() {
  return <DashboardContent />;
}
