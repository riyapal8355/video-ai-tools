import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const body = await req.json();
    const { term, replacement, language = "en", notes } = body;

    if (!term || !replacement) {
      return NextResponse.json(
        { error: "Both term and replacement/pronunciation are required" },
        { status: 400 }
      );
    }

    const targetWsId: string = workspaceId;

    const entry = await prisma.brandGlossary.create({
      data: {
        workspaceId: targetWsId,
        type: body.type || "pronunciation",
        originalTerm: term,
        targetTerm: replacement,
        language,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("Create brand glossary error:", err);
    return NextResponse.json({ error: "Failed to create glossary entry" }, { status: 500 });
  }
}
