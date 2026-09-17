import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const batchJob = await prisma.batchJob.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { rowIndex: "asc" },
        },
      },
    });

    if (!batchJob || batchJob.workspaceId !== auth.workspaceId) {
      return NextResponse.json(
        { error: "Batch job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ batchJob });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
