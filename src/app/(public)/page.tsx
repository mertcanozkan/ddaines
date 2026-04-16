import { Suspense } from "react";
import { db } from "@/db";
import { galleries, photos, users } from "@/db/schema";
import { eq, count, desc } from "drizzle-orm";
import { HomepageClient } from "./HomepageClient";

async function getStats() {
  const [photoCount, galleryCount, userCount] = await Promise.all([
    db.select({ count: count() }).from(photos).then((r) => r[0].count),
    db.select({ count: count() }).from(galleries).where(eq(galleries.visibility, "public")).then((r) => r[0].count),
    db.select({ count: count() }).from(users).then((r) => r[0].count),
  ]);
  return { photoCount, galleryCount, userCount };
}

async function getFeaturedGalleries() {
  return db
    .select({
      id: galleries.id,
      title: galleries.title,
      slug: galleries.slug,
      coverImageUrl: galleries.coverImageUrl,
      category: galleries.category,
      isFeatured: galleries.isFeatured,
      userName: users.name,
      username: users.username,
    })
    .from(galleries)
    .leftJoin(users, eq(galleries.userId, users.id))
    .where(eq(galleries.visibility, "public"))
    .orderBy(desc(galleries.isFeatured), desc(galleries.createdAt))
    .limit(6);
}

export default async function HomePage() {
  const [stats, featured] = await Promise.all([getStats(), getFeaturedGalleries()]);

  return <HomepageClient stats={stats} featuredGalleries={featured} />;
}
