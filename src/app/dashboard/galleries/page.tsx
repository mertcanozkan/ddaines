import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { galleries, photos } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { GalleriesClient } from "./GalleriesClient";

export default async function GalleriesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const userGalleries = await db
    .select({
      id: galleries.id,
      title: galleries.title,
      slug: galleries.slug,
      description: galleries.description,
      category: galleries.category,
      coverImageUrl: galleries.coverImageUrl,
      visibility: galleries.visibility,
      isFeatured: galleries.isFeatured,
      createdAt: galleries.createdAt,
      photoCount: count(photos.id),
    })
    .from(galleries)
    .leftJoin(photos, eq(photos.galleryId, galleries.id))
    .where(eq(galleries.userId, session.user.id))
    .groupBy(galleries.id)
    .orderBy(desc(galleries.createdAt));

  return <GalleriesClient galleries={userGalleries} userId={session.user.id} />;
}
