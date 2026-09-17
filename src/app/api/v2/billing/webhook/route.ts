import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processPaymentSuccess } from "@/lib/billing/stripe";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const eventType = body.type || body.event || "checkout.session.completed";
    const dataObj = body.data?.object || body;

    const workspaceId = dataObj.metadata?.workspaceId;
    const userId = dataObj.metadata?.userId;
    const planTier = dataObj.metadata?.planTier;
    const creditPackId = dataObj.metadata?.creditPackId;

    if (workspaceId && (planTier || creditPackId)) {
      await processPaymentSuccess({
        workspaceId,
        userId,
        planTier,
        creditPackId,
      });

      await prisma.auditLog.create({
        data: {
          workspaceId,
          actorUserId: userId || "system",
          action: "billing.payment_received",
          targetType: "workspace",
          targetId: workspaceId,
          metadata: JSON.stringify({ eventType, planTier, creditPackId }),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}