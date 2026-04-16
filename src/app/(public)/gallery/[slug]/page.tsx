import { notFound } from "next/navigation";
import { db } from "@/db";
import { galleries, photos, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { GalleryViewClient } from "./GalleryViewClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await db
    .select({ title: galleries.title, description: galleries.description })
    .from(galleries)
    .where(eq(galleries.slug, slug))
    .limit(1)
    .then((r) => r[0]);

  return gallery
    ? { title: gallery.title, description: gallery.description ?? undefined }
    : { title: "Gallery not found" };
}

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = await params;

  const [gallery] = await db
    .select({
      id: galleries.id,
      title: galleries.title,
      slug: galleries.slug,
      description: galleries.description,
      coverImageUrl: galleries.coverImageUrl,
      visibility: galleries.visibility,
      category: galleries.category,
      createdAt: galleries.createdAt,
      userName: users.name,
      userUsername: users.username,
      userAvatarUrl: users.avatarUrl,
    })
    .from(galleries)
    .leftJoin(users, eq(galleries.userId, users.id))
    .where(and(eq(galleries.slug, slug), eq(galleries.visibility, "public")))
    .limit(1);

  if (!gallery) notFound();

  const galleryPhotos = await db
    .select({
      id: photos.id,
      imageUrl: photos.imageUrl,
      thumbnailUrl: photos.thumbnailUrl,
      title: photos.title,
      width: photos.width,
      height: photos.height,
    })
    .from(photos)
    .where(eq(photos.galleryId, gallery.id))
    .orderBy(desc(photos.createdAt));

  return (
    <GalleryViewClient
      gallery={{
        ...gallery,
        user: { name: gallery.userName, username: gallery.userUsername, avatarUrl: gallery.userAvatarUrl },
      }}
      photos={galleryPhotos.map((p) => ({
        ...p,
        user: { name: gallery.userName },
        gallery: { title: gallery.title, slug: gallery.slug },
      }))}
    />
  );
}
