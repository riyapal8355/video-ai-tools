import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";

export async function DELETE(
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
        { code: 404, message: "Video not found" },
        { status: 404 }
      );
    }

    await prisma.render.delete({
      where: { id },
    });

    return NextResponse.json({
      code: 100,
      message: "Video deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { code: 500, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
