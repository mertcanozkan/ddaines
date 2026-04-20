import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { galleries, photos } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { GalleryManageClient } from "./GalleryManageClient";

export default async function GalleryManagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const { id } = await params;

  const [gallery] = await db
    .select()
    .from(galleries)
    .where(and(eq(galleries.id, id), eq(galleries.userId, session.user.id)))
    .limit(1);

  if (!gallery) notFound();

  const galleryPhotos = await db
    .select()
    .from(photos)
    .where(eq(photos.galleryId, id))
    .orderBy(asc(photos.createdAt));

  return <GalleryManageClient gallery={gallery} photos={galleryPhotos} />;
}
