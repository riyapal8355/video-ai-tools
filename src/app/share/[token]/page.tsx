import React from "react";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Play, Sparkles, MessageSquare, Clock, Film } from "lucide-react";
import SharePageClient from "./SharePageClient";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  const project = await prisma.project.findUnique({
    where: { shareToken: token },
    include: {
      ownerUser: { select: { fullName: true, email: true } },
      scenes: {
        orderBy: { orderIndex: "asc" },
        include: { textOverlays: true },
      },
      renders: {
        where: { status: "completed" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
      comments: {
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const latestVideoUrl = project.renders[0]?.outputAssetUrl || null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Brand Bar */}
      <header className="w-full px-8 py-4 border-b border-[#141b2c] flex items-center justify-between bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
            <Film size={16} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-black text-white tracking-wider uppercase">
              VidoAI Shared Preview
            </span>
            <h1 className="text-sm font-bold text-slate-300">{project.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Created by <span className="text-cyan-400 font-semibold">{project.ownerUser?.fullName || "Creator"}</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <SharePageClient
        projectId={project.id}
        projectName={project.name}
        videoUrl={latestVideoUrl}
        scenes={project.scenes}
        initialComments={project.comments}
      />
    </div>
  );
}
