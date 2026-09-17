import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateSessionOrApiKey } from "@/lib/api/apiKeyAuth";
import { runTranslationPipeline } from "@/lib/translation/videoTranslator";

export async function GET(request: Request) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobs = await prisma.translationJob.findMany({
      where: { workspaceId: auth.workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ jobs });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sourceVideoUrl,
      targetLanguage,
      sourceLanguage = "auto",
      targetVoiceId,
      originalTranscript,
    } = body;

    if (!sourceVideoUrl || !targetLanguage) {
      return NextResponse.json(
        { error: "sourceVideoUrl and targetLanguage are required" },
        { status: 400 }
      );
    }

    // Check workspace credit balance
    const latestLedger = await prisma.creditLedger.findFirst({
      where: { workspaceId: auth.workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const currentBalance = latestLedger ? latestLedger.balanceAfter : 100;
    const requiredCredits = 15;

    if (currentBalance < requiredCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: requiredCredits,
          available: currentBalance,
        },
        { status: 402 }
      );
    }

    // Create TranslationJob record
    const job = await prisma.translationJob.create({
      data: {
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        sourceVideoUrl,
        sourceLanguage,
        targetLanguage,
        originalTranscript: originalTranscript || null,
        targetVoiceId: targetVoiceId || null,
        status: "queued",
        progressPercentage: 0,
        creditsConsumed: requiredCredits,
      },
    });

    // Run pipeline asynchronously
    runTranslationPipeline(job.id).catch((err) =>
      console.error("Async translation pipeline error:", err)
    );

    return NextResponse.json(
      {
        id: job.id,
        status: "queued",
        message: "Translation job queued successfully",
        estimatedCredits: requiredCredits,
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
