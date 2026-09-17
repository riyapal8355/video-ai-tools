import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  try {
    let session = await getCurrentSession();
    let workspaceId = session?.workspaceId;

    if (!workspaceId) {
      const defaultWs = await prisma.workspace.findFirst();
      workspaceId = defaultWs?.id;
    }

    if (!workspaceId) {
      return NextResponse.json({ projects: [] });
    }

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        scenes: {
          orderBy: { orderIndex: "asc" },
        },
        ownerUser: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = projects.map((p) => {
      const totalDurationSecs = p.scenes.reduce((acc, s) => acc + (s.durationSeconds || 5.0), 0);
      const minutes = Math.floor(totalDurationSecs / 60);
      const seconds = Math.floor(totalDurationSecs % 60);
      const durationFormatted = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

      return {
        id: p.id,
        title: p.name,
        type: "avatar_video",
        badgeLabel: p.status === "completed" ? "Rendered Video" : "Avatar Video",
        status: p.status === "completed" ? "Rendered" : p.status === "rendering" ? "Processing" : "Draft",
        createdAt: "Today",
        source: "AI Studio",
        creator: p.ownerUser?.fullName || "Riya",
        duration: durationFormatted,
        scenesCount: p.scenes.length,
        orientation: p.orientation,
        updatedAt: p.updatedAt,
      };
    });

    return NextResponse.json({ projects: formatted });
  } catch (err: any) {
    console.error("List projects error:", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    const body = await req.json().catch(() => ({}));

    let workspaceId = session?.workspaceId;
    let userId = session?.userId;

    if (!workspaceId || !userId) {
      const user = await prisma.user.findFirst();
      const ws = await prisma.workspace.findFirst();
      userId = user?.id || "";
      workspaceId = ws?.id || "";
    }

    const project = await prisma.project.create({
      data: {
        name: body.name || "Untitled Video",
        workspaceId,
        ownerUserId: userId,
        orientation: body.orientation || "landscape",
        scenes: {
          create: [
            {
              orderIndex: 0,
              scriptText: body.initialScript || "Welcome to my video! Write your script here.",
              avatarId: "avatar_emma",
              voiceId: "voice_annie",
              durationSeconds: 8.0,
              backgroundType: "color",
              backgroundValue: "#0b101c",
              captionsEnabled: true,
            },
          ],
        },
      },
      include: {
        scenes: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    console.error("Create project error:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
