"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Download, Share2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PhotoItem } from "./MasonryGrid";

interface LightboxProps {
  photo: PhotoItem | null;
  photos: PhotoItem[];
  onClose: () => void;
  onNavigate: (photo: PhotoItem) => void;
}

export function Lightbox({ photo, photos, onClose, onNavigate }: LightboxProps) {
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(photos[currentIndex - 1]);
  }, [currentIndex, photos, onNavigate]);

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(photos[currentIndex + 1]);
  }, [currentIndex, photos, onNavigate]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    if (photo) {
      window.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [photo, onClose, goPrev, goNext]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Blurred background */}
          <div
            className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
            style={{
              backgroundImage: `url(${photo.thumbnailUrl ?? photo.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(40px) saturate(0.5)",
              opacity: 0.3,
            }}
          />
          <div className="absolute inset-0 bg-background/80" />

          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 p-2 bg-background/50 hover:bg-background/80 rounded-full backdrop-blur-sm transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation */}
          {currentIndex > 0 && (
            <button
              className="absolute left-4 z-10 p-2 bg-background/50 hover:bg-background/80 rounded-full backdrop-blur-sm transition-colors"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {currentIndex < photos.length - 1 && (
            <button
              className="absolute right-4 z-10 p-2 bg-background/50 hover:bg-background/80 rounded-full backdrop-blur-sm transition-colors"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Main content */}
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 flex flex-col lg:flex-row gap-4 max-w-6xl w-full mx-16 h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative flex-1 min-h-0 rounded-sm overflow-hidden">
              <motion.div layoutId={`photo-img-${photo.id}`} className="h-full">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title ?? "Photo"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>

            {/* Metadata panel */}
            <div className="lg:w-72 flex flex-col gap-4 bg-card/80 backdrop-blur-sm rounded-sm p-5 border border-border overflow-y-auto">
              {photo.title && (
                <h2 className="font-display text-xl font-semibold italic">{photo.title}</h2>
              )}

              {photo.user && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Photographer</p>
                  <p className="text-sm font-medium">{photo.user.name}</p>
                </div>
              )}

              {photo.gallery && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Gallery</p>
                  <p className="text-sm">{photo.gallery.title}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted hover:bg-gold/10 hover:text-gold transition-colors text-sm">
                  <Heart className="h-3.5 w-3.5" />
                  <span>{photo._count?.likes ?? 0}</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors text-sm">
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <a
                  href={photo.imageUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors text-sm ml-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
