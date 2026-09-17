import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";
import { processRenderJob } from "@/lib/queue/renderQueue";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id: projectId } = params;

    const session = await getCurrentSession();
    let userId = session?.userId;
    let workspaceId = session?.workspaceId;

    if (!userId || !workspaceId) {
      const user = await prisma.user.findFirst();
      const ws = await prisma.workspace.findFirst();
      userId = user?.id || "";
      workspaceId = ws?.id || "";
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { scenes: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check Credits Balance
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestLedger?.balanceAfter ?? 1000;
    const totalDuration = project.scenes.reduce((acc, s) => acc + (s.durationSeconds || 5.0), 0);
    const estimatedCredits = Math.max(10, Math.ceil((totalDuration / 60) * 10));

    if (currentBalance < estimatedCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: estimatedCredits,
          available: currentBalance,
        },
        { status: 402 }
      );
    }

    // Create Render record
    const render = await prisma.render.create({
      data: {
        projectId,
        requestedByUserId: userId,
        status: "queued",
        estimatedCredits,
        progressPercentage: 5,
      },
    });

    // Mark project as rendering
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "rendering" },
    });

    // Enqueue async render job in background
    setTimeout(() => {
      processRenderJob(render.id).catch((e) => console.error("Render job error:", e));
    }, 50);

    return NextResponse.json(
      {
        renderId: render.id,
        status: "queued",
        estimatedCredits,
        message: "Render job queued successfully",
      },
      { status: 202 }
    );
  } catch (err: any) {
    console.error("Render error:", err);
    return NextResponse.json({ error: "Failed to trigger render" }, { status: 500 });
  }
}
