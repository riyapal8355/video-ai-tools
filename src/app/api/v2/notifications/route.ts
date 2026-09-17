import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    let workspaceId = session?.workspaceId;
    let userId = session?.userId;

    if (!workspaceId || !userId) {
      const ws = await prisma.workspace.findFirst();
      const u = await prisma.user.findFirst();
      workspaceId = ws?.id || "";
      userId = u?.id || "";
    }

    const notifications = await prisma.notification.findMany({
      where: { workspaceId, userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { notificationId, markAllRead } = body;

    const session = await getCurrentSession();
    let userId = session?.userId;

    if (markAllRead && userId) {
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
      return NextResponse.json({ notification: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}