import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { instantiateTemplate } from "@/lib/templates/templateEngine";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: templateId } = await props.params;
    const body = await req.json().catch(() => ({}));

    const session = await getCurrentSession();
    let userId = session?.userId;
    let workspaceId = session?.workspaceId;

    if (!userId || !workspaceId) {
      const user = await prisma.user.findFirst();
      const ws = await prisma.workspace.findFirst();
      userId = user?.id || "";
      workspaceId = ws?.id || "";
    }

    const project = await instantiateTemplate(
      templateId,
      workspaceId,
      userId,
      body.title
    );

    return NextResponse.json({
      success: true,
      project,
      message: "Template successfully converted into Project",
    });
  } catch (error: any) {
    console.error("Failed to use template:", error);
    return NextResponse.json(
      { error: error.message || "Failed to instantiate template" },
      { status: 500 }
    );
  }
}