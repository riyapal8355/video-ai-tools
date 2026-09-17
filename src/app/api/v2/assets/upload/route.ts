import { NextResponse } from "next/server";
import { getUploadUrl } from "@/lib/storage/storage";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const { fileName, fileType, fileSize } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 });
    }

    const session = await getCurrentSession();
    let workspaceId = session?.workspaceId;
    let userId = session?.userId;

    if (!workspaceId || !userId) {
      const user = await prisma.user.findFirst();
      const ws = await prisma.workspace.findFirst();
      userId = user?.id || "";
      workspaceId = ws?.id || "";
    }

    const { uploadUrl, storageKey, publicUrl } = await getUploadUrl(fileName, fileType);

    const asset = await prisma.asset.create({
      data: {
        workspaceId,
        uploadedByUserId: userId,
        type: fileType.startsWith("video")
          ? "video"
          : fileType.startsWith("audio")
          ? "audio"
          : fileType.startsWith("image")
          ? "image"
          : "font",
        storageKey,
        url: publicUrl,
        fileName,
        fileSizeBytes: fileSize,
        mimeType: fileType,
      },
    });

    return NextResponse.json({
      assetId: asset.id,
      uploadUrl,
      publicUrl,
      storageKey,
    });
  } catch (err: any) {
    console.error("Asset upload error:", err);
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
