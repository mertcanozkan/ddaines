"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoItem } from "./MasonryGrid";

interface PhotoCardProps {
  photo: PhotoItem;
  onClick?: () => void;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const aspectRatio =
    photo.width && photo.height ? photo.height / photo.width : 1.2;
  const paddingTop = `${Math.min(Math.max(aspectRatio * 100, 60), 180)}%`;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-sm cursor-pointer bg-muted group"
      style={{ paddingTop }}
      onClick={onClick}
    >
      <Image
        src={photo.thumbnailUrl ?? photo.imageUrl}
        alt={photo.title ?? "Photo"}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 cinematic-overlay flex flex-col justify-end p-3"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {photo.title && (
          <p className="text-white font-display text-sm italic truncate mb-1">
            {photo.title}
          </p>
        )}
        <div className="flex items-center justify-between">
          {photo.user?.name && (
            <span className="text-white/80 text-xs truncate">{photo.user.name}</span>
          )}
          <div className="flex items-center gap-3 ml-auto">
            {(photo._count?.likes ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <Heart className="h-3 w-3" />
                {photo._count?.likes}
              </span>
            )}
            <span className="flex items-center gap-1 text-white/80 text-xs">
              <Eye className="h-3 w-3" />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
