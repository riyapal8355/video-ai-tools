import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const fullName = name || email.split("@")[0];

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        avatarUrl: fullName[0].toUpperCase(),
        role: "creator",
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: `${fullName}'s Studio`,
        createdByUserId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "super_admin",
            status: "active",
          },
        },
        brandKit: {
          create: {
            name: "Default Brand Kit",
          },
        },
        creditLedger: {
          create: {
            delta: 1000,
            reason: "grant",
            balanceAfter: 1000,
          },
        },
      },
    });

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.fullName || "User",
      workspaceId: workspace.id,
      role: user.role,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        avatarInitial: user.fullName ? user.fullName[0].toUpperCase() : "U",
        role: user.role,
        workspaceId: workspace.id,
        credits: 1000,
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
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
