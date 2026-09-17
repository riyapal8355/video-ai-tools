import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        createdWorkspaces: true,
        workspaceMembers: {
          include: { workspace: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.passwordHash && password) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const workspaceId =
      user.createdWorkspaces[0]?.id ||
      user.workspaceMembers[0]?.workspaceId ||
      "";

    // Get live credits
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const credits = latestLedger?.balanceAfter ?? 1000;

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.fullName || "User",
      workspaceId: workspaceId,
      role: user.role,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName || "User",
        avatarInitial: user.fullName ? user.fullName[0].toUpperCase() : "U",
        role: user.role,
        workspaceId,
        credits,
        maxCredits: 1000,
        plan: "Pro Creator",
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
