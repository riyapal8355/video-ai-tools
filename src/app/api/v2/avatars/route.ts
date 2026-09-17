import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const avatars = await prisma.avatar.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ avatars });
  } catch (err: any) {
    console.error("List avatars error:", err);
    return NextResponse.json({ error: "Failed to fetch avatars" }, { status: 500 });
  }
}
