import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        scenes: {
          orderBy: { orderIndex: "asc" },
          include: { textOverlays: true },
        },
        renders: {
          orderBy: { queuedAt: "desc" },
          take: 5,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    console.error("Get project error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await req.json();

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        orientation: body.orientation !== undefined ? body.orientation : undefined,
        status: body.status !== undefined ? body.status : undefined,
        musicVolume: body.musicVolume !== undefined ? body.musicVolume : undefined,
      },
    });

    return NextResponse.json({ project: updated });
  } catch (err: any) {
    console.error("Update project error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete project error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
