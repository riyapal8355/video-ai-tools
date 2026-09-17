import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";
import { parseCsvText, runBatchPipeline } from "@/lib/batch/batchProcessor";

export async function POST(request: Request) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name = "Batch Campaign", templateProjectId, csvData, rows } = body;

    let parsedRows: Array<Record<string, string>> = [];
    if (Array.isArray(rows) && rows.length > 0) {
      parsedRows = rows;
    } else if (typeof csvData === "string" && csvData.trim().length > 0) {
      const parsed = parseCsvText(csvData);
      parsedRows = parsed.rows;
    }

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { error: "No valid rows found in CSV or rows payload" },
        { status: 400 }
      );
    }

    const totalCount = parsedRows.length;
    const requiredCredits = totalCount * 10;

    // Check workspace credit balance
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { workspaceId: auth.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestLedger ? latestLedger.balanceAfter : 100;
    if (currentBalance < requiredCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits for batch generation",
          required: requiredCredits,
          available: currentBalance,
        },
        { status: 402 }
      );
    }

    // Create BatchJob and BatchItem records in a transaction
    const batchJob = await prisma.$transaction(async (tx) => {
      const job = await tx.batchJob.create({
        data: {
          workspaceId: auth.workspaceId,
          userId: auth.userId,
          name,
          templateProjectId: templateProjectId || null,
          totalCount,
          status: "queued",
          creditsConsumed: 0,
        },
      });

      for (let i = 0; i < parsedRows.length; i++) {
        await tx.batchItem.create({
          data: {
            batchJobId: job.id,
            rowIndex: i,
            variablesJson: JSON.stringify(parsedRows[i]),
            status: "queued",
          },
        });
      }

      return job;
    });

    // Run batch rendering pipeline asynchronously
    runBatchPipeline(batchJob.id).catch((err) =>
      console.error("Async batch pipeline error:", err)
    );

    return NextResponse.json(
      {
        id: batchJob.id,
        name: batchJob.name,
        totalCount,
        status: "queued",
        estimatedCredits: requiredCredits,
        message: "Batch job created and rendering queued",
      },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
