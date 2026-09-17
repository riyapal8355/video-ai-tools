import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { SUBSCRIPTION_PLANS, CREDIT_TOPUPS } from "@/lib/billing/stripe";

export async function GET() {
  try {
    const session = await getCurrentSession();
    let workspaceId = session?.workspaceId;

    let currentPlan = "starter";
    let creditBalance = 1000;

    if (workspaceId) {
      const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      if (ws) currentPlan = ws.planTier;

      const latest = await prisma.creditLedger.findFirst({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
      });
      if (latest) creditBalance = latest.balanceAfter;
    }

    return NextResponse.json({
      currentPlan,
      creditBalance,
      plans: Object.values(SUBSCRIPTION_PLANS),
      topups: CREDIT_TOPUPS,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load plans" }, { status: 500 });
  }
}