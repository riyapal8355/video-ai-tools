import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    await prisma.brandGlossary.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Glossary entry deleted" });
  } catch (err: any) {
    console.error("Delete brand glossary entry error:", err);
    return NextResponse.json({ error: "Failed to delete glossary entry" }, { status: 500 });
  }
}
