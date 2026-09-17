import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createCustomerPortalSession } from "@/lib/billing/stripe";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    let workspaceId = session?.workspaceId;

    if (!workspaceId) {
      const w = await prisma.workspace.findFirst();
      workspaceId = w?.id || "";
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const result = await createCustomerPortalSession({
      workspaceId,
      returnUrl: origin,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create portal session" }, { status: 500 });
  }
}