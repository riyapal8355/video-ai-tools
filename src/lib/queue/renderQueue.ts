import { prisma } from "../db";
import { composeVideo } from "../render/videoCompositor";
import { generateSpeech } from "../generation/ttsProvider";

// In-process async render worker
export async function processRenderJob(renderId: string) {
  try {
    const render = await prisma.render.findUnique({
      where: { id: renderId },
      include: {
        project: {
          include: {
            scenes: {
              orderBy: { orderIndex: "asc" },
              include: {
                textOverlays: true,
              },
            },
          },
        },
      },
    }) as any;

    if (!render) return;

    // 1. Set to processing
    await prisma.render.update({
      where: { id: renderId },
      data: {
        status: "processing",
        startedAt: new Date(),
        progressPercentage: 10,
      },
    });

    // 2. Fetch avatar & voice metadata for scenes
    const sceneDataList = [];
    for (let i = 0; i < render.project.scenes.length; i++) {
      const sc: any = render.project.scenes[i];
      let avatarPreviewUrl = "";
      let avatarThumbnailUrl = "";
      let avatarGender = "female";

      if (sc.avatar) {
        avatarPreviewUrl = sc.avatar.previewVideoUrl || "";
        avatarThumbnailUrl = sc.avatar.thumbnailUrl || "";
        avatarGender = (sc.avatar.gender || "Female").toLowerCase();
      } else if (sc.avatarId) {
        const avatar = await prisma.avatar.findUnique({
          where: { id: sc.avatarId },
        });
        if (avatar) {
          avatarPreviewUrl = avatar.previewVideoUrl || "";
          avatarThumbnailUrl = avatar.thumbnailUrl || "";
          avatarGender = (avatar.gender || "Female").toLowerCase();
        }
      }

      // Enforce strict voice matching with avatar gender
      let effectiveVoiceId = sc.voiceId || (avatarGender === "male" ? "voice_ben" : "voice_annie");
      if (sc.voiceId) {
        const voiceRecord = await prisma.voice.findUnique({ where: { id: sc.voiceId } });
        if (voiceRecord && (voiceRecord.gender || "").toLowerCase() !== avatarGender) {
          // Mismatch detected: correct to matching gender voice
          effectiveVoiceId = avatarGender === "male" ? "voice_ben" : "voice_annie";
        }
      }

      // Generate or retrieve scene TTS audio using free Neural TTS
      const tts = await generateSpeech(sc.scriptText, effectiveVoiceId, {
        speed: sc.voiceSpeed,
        pitch: sc.voicePitch,
      });

      sceneDataList.push({
        orderIndex: sc.orderIndex,
        scriptText: sc.scriptText,
        avatarThumbnailUrl: avatarThumbnailUrl || undefined,
        avatarPreviewVideoUrl: avatarPreviewUrl || undefined,
        avatarPose: sc.avatarPose ? (typeof sc.avatarPose === "string" ? JSON.parse(sc.avatarPose) : sc.avatarPose) : undefined,
        audioUrl: tts.audioUrl,
        durationSeconds: sc.durationSeconds || tts.audioDurationSeconds || 5.0,
        backgroundValue: sc.backgroundValue || "#0b101c",
        captionsEnabled: sc.captionsEnabled ?? true,
        textOverlays: sc.textOverlays || [],
        wordTimestamps: tts.wordTimestamps,
      });
    }

    // 3. Update progress to 40%
    await prisma.render.update({
      where: { id: renderId },
      data: { progressPercentage: 40 },
    });

    // 4. Compose video
    const videoUrl = await composeVideo(
      {
        projectId: render.projectId,
        projectName: render.project.name,
        orientation: render.project.orientation as "landscape" | "portrait",
        scenes: sceneDataList,
      },
      async (percent) => {
        const scaled = Math.min(95, 40 + Math.round(percent * 0.55));
        await prisma.render.update({
          where: { id: renderId },
          data: { progressPercentage: scaled },
        });
      }
    );

    // 5. Calculate actual credit consumption (e.g., 10 credits per minute, min 10)
    const totalDurationSecs = sceneDataList.reduce((acc, s) => acc + s.durationSeconds, 0);
    const actualCredits = Math.max(10, Math.ceil((totalDurationSecs / 60) * 10));

    // Deduct from CreditLedger
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { workspaceId: render.project.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestLedger?.balanceAfter ?? 1000;
    const newBalance = Math.max(0, currentBalance - actualCredits);

    await prisma.creditLedger.create({
      data: {
        workspaceId: render.project.workspaceId,
        delta: -actualCredits,
        reason: "consume",
        relatedEntityType: "render",
        relatedEntityId: render.id,
        balanceAfter: newBalance,
      },
    });

    // 6. Complete Render
    await prisma.render.update({
      where: { id: renderId },
      data: {
        status: "completed",
        progressPercentage: 100,
        actualCreditsConsumed: actualCredits,
        outputAssetUrl: videoUrl,
        completedAt: new Date(),
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: render.projectId },
      data: { status: "completed" },
    });

    console.log(`Render ${renderId} completed successfully! Output: ${videoUrl}`);

    // Dispatch webhook event
    try {
      const { dispatchWebhookEvent } = await import("../webhooks/dispatcher");
      await dispatchWebhookEvent(render.project.workspaceId, "video.render.completed", {
        render_id: render.id,
        project_id: render.projectId,
        status: "completed",
        video_url: videoUrl,
        credits_consumed: actualCredits,
      });
    } catch (whErr) {
      console.warn("Webhook dispatch error:", whErr);
    }
  } catch (err: any) {
    console.error(`Render ${renderId} failed:`, err);
    await prisma.render.update({
      where: { id: renderId },
      data: {
        status: "failed",
        errorMessage: err?.message || "Render failed during video composition",
      },
    });

    try {
      const render = await prisma.render.findUnique({
        where: { id: renderId },
        include: { project: true },
      });
      if (render) {
        const { dispatchWebhookEvent } = await import("../webhooks/dispatcher");
        await dispatchWebhookEvent(render.project.workspaceId, "video.render.failed", {
          render_id: render.id,
          project_id: render.projectId,
          status: "failed",
          error: err?.message,
        });
      }
    } catch {}
  }
}
