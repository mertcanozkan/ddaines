import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { likes, photos, users, galleries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { LikesClient } from "./LikesClient";

export default async function LikesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const likedPhotos = await db
    .select({
      id: photos.id,
      imageUrl: photos.imageUrl,
      thumbnailUrl: photos.thumbnailUrl,
      title: photos.title,
      width: photos.width,
      height: photos.height,
      userName: users.name,
      galleryTitle: galleries.title,
      gallerySlug: galleries.slug,
    })
    .from(likes)
    .innerJoin(photos, eq(likes.photoId, photos.id))
    .innerJoin(users, eq(photos.userId, users.id))
    .innerJoin(galleries, eq(photos.galleryId, galleries.id))
    .where(eq(likes.userId, session.user.id))
    .orderBy(desc(likes.createdAt));

  return <LikesClient photos={likedPhotos} />;
}
