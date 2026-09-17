import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { code: 401, message: "Invalid API Key or unauthorized session" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const render = await prisma.render.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!render || render.project.workspaceId !== auth.workspaceId) {
      return NextResponse.json(
        { code: 404, message: "Video render not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: 100,
      data: {
        id: render.id,
        project_id: render.projectId,
        status: render.status, // 'queued' | 'processing' | 'completed' | 'failed'
        progress: render.progressPercentage,
        video_url: render.outputAssetUrl,
        error: render.errorMessage,
        created_at: render.queuedAt,
        completed_at: render.completedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
