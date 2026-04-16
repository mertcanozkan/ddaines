import { Suspense } from "react";
import { db } from "@/db";
import { photos, users, galleries } from "@/db/schema";
import { eq, desc, like, and, sql } from "drizzle-orm";
import { ExploreClient } from "./ExploreClient";

interface ExplorePageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

async function getPhotos(q?: string, category?: string) {
  const conditions = [eq(galleries.visibility, "public")];
  if (category) conditions.push(eq(galleries.category, category));

  return db
    .select({
      id: photos.id,
      imageUrl: photos.imageUrl,
      thumbnailUrl: photos.thumbnailUrl,
      title: photos.title,
      width: photos.width,
      height: photos.height,
      createdAt: photos.createdAt,
      userName: users.name,
      userUsername: users.username,
      userAvatarUrl: users.avatarUrl,
      galleryTitle: galleries.title,
      gallerySlug: galleries.slug,
    })
    .from(photos)
    .innerJoin(galleries, eq(photos.galleryId, galleries.id))
    .innerJoin(users, eq(photos.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(photos.createdAt))
    .limit(48);
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { q, category } = await searchParams;
  const rawPhotos = await getPhotos(q, category);

  const photoItems = rawPhotos.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    thumbnailUrl: p.thumbnailUrl,
    title: p.title,
    width: p.width,
    height: p.height,
    user: { name: p.userName, username: p.userUsername, avatarUrl: p.userAvatarUrl },
    gallery: { title: p.galleryTitle, slug: p.gallerySlug },
  }));

  return (
    <div className="pt-16">
      <Suspense>
        <ExploreClient photos={photoItems} initialCategory={category} />
      </Suspense>
    </div>
  );
}
