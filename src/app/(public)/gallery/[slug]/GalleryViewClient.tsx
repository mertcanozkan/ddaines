"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Globe, Lock, Images, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MasonryGrid, type PhotoItem } from "@/components/gallery/MasonryGrid";
import { Lightbox } from "@/components/gallery/Lightbox";
import { formatDate } from "@/lib/utils";

interface Props {
  galleryUserId: string;
  gallery: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImageUrl: string | null;
    visibility: string;
    category: string | null;
    createdAt: Date | null;
    user: { name: string | null; username: string | null; avatarUrl: string | null };
  };
  photos: PhotoItem[];
}

export function GalleryViewClient({ galleryUserId, gallery, photos: initialPhotos }: Props) {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<PhotoItem | null>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [coverImageUrl, setCoverImageUrl] = useState(gallery.coverImageUrl);

  const isOwner = !!session?.user?.id && session.user.id === galleryUserId;

  const initials = gallery.user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  const handleDelete = useCallback(async (photo: PhotoItem) => {
    const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
    if (!res.ok) return;

    setPhotos((prev) => {
      const remaining = prev.filter((p) => p.id !== photo.id);
      const idx = prev.findIndex((p) => p.id === photo.id);
      if (remaining.length === 0) {
        setSelected(null);
      } else {
        setSelected(remaining[Math.min(idx, remaining.length - 1)]);
      }
      return remaining;
    });
  }, []);

  const handleSetCover = useCallback(async (photo: PhotoItem) => {
    const res = await fetch(`/api/galleries/${gallery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: gallery.title,
        description: gallery.description,
        category: gallery.category,
        visibility: gallery.visibility,
        coverImageUrl: photo.imageUrl,
      }),
    });
    if (res.ok) setCoverImageUrl(photo.imageUrl);
  }, [gallery]);

  const handleRename = useCallback(async (photo: PhotoItem, newTitle: string) => {
    const res = await fetch(`/api/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setPhotos((prev) => prev.map((p) => (p.id === updated.id ? { ...p, title: updated.title } : p)));
    setSelected((prev) => {
      if (!prev) return null;
      return prev.id === updated.id ? { ...prev, title: updated.title as string } : prev;
    });
  }, []);

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-64 sm:h-96 overflow-hidden">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={gallery.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full bg-muted flex items-center justify-center">
            <Images className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {gallery.category && (
              <Badge variant="secondary" className="mb-3">{gallery.category}</Badge>
            )}
            <h1 className="font-display text-4xl sm:text-6xl font-light italic">{gallery.title}</h1>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={gallery.user.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{gallery.user.name}</span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                {gallery.visibility === "private" ? (
                  <><Lock className="h-3.5 w-3.5" /> Private</>
                ) : (
                  <><Globe className="h-3.5 w-3.5" /> Public</>
                )}
              </div>

              {gallery.createdAt && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(gallery.createdAt)}
                </div>
              )}

              <span className="text-sm text-muted-foreground">{photos.length} photos</span>
            </div>

            {gallery.description && (
              <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
                {gallery.description}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Photos */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <MasonryGrid photos={photos} onPhotoClick={setSelected} />
        <Lightbox
          photo={selected}
          photos={photos}
          onClose={() => setSelected(null)}
          onNavigate={setSelected}
          isOwner={isOwner}
          coverImageUrl={coverImageUrl}
          onDelete={handleDelete}
          onRename={handleRename}
          onSetCover={handleSetCover}
        />
      </div>
    </div>
  );
}
