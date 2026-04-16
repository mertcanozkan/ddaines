import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const conditions = [eq(galleries.id, id)];
  if (session.user.role !== "admin") {
    conditions.push(eq(galleries.userId, session.user.id));
  }

  await db.delete(galleries).where(and(...conditions));
  return NextResponse.json({ success: true });
}
