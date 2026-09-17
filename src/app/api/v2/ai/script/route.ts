import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  generateScript,
  rewriteScript,
  generateScenesFromPrompt,
} from "@/lib/ai/scriptAssistant";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, topic, targetAudience, durationSeconds, scriptText, tone, prompt, sceneCount } = body;

    if (action === "generate") {
      if (!topic) {
        return NextResponse.json({ error: "Topic is required" }, { status: 400 });
      }
      const script = await generateScript({
        topic,
        targetAudience,
        durationSeconds,
      });
      return NextResponse.json({ success: true, script });
    }

    if (action === "rewrite") {
      if (!scriptText) {
        return NextResponse.json({ error: "Script text is required" }, { status: 400 });
      }
      const rewritten = await rewriteScript({
        scriptText,
        tone: tone || "professional",
      });
      return NextResponse.json({ success: true, script: rewritten });
    }

    if (action === "generate_scenes") {
      if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
      }
      const scenes = await generateScenesFromPrompt({
        prompt,
        sceneCount: sceneCount || 3,
      });
      return NextResponse.json({ success: true, scenes });
    }

    return NextResponse.json({ error: "Invalid action. Use 'generate', 'rewrite', or 'generate_scenes'." }, { status: 400 });
  } catch (err: any) {
    console.error("AI script API error:", err);
    return NextResponse.json({ error: err.message || "Failed to process AI script request" }, { status: 500 });
  }
}
