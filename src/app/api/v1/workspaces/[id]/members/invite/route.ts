import { NextResponse } from "next/server";
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

    const { id: workspaceId } = await params;
    if (workspaceId !== session.workspaceId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = "creator" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Find or create invited user
    let invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          fullName: email.split("@")[0],
          passwordHash: "invited_pending_setup",
        },
      });
    }

    // Upsert membership
    const member = await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: invitedUser.id,
        },
      },
      update: {
        role,
        status: "active",
        activatedAt: new Date(),
      },
      create: {
        workspaceId,
        userId: invitedUser.id,
        role,
        status: "active",
        activatedAt: new Date(),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorUserId: session.userId,
        action: "member.invited",
        targetType: "user",
        targetId: invitedUser.id,
        metadata: JSON.stringify({ email, role }),
      },
    });

    // Generate shareable invite link
    const inviteLink = `https://vidoai.com/join/${workspaceId}?invite=${invitedUser.id}`;

    return NextResponse.json(
      {
        success: true,
        member,
        inviteLink,
        message: `Teammate ${email} added as ${role}`,
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
