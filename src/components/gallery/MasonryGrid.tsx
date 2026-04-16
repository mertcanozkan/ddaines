"use client";

import { motion } from "framer-motion";
import { PhotoCard } from "./PhotoCard";

export interface PhotoItem {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  user?: { name?: string | null; username?: string | null; avatarUrl?: string | null } | null;
  gallery?: { title?: string | null; slug?: string | null } | null;
  _count?: { likes: number };
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

interface MasonryGridProps {
  photos: PhotoItem[];
  onPhotoClick?: (photo: PhotoItem) => void;
}

export function MasonryGrid({ photos, onPhotoClick }: MasonryGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display text-2xl text-muted-foreground italic">No photos yet</p>
        <p className="text-sm text-muted-foreground mt-2">Be the first to capture something extraordinary.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="masonry-grid"
    >
      {photos.map((photo) => (
        <motion.div key={photo.id} variants={itemVariants} className="masonry-item">
          <PhotoCard photo={photo} onClick={() => onPhotoClick?.(photo)} />
        </motion.div>
      ))}
    </motion.div>
  );
}
