import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function GET(
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

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        enforceMfa: true,
        allowedDomains: true,
        ssoEnabled: true,
        ssoProvider: true,
      },
    });

    return NextResponse.json({ security: workspace });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { enforceMfa, allowedDomains, ssoEnabled, ssoProvider } = body;

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(enforceMfa !== undefined && { enforceMfa }),
        ...(allowedDomains !== undefined && { allowedDomains }),
        ...(ssoEnabled !== undefined && { ssoEnabled }),
        ...(ssoProvider !== undefined && { ssoProvider }),
      },
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorUserId: session.userId,
        action: "security.updated",
        targetType: "workspace",
        targetId: workspaceId,
        metadata: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, security: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
