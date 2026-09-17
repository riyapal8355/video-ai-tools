import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCurrentSession();
    let workspaceId = session?.workspaceId;

    if (!workspaceId) {
      const ws = await prisma.workspace.findFirst();
      workspaceId = ws?.id || "";
    }

    const folders = await prisma.projectFolder.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ folders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    let workspaceId = session?.workspaceId;

    if (!workspaceId) {
      const ws = await prisma.workspace.findFirst();
      workspaceId = ws?.id || "";
    }

    const body = await req.json().catch(() => ({}));
    const { name, parentFolderId } = body;

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await prisma.projectFolder.create({
      data: {
        workspaceId,
        name,
        parentFolderId: parentFolderId || null,
      },
    });

    return NextResponse.json({ folder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}