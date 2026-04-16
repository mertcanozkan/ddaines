"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Globe, Lock, Images, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MasonryGrid, type PhotoItem } from "@/components/gallery/MasonryGrid";
import { Lightbox } from "@/components/gallery/Lightbox";
import { formatDate } from "@/lib/utils";

interface Props {
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

export function GalleryViewClient({ gallery, photos }: Props) {
  const [selected, setSelected] = useState<PhotoItem | null>(null);

  const initials = gallery.user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="relative h-64 sm:h-96 overflow-hidden">
        {gallery.coverImageUrl ? (
          <Image
            src={gallery.coverImageUrl}
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
        <Lightbox photo={selected} photos={photos} onClose={() => setSelected(null)} onNavigate={setSelected} />
      </div>
    </div>
  );
}
