import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureTemplatesSeeded } from "@/lib/templates/templateEngine";

export async function GET(req: Request) {
  try {
    await ensureTemplatesSeeded();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const formatted = templates.map((t) => {
      let parsedScenes = [];
      try {
        parsedScenes = JSON.parse(t.scenesJson);
      } catch (e) {
        parsedScenes = [];
      }
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        aspectRatio: t.aspectRatio,
        thumbnail: t.thumbnailUrl,
        previewVideoUrl: t.previewVideoUrl,
        isFeatured: t.isFeatured,
        scenesCount: parsedScenes.length,
        scenes: parsedScenes,
      };
    });

    return NextResponse.json({ templates: formatted });
  } catch (error: any) {
    console.error("Failed to list templates:", error);
    return NextResponse.json({ error: error.message || "Failed to list templates" }, { status: 500 });
  }
}
