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
    const job = await prisma.translationJob.findUnique({
      where: { id },
    });

    if (!job || job.workspaceId !== auth.workspaceId) {
      return NextResponse.json(
        { error: "Translation job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateSessionOrApiKey(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { originalTranscript, translatedText } = body;

    const job = await prisma.translationJob.findUnique({
      where: { id },
    });

    if (!job || job.workspaceId !== auth.workspaceId) {
      return NextResponse.json(
        { error: "Translation job not found" },
        { status: 404 }
      );
    }

    const updatedJob = await prisma.translationJob.update({
      where: { id },
      data: {
        ...(originalTranscript !== undefined && { originalTranscript }),
        ...(translatedText !== undefined && { translatedText }),
      },
    });

    return NextResponse.json({ job: updatedJob });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
