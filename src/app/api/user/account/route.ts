import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, photos } from "@/db/schema";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Collect all Cloudinary public IDs for this user's photos
  const userPhotos = await db
    .select({ cloudinaryPublicId: photos.cloudinaryPublicId })
    .from(photos)
    .where(eq(photos.userId, userId));

  const publicIds = userPhotos
    .map((p) => p.cloudinaryPublicId)
    .filter(Boolean) as string[];

  // Bulk delete from Cloudinary in batches of 100 (API limit)
  for (let i = 0; i < publicIds.length; i += 100) {
    await cloudinary.api.delete_resources(publicIds.slice(i, i + 100)).catch(() => {});
  }

  // Delete user — DB cascades remove galleries, photos, likes, sessions, accounts
  await db.delete(users).where(eq(users.id, userId));

  return NextResponse.json({ success: true });
}
