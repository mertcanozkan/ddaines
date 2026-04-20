import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { title, description, tags } = await request.json();

  const conditions = [eq(photos.id, id)];
  if (session.user.role !== "admin") conditions.push(eq(photos.userId, session.user.id));

  const [updated] = await db
    .update(photos)
    .set({
      title,
      description,
      tags: tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    })
    .where(and(...conditions))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const conditions = [eq(photos.id, id)];
  if (session.user.role !== "admin") conditions.push(eq(photos.userId, session.user.id));

  const [photo] = await db.select().from(photos).where(and(...conditions)).limit(1);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (photo.cloudinaryPublicId) {
    await deleteImage(photo.cloudinaryPublicId).catch(() => {});
  }

  await db.delete(photos).where(eq(photos.id, id));
  return NextResponse.json({ success: true });
}
