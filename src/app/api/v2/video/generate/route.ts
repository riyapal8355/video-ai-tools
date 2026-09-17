import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";
import { processRenderJob } from "@/lib/queue/renderQueue";

export async function POST(request: Request) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json(
        { code: 401, message: "Invalid API Key or unauthorized session" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      video_inputs = [],
      dimension = { width: 1280, height: 720 },
      aspect_ratio = "16:9",
      test = false,
      title = "API Generated Video",
    } = body;

    if (!Array.isArray(video_inputs) || video_inputs.length === 0) {
      return NextResponse.json(
        { code: 400, message: "video_inputs array must contain at least 1 scene" },
        { status: 400 }
      );
    }

    const estimatedCredits = test ? 0 : video_inputs.length * 10;

    // Check credit balance if not a test render
    if (!test) {
      const latestLedger = await prisma.creditLedger.findFirst({
        where: { workspaceId: auth.workspaceId },
        orderBy: { createdAt: "desc" },
      });
      const balance = latestLedger ? latestLedger.balanceAfter : 100;
      if (balance < estimatedCredits) {
        return NextResponse.json(
          {
            code: 402,
            message: "Insufficient credits",
            details: { required: estimatedCredits, available: balance },
          },
          { status: 402 }
        );
      }
    }

    const orientation = aspect_ratio === "9:16" ? "portrait" : "landscape";

    // Create Project and Scenes in DB
    const project = await prisma.project.create({
      data: {
        workspaceId: auth.workspaceId,
        ownerUserId: auth.userId,
        name: title,
        orientation,
        status: "rendering",
        scenes: {
          create: video_inputs.map((input: any, index: number) => {
            const char = input.character || {};
            const voice = input.voice || {};
            const bg = input.background || {};

            return {
              orderIndex: index,
              scriptText: voice.input_text || "Welcome to our AI video generation API.",
              avatarId: char.avatar_id || null,
              voiceId: voice.voice_id || null,
              voiceSpeed: voice.speed || 1.0,
              voicePitch: voice.pitch || 1.0,
              backgroundType: bg.type || "color",
              backgroundValue: bg.value || "#0c111e",
              durationSeconds: Math.max(3, Math.round((voice.input_text?.split(" ")?.length || 5) / 2.5)),
            };
          }),
        },
      },
    });

    // Create Render record
    const render = await prisma.render.create({
      data: {
        projectId: project.id,
        requestedByUserId: auth.userId,
        status: "queued",
        progressPercentage: 0,
        estimatedCredits,
      },
    });

    // Trigger async video render job
    processRenderJob(render.id).catch((err) =>
      console.error("Async render error for API video:", err)
    );

    return NextResponse.json(
      {
        code: 100,
        data: {
          video_id: render.id,
          project_id: project.id,
          status: "queued",
        },
        message: "Video generation successfully accepted and queued",
      },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
