import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: photoId } = await params;

  const existing = await db
    .select()
    .from(likes)
    .where(and(eq(likes.userId, session.user.id), eq(likes.photoId, photoId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(likes).where(and(eq(likes.userId, session.user.id), eq(likes.photoId, photoId)));
    return NextResponse.json({ liked: false });
  }

  await db.insert(likes).values({ userId: session.user.id, photoId });
  return NextResponse.json({ liked: true });
}
