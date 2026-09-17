import { NextResponse } from "next/server";
import { saveLocalFile } from "@/lib/storage/storage";

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Storage key required" }, { status: 400 });
    }

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const publicUrl = await saveLocalFile(key, buffer);

    return NextResponse.json({ success: true, publicUrl });
  } catch (err: any) {
    console.error("Local upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
