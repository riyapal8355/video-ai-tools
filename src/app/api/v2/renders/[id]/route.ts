import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const render = await prisma.render.findUnique({
      where: { id },
    });

    if (!render) {
      return NextResponse.json({ error: "Render not found" }, { status: 404 });
    }

    return NextResponse.json({
      render: {
        id: render.id,
        status: render.status,
        progressPercentage: render.progressPercentage,
        outputAssetUrl: render.outputAssetUrl,
        errorMessage: render.errorMessage,
        estimatedCredits: render.estimatedCredits,
        actualCreditsConsumed: render.actualCreditsConsumed,
        completedAt: render.completedAt,
      },
    });
  } catch (err: any) {
    console.error("Get render status error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
