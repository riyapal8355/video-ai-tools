import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      // Default to seeded demo user "riya@vidoai.com" if not signed in yet
      const defaultUser = await prisma.user.findUnique({
        where: { email: "riya@vidoai.com" },
        include: { createdWorkspaces: true },
      });

      if (defaultUser) {
        const workspaceId = defaultUser.createdWorkspaces[0]?.id || "";
        const latestLedger = await prisma.creditLedger.findFirst({
          where: { workspaceId },
          orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
          user: {
            id: defaultUser.id,
            email: defaultUser.email,
            name: defaultUser.fullName,
            avatarInitial: "R",
            role: defaultUser.role,
            workspaceId,
            credits: latestLedger?.balanceAfter ?? 850,
            maxCredits: 1000,
            plan: "Pro Creator",
          },
        });
      }
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const latestLedger = await prisma.creditLedger.findFirst({
      where: { workspaceId: session.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        avatarInitial: session.name ? session.name[0].toUpperCase() : "U",
        role: session.role,
        workspaceId: session.workspaceId,
        credits: latestLedger?.balanceAfter ?? 1000,
        maxCredits: 1000,
        plan: "Pro Creator",
      },
    });
  } catch (err: any) {
    console.error("Auth me error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
