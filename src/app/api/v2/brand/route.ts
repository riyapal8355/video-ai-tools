import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

// GET /api/v2/brand - Return active workspace BrandKit & Glossary
export async function GET() {
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

    const targetWsId: string = workspaceId;

    // Find or create default BrandKit
    let brandKit = await prisma.brandKit.findUnique({
      where: { workspaceId: targetWsId },
    });

    if (!brandKit) {
      brandKit = await prisma.brandKit.create({
        data: {
          workspaceId: targetWsId,
          name: "Default Brand Kit",
          primaryColor: "#0b101c",
          accentColor: "#06b6d4",
          secondaryColor: "#8b5cf6",
          fontFamily: "Inter, sans-serif",
          watermarkEnabled: false,
        },
      });
    }

    const glossary = await prisma.brandGlossary.findMany({
      where: { workspaceId: targetWsId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ brandKit, glossary });
  } catch (err: any) {
    console.error("Get brand data error:", err);
    return NextResponse.json({ error: "Failed to fetch brand data" }, { status: 500 });
  }
}

// PATCH /api/v2/brand - Update BrandKit colors, font, logo, watermark
export async function PATCH(req: NextRequest) {
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
    const {
      name,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      logoUrl,
      watermarkEnabled,
      introAssetUrl,
      outroAssetUrl,
    } = body;

    const targetWsId: string = workspaceId;

    const brandKit = await prisma.brandKit.upsert({
      where: { workspaceId: targetWsId },
      update: {
        ...(name !== undefined && { name }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(fontFamily !== undefined && { fontFamily }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(watermarkEnabled !== undefined && { watermarkEnabled }),
        ...(introAssetUrl !== undefined && { introAssetUrl }),
        ...(outroAssetUrl !== undefined && { outroAssetUrl }),
      },
      create: {
        workspaceId: targetWsId,
        name: name || "Default Brand Kit",
        primaryColor: primaryColor || "#0b101c",
        secondaryColor: secondaryColor || "#8b5cf6",
        accentColor: accentColor || "#06b6d4",
        fontFamily: fontFamily || "Inter, sans-serif",
        logoUrl,
        watermarkEnabled: watermarkEnabled ?? false,
        introAssetUrl,
        outroAssetUrl,
      },
    });

    return NextResponse.json({ success: true, brandKit });
  } catch (err: any) {
    console.error("Update brand kit error:", err);
    return NextResponse.json({ error: "Failed to update brand kit" }, { status: 500 });
  }
}
