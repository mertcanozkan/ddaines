import { notFound } from "next/navigation";
import { db } from "@/db";
import { users, galleries, photos } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Globe, Camera, Images } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MasonryGrid } from "@/components/gallery/MasonryGrid";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const [user] = await db
    .select({ name: users.name, bio: users.bio })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  return user
    ? { title: `${user.name ?? username} · DAINES Gallery`, description: user.bio ?? undefined }
    : { title: "Profile not found" };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      avatarUrl: users.avatarUrl,
      website: users.website,
      location: users.location,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) notFound();

  const [publicGalleries, recentPhotos, [{ value: galleryCount }], [{ value: photoCount }]] = await Promise.all([
    db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        coverImageUrl: galleries.coverImageUrl,
        description: galleries.description,
        category: galleries.category,
        createdAt: galleries.createdAt,
      })
      .from(galleries)
      .where(and(eq(galleries.userId, user.id), eq(galleries.visibility, "public")))
      .orderBy(desc(galleries.createdAt))
      .limit(12),

    db
      .select({
        id: photos.id,
        imageUrl: photos.imageUrl,
        thumbnailUrl: photos.thumbnailUrl,
        title: photos.title,
        width: photos.width,
        height: photos.height,
        galleryId: photos.galleryId,
      })
      .from(photos)
      .innerJoin(galleries, and(eq(photos.galleryId, galleries.id), eq(galleries.visibility, "public")))
      .where(eq(photos.userId, user.id))
      .orderBy(desc(photos.createdAt))
      .limit(20),

    db.select({ value: count() }).from(galleries).where(and(eq(galleries.userId, user.id), eq(galleries.visibility, "public"))),
    db.select({ value: count() }).from(photos).where(eq(photos.userId, user.id)),
  ]);

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  return (
    <div className="min-h-screen">
      {/* Hero / Profile header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 ring-2 ring-gold/30 flex-shrink-0">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="text-2xl bg-muted font-display italic">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-4xl font-light">{user.name ?? user.username}</h1>
              {user.username && (
                <p className="text-muted-foreground text-sm mt-0.5">@{user.username}</p>
              )}
              {user.bio && (
                <p className="mt-3 text-sm max-w-lg leading-relaxed">{user.bio}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {user.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {user.location}
                  </span>
                )}
                {user.website && (
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-gold hover:underline"
                  >
                    <Globe className="h-3 w-3" /> {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {user.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    Member since {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-8 flex-shrink-0">
              <div className="text-center">
                <p className="font-display text-3xl font-light">{galleryCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Galleries</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-light">{photoCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Photos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Recent photos */}
        {recentPhotos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-light italic">Recent Photos</h2>
              <Camera className="h-5 w-5 text-muted-foreground" />
            </div>
            <MasonryGrid
              photos={recentPhotos.map((p) => ({
                ...p,
                user: { name: user.name, username: user.username, avatarUrl: user.avatarUrl },
              }))}
            />
          </section>
        )}

        {/* Galleries */}
        {publicGalleries.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-light italic">Galleries</h2>
              <Images className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicGalleries.map((gallery) => (
                <Link
                  key={gallery.id}
                  href={`/gallery/${gallery.slug}`}
                  className="group block bg-card border border-border rounded-sm overflow-hidden hover:border-gold/30 transition-colors"
                >
                  <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                    {gallery.coverImageUrl ? (
                      <Image
                        src={gallery.coverImageUrl}
                        alt={gallery.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Images className="h-8 w-8 text-muted-foreground/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate group-hover:text-gold transition-colors">
                      {gallery.title}
                    </h3>
                    {gallery.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {gallery.description}
                      </p>
                    )}
                    {gallery.createdAt && (
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {formatDate(gallery.createdAt)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {publicGalleries.length === 0 && recentPhotos.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-muted-foreground italic">No public work yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
