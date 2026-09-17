import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";
import { generateAgentVideoPlan, createProjectFromAgentPlan } from "@/lib/ai/videoAgent";
import { processRenderJob } from "@/lib/queue/renderQueue";

export async function POST(request: Request) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      prompt,
      durationSeconds = 30,
      aspectRatio = "16:9",
      preferredAvatarId,
      preferredVoiceId,
      autoRender = false,
    } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A prompt describing the video is required" },
        { status: 400 }
      );
    }

    // Generate intelligent multi-scene plan
    const plan = await generateAgentVideoPlan(
      {
        prompt,
        durationSeconds,
        aspectRatio,
        preferredAvatarId,
        preferredVoiceId,
      },
      auth.workspaceId
    );

    // Create Project and Scenes in DB
    const project = await createProjectFromAgentPlan(
      auth.workspaceId,
      auth.userId,
      plan
    );

    let renderId: string | null = null;
    if (autoRender) {
      // Check credit balance before triggering auto-render
      const latest = await prisma.creditLedger.findFirst({
        where: { workspaceId: auth.workspaceId },
        orderBy: { createdAt: "desc" },
      });
      const balance = latest ? latest.balanceAfter : 100;
      if (balance >= plan.estimatedCredits) {
        const render = await prisma.render.create({
          data: {
            projectId: project.id,
            requestedByUserId: auth.userId,
            status: "queued",
            estimatedCredits: plan.estimatedCredits,
          },
        });
        renderId = render.id;
        processRenderJob(render.id).catch((err) =>
          console.error("Auto-render error for Video Agent project:", err)
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        project_id: project.id,
        project_name: project.name,
        plan,
        render_id: renderId,
        message: "Video Agent successfully generated multi-scene project",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
