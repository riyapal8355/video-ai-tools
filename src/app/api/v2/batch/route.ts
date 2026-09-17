import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";

export async function GET(request: Request) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batchJobs = await prisma.batchJob.findMany({
      where: { workspaceId: auth.workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
      take: 50,
    });

    return NextResponse.json({ batchJobs });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
