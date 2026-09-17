import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createCheckoutSession } from "@/lib/billing/stripe";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    let userId = session?.userId;
    let workspaceId = session?.workspaceId;

    if (!userId || !workspaceId) {
      const u = await prisma.user.findFirst();
      const w = await prisma.workspace.findFirst();
      userId = u?.id || "";
      workspaceId = w?.id || "";
    }

    const body = await req.json().catch(() => ({}));
    const { planTier, successUrl, cancelUrl } = body;

    if (!planTier) {
      return NextResponse.json({ error: "planTier is required" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const result = await createCheckoutSession({
      workspaceId,
      userId,
      planTier,
      successUrl: successUrl || (origin + "?billing_success=true&plan=" + planTier),
      cancelUrl: cancelUrl || (origin + "?billing_canceled=true"),
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Checkout session error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}