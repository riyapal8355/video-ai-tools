import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    const comments = await prisma.projectComment.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id: projectId } = await params;
    const body = await request.json();
    const { content, sceneIndex = 0, timestampMs = 0 } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Determine user (logged-in user or anonymous guest for shared links)
    let userId = session?.userId;
    if (!userId) {
      const proj = await prisma.project.findUnique({ where: { id: projectId } });
      const firstUser = await prisma.user.findFirst();
      userId = proj?.ownerUserId || firstUser?.id || "";
    }

    const comment = await prisma.projectComment.create({
      data: {
        projectId,
        userId,
        content,
        sceneIndex,
        timestampMs,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
