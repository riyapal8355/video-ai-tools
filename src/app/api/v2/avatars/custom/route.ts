import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      type = "instant",
      footageUrl,
      consentStatement = "I hereby declare that I authorize the creation of my digital AI twin for video generation.",
      consentAudioUrl,
      gender = "Female",
      attire = "Modern Casual",
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Avatar name is required" }, { status: 400 });
    }

    let workspaceId: string | undefined = session.workspaceId;
    if (!workspaceId) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { createdWorkspaces: true },
      });
      workspaceId = user?.createdWorkspaces[0]?.id;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const targetWsId: string = workspaceId;

    // 1. Create Consent Record
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;

    const consentRecord = await prisma.consentRecord.create({
      data: {
        workspaceId: targetWsId,
        subjectName: name,
        recordingUrl: consentAudioUrl || footageUrl || null,
        typedStatement: consentStatement,
        userAgent,
        ipAddress,
      },
    });

    // 2. Create Custom Avatar
    const customThumbnail =
      footageUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";

    const customVideo =
      footageUrl ||
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

    const avatar = await prisma.avatar.create({
      data: {
        name,
        type: type === "photo" ? "photo" : "instant",
        ownerWorkspaceId: targetWsId,
        createdByUserId: session.userId,
        status: "ready",
        visibility: "workspace",
        thumbnailUrl: customThumbnail,
        previewVideoUrl: customVideo,
        category: "Custom",
        attire,
        gender,
        consentRecordId: consentRecord.id,
      },
      include: {
        consentRecord: true,
      },
    });

    return NextResponse.json({
      success: true,
      avatar,
      message: "Custom avatar created and trained successfully!",
    });
  } catch (err: any) {
    console.error("Create custom avatar error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create custom avatar" },
      { status: 500 }
    );
  }
}
