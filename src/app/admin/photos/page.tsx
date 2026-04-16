import { db } from "@/db";
import { photos, users, galleries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AdminPhotosClient } from "./AdminPhotosClient";

export default async function AdminPhotosPage() {
  const allPhotos = await db
    .select({
      id: photos.id,
      imageUrl: photos.imageUrl,
      thumbnailUrl: photos.thumbnailUrl,
      title: photos.title,
      isFlagged: photos.isFlagged,
      createdAt: photos.createdAt,
      userName: users.name,
      galleryTitle: galleries.title,
      gallerySlug: galleries.slug,
    })
    .from(photos)
    .leftJoin(users, eq(photos.userId, users.id))
    .leftJoin(galleries, eq(photos.galleryId, galleries.id))
    .orderBy(desc(photos.createdAt))
    .limit(100);

  return <AdminPhotosClient photos={allPhotos} />;
}
