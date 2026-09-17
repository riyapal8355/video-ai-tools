import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id: projectId } = params;
    const body = await req.json().catch(() => ({}));

    // Find highest orderIndex
    const lastScene = await prisma.scene.findFirst({
      where: { projectId },
      orderBy: { orderIndex: "desc" },
    });

    const newIndex = (lastScene?.orderIndex ?? -1) + 1;

    const scene = await prisma.scene.create({
      data: {
        projectId,
        orderIndex: newIndex,
        scriptText: body.scriptText || "New Scene script...",
        avatarId: body.avatarId || lastScene?.avatarId || "avatar_emma",
        avatarPose:
          body.avatarPose && body.avatarPose !== "null"
            ? typeof body.avatarPose === "string"
              ? body.avatarPose
              : JSON.stringify(body.avatarPose)
            : JSON.stringify({ x: 50, y: 50, scale: 1.0 }),
        voiceId: body.voiceId || lastScene?.voiceId || "voice_annie",
        durationSeconds: body.durationSeconds || 8.0,
        backgroundValue: body.backgroundValue || "#0b101c",
        captionsEnabled: body.captionsEnabled !== undefined ? body.captionsEnabled : true,
      },
      include: {
        textOverlays: true,
      },
    });

    return NextResponse.json({ scene }, { status: 201 });
  } catch (err: any) {
    console.error("Add scene error:", err);
    return NextResponse.json({ error: "Failed to add scene" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { sceneId, ...updates } = body;

    if (!sceneId) {
      return NextResponse.json({ error: "sceneId is required" }, { status: 400 });
    }

    if (Array.isArray(updates.textOverlays)) {
      await prisma.textOverlay.deleteMany({ where: { sceneId } });
      if (updates.textOverlays.length > 0) {
        await prisma.textOverlay.createMany({
          data: updates.textOverlays.map((to: any) => ({
            sceneId,
            text: to.text || "",
            font: to.font || "Inter",
            size: to.size || 32,
            color: to.color || "#ffffff",
            positionX: to.positionX ?? 50.0,
            positionY: to.positionY ?? 50.0,
            animation: to.animation || "fade",
          })),
        });
      }
    }

    const updated = await prisma.scene.update({
      where: { id: sceneId },
      data: {
        scriptText: updates.scriptText !== undefined ? updates.scriptText : undefined,
        avatarId: updates.avatarId !== undefined ? updates.avatarId : undefined,
        avatarPose:
          updates.avatarPose !== undefined
            ? updates.avatarPose && updates.avatarPose !== "null"
              ? typeof updates.avatarPose === "string"
                ? updates.avatarPose
                : JSON.stringify(updates.avatarPose)
              : JSON.stringify({ x: 50, y: 50, scale: 1.0 })
            : undefined,
        voiceId: updates.voiceId !== undefined ? updates.voiceId : undefined,
        durationSeconds: updates.durationSeconds !== undefined ? updates.durationSeconds : undefined,
        backgroundValue: updates.backgroundValue !== undefined ? updates.backgroundValue : undefined,
        backgroundType: updates.backgroundType !== undefined ? updates.backgroundType : undefined,
        captionsEnabled: updates.captionsEnabled !== undefined ? updates.captionsEnabled : undefined,
        transitionToNext: updates.transitionToNext !== undefined ? updates.transitionToNext : undefined,
      },
      include: {
        textOverlays: true,
      },
    });

    return NextResponse.json({ scene: updated });
  } catch (err: any) {
    console.error("Update scene error:", err);
    return NextResponse.json({ error: "Failed to update scene" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get("sceneId");

    if (!sceneId) {
      return NextResponse.json({ error: "sceneId param required" }, { status: 400 });
    }

    await prisma.scene.delete({ where: { id: sceneId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete scene error:", err);
    return NextResponse.json({ error: "Failed to delete scene" }, { status: 500 });
  }
}
