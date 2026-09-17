import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId || !session.workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { workspaceId: session.workspaceId },
      include: {
        _count: { select: { deliveries: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ endpoints });
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
    const { url, secret, subscribedEvents = "video.render.completed,video_translate.completed,batch.completed" } = body;

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { error: "Valid webhook URL is required (must start with http:// or https://)" },
        { status: 400 }
      );
    }

    const endpointSecret = secret || `whsec_${crypto.randomBytes(16).toString("hex")}`;

    const endpoint = await prisma.webhookEndpoint.create({
      data: {
        workspaceId: session.workspaceId,
        url,
        secret: endpointSecret,
        subscribedEvents,
      },
    });

    return NextResponse.json({ endpoint }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
