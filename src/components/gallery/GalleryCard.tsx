"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Images, Lock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface GalleryItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category?: string | null;
  coverImageUrl?: string | null;
  visibility: string;
  isFeatured?: boolean | null;
  _count?: { photos: number };
  user?: { name?: string | null; username?: string | null };
}

interface GalleryCardProps {
  gallery: GalleryItem;
}

export function GalleryCard({ gallery }: GalleryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link href={`/gallery/${gallery.slug}`} className="block group">
        <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-muted">
          {gallery.coverImageUrl ? (
            <Image
              src={gallery.coverImageUrl}
              alt={gallery.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Images className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 cinematic-overlay" />
          {gallery.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-gold text-background text-xs border-0">
              Featured
            </Badge>
          )}
          <div className="absolute top-3 right-3">
            {gallery.visibility === "private" ? (
              <Lock className="h-4 w-4 text-white/70" />
            ) : (
              <Globe className="h-4 w-4 text-white/30" />
            )}
          </div>
        </div>

        <div className="mt-3">
          <h3 className="font-display text-lg font-medium group-hover:text-gold transition-colors">
            {gallery.title}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground">
              {gallery.user?.name ?? "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {gallery._count?.photos ?? 0} photos
            </p>
          </div>
          {gallery.category && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {gallery.category}
            </Badge>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
