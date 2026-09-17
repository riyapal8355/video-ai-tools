import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { processPaymentSuccess } from "@/lib/billing/stripe";

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
    const { creditPackId } = body;

    if (!creditPackId) {
      return NextResponse.json({ error: "creditPackId is required" }, { status: 400 });
    }

    const result = await processPaymentSuccess({
      workspaceId,
      userId,
      creditPackId,
    });

    return NextResponse.json({
      success: true,
      addedCredits: result.addedCredits,
      newBalance: result.newBalance,
      message: "Successfully credited " + result.addedCredits + " credits to your workspace.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process topup" }, { status: 500 });
  }
}