import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { generateApiKey } from "@/lib/api/apiKeyAuth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId || !session.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: {
        workspaceId: session.workspaceId,
        revokedAt: null,
      },
      select: {
        id: true,
        label: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ keys });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId || !session.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { label = "API Key" } = body;

    const result = await generateApiKey(
      session.workspaceId,
      session.userId,
      label
    );

    return NextResponse.json({
      apiKey: {
        id: result.keyId,
        label,
        keyPrefix: result.prefix,
        rawKey: result.rawKey, // returned only once upon creation
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
