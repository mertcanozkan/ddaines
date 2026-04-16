import { db } from "@/db";
import { galleries, users, photos } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { AdminGalleriesClient } from "./AdminGalleriesClient";

export default async function AdminGalleriesPage() {
  const allGalleries = await db
    .select({
      id: galleries.id,
      title: galleries.title,
      slug: galleries.slug,
      visibility: galleries.visibility,
      isFeatured: galleries.isFeatured,
      createdAt: galleries.createdAt,
      coverImageUrl: galleries.coverImageUrl,
      userName: users.name,
      photoCount: count(photos.id),
    })
    .from(galleries)
    .leftJoin(users, eq(galleries.userId, users.id))
    .leftJoin(photos, eq(photos.galleryId, galleries.id))
    .groupBy(galleries.id, users.name)
    .orderBy(desc(galleries.createdAt));

  return <AdminGalleriesClient galleries={allGalleries} />;
}
