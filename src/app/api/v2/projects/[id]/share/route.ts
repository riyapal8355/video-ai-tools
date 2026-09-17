import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.userId || !session.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.workspaceId !== session.workspaceId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    let shareToken = project.shareToken;
    if (!shareToken) {
      shareToken = crypto.randomBytes(16).toString("hex");
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        shareToken,
        isPublic: true,
      },
    });

    const shareUrl = `/share/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareToken,
      shareUrl,
      isPublic: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
