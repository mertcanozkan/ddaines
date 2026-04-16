"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { MasonryGrid, type PhotoItem } from "@/components/gallery/MasonryGrid";
import { Lightbox } from "@/components/gallery/Lightbox";

interface Props {
  photos: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string | null;
    title: string | null;
    width: number | null;
    height: number | null;
    userName: string | null;
    galleryTitle: string | null;
    gallerySlug: string | null;
  }>;
}

export function LikesClient({ photos: rawPhotos }: Props) {
  const [selected, setSelected] = useState<PhotoItem | null>(null);

  const photos: PhotoItem[] = rawPhotos.map((p) => ({
    id: p.id,
    imageUrl: p.imageUrl,
    thumbnailUrl: p.thumbnailUrl,
    title: p.title,
    width: p.width,
    height: p.height,
    user: { name: p.userName },
    gallery: { title: p.galleryTitle, slug: p.gallerySlug },
  }));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-light italic">Liked Photos</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
          <Heart className="h-3.5 w-3.5 text-gold" /> {photos.length} liked photos
        </p>
      </motion.div>

      <MasonryGrid photos={photos} onPhotoClick={setSelected} />
      <Lightbox photo={selected} photos={photos} onClose={() => setSelected(null)} onNavigate={setSelected} />
    </div>
  );
}
