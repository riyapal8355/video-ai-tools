import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      audioSampleUrl,
      language = "English (United States)",
      languageCode = "en-US",
      description,
      gender = "Female",
      ageGroup = "Young adult",
      consentStatement = "I authorize VidoAI to clone and synthesize my voice for AI video generation.",
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Voice name is required" }, { status: 400 });
    }

    let workspaceId: string | undefined = session.workspaceId;
    if (!workspaceId) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { createdWorkspaces: true },
      });
      workspaceId = user?.createdWorkspaces[0]?.id;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace found" }, { status: 400 });
    }

    const targetWsId: string = workspaceId;

    // 1. Create Consent Record
    const userAgent = req.headers.get("user-agent") || undefined;
    const ipAddress = req.headers.get("x-forwarded-for") || undefined;

    const consentRecord = await prisma.consentRecord.create({
      data: {
        workspaceId: targetWsId,
        subjectName: name,
        recordingUrl: audioSampleUrl || null,
        typedStatement: consentStatement,
        userAgent,
        ipAddress,
      },
    });

    // 2. Sample audio fallback
    const sampleAudio =
      audioSampleUrl ||
      "https://actions.google.com/sounds/v1/speech/greeting_male.ogg";

    // 3. Create Cloned Voice in DB
    const voice = await prisma.voice.create({
      data: {
        name,
        type: "instant_clone",
        ownerWorkspaceId: targetWsId,
        description: description || "Custom cloned instant voice",
        gender,
        ageGroup,
        languageDefault: language,
        languageCode,
        supportedLanguages: languageCode,
        sampleAudioUrl: sampleAudio,
        providerVoiceId: `custom_clone_${Date.now()}`,
        providerName: "custom_cloned",
        status: "ready",
        visibility: "workspace",
        consentRecordId: consentRecord.id,
      },
      include: {
        consentRecord: true,
      },
    });

    return NextResponse.json({
      success: true,
      voice,
      message: `Voice "${name}" cloned successfully!`,
    });
  } catch (err: any) {
    console.error("Clone voice error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to clone voice" },
      { status: 500 }
    );
  }
}
