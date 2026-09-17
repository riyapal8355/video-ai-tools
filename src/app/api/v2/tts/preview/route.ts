import { NextResponse } from "next/server";
import { generateSpeech } from "@/lib/generation/ttsProvider";

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const tts = await generateSpeech(text, voiceId);
    return NextResponse.json({
      audioUrl: tts.audioUrl,
      duration: tts.audioDurationSeconds,
      wordTimestamps: tts.wordTimestamps,
    });
  } catch (err: any) {
    console.error("TTS preview error:", err);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}
