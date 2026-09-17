import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const voices = await prisma.voice.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ voices });
  } catch (err: any) {
    console.error("List voices error:", err);
    return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 });
  }
}
