import { NextResponse } from "next/server";
import { authenticateApiKey } from "@/lib/api/apiKeyAuth";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/api/rateLimiter";

export async function GET(req: Request) {
  try {
    let workspaceId = "";
    const apiAuth = await authenticateApiKey(req);

    if (apiAuth) {
      workspaceId = apiAuth.workspaceId;
    } else {
      const session = await getCurrentSession();
      workspaceId = session?.workspaceId || "";
    }

    if (!workspaceId) {
      const ws = await prisma.workspace.findFirst();
      workspaceId = ws?.id || "";
    }

    // Check rate limit for this caller
    const rateCheck = checkRateLimit(`usage_${workspaceId}`, 60, 60);

    const keysCount = await prisma.apiKey.count({
      where: { workspaceId, revokedAt: null },
    });

    const webhooksCount = await prisma.webhookEndpoint.count({
      where: { workspaceId },
    });

    const totalRenders = await prisma.render.count({
      where: { project: { workspaceId } },
    });

    const latestDeliveries = await prisma.webhookDelivery.findMany({
      where: { endpoint: { workspaceId } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json(
      {
        workspaceId,
        metrics: {
          activeApiKeys: keysCount,
          activeWebhooks: webhooksCount,
          totalApiRenders: totalRenders,
          recentWebhookDeliveries: latestDeliveries.length,
        },
        rateLimit: {
          allowed: rateCheck.allowed,
          limit: rateCheck.limit,
          remaining: rateCheck.remaining,
          resetSeconds: rateCheck.resetSeconds,
        },
      },
      {
        headers: {
          "X-RateLimit-Limit": rateCheck.limit.toString(),
          "X-RateLimit-Remaining": rateCheck.remaining.toString(),
          "X-RateLimit-Reset": rateCheck.resetSeconds.toString(),
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}