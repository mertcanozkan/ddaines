"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Heart, Download, Share2, Trash2, Loader2, Pencil, Check, Star } from "lucide-react";
import type { PhotoItem } from "./MasonryGrid";

interface LightboxProps {
  photo: PhotoItem | null;
  photos: PhotoItem[];
  onClose: () => void;
  onNavigate: (photo: PhotoItem) => void;
  isOwner?: boolean;
  coverImageUrl?: string | null;
  onDelete?: (photo: PhotoItem) => Promise<void>;
  onRename?: (photo: PhotoItem, newTitle: string) => Promise<void>;
  onSetCover?: (photo: PhotoItem) => Promise<void>;
}

export function Lightbox({ photo, photos, onClose, onNavigate, isOwner, coverImageUrl, onDelete, onRename, onSetCover }: LightboxProps) {
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [settingCover, setSettingCover] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [savingTitle, setSavingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) onNavigate(photos[currentIndex - 1]);
  }, [currentIndex, photos, onNavigate]);

  const goNext = useCallback(() => {
    if (currentIndex < photos.length - 1) onNavigate(photos[currentIndex + 1]);
  }, [currentIndex, photos, onNavigate]);

  // Reset state when photo changes
  useEffect(() => {
    setConfirmDelete(false);
    setDeleting(false);
    setEditingTitle(false);
    setTitleValue(photo?.title ?? "");
  }, [photo?.id, photo?.title]);

  // Focus title input when editing starts
  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editingTitle) { setEditingTitle(false); return; }
        if (confirmDelete) { setConfirmDelete(false); return; }
        onClose();
      }
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
  }, [photo, onClose, goPrev, goNext, confirmDelete, editingTitle]);

  async function saveTitle() {
    if (!photo || !onRename || !titleValue.trim()) return;
    setSavingTitle(true);
    await onRename(photo, titleValue.trim());
    setSavingTitle(false);
    setEditingTitle(false);
  }

  async function handleDelete() {
    if (!photo || !onDelete) return;
    setDeleting(true);
    await onDelete(photo);
    setDeleting(false);
    setConfirmDelete(false);
  }

  async function handleSetCover() {
    if (!photo || !onSetCover) return;
    setSettingCover(true);
    await onSetCover(photo);
    setSettingCover(false);
  }

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
              <motion.div layoutId={`photo-img-${photo.id}`} className="relative h-full">
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
              {/* Title — editable for owner */}
              <div className="group/title flex items-start gap-2">
                {editingTitle ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      ref={titleInputRef}
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); }}
                      className="flex-1 bg-muted border border-border rounded-sm px-2 py-1 text-sm font-display italic outline-none focus:border-gold transition-colors"
                    />
                    <button
                      onClick={saveTitle}
                      disabled={savingTitle || !titleValue.trim()}
                      className="p-1.5 rounded-sm bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-40"
                    >
                      {savingTitle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <>
                    {(photo.title || isOwner) && (
                      <h2 className="flex-1 font-display text-xl font-semibold italic">
                        {photo.title || <span className="text-muted-foreground text-base font-normal not-italic">No title</span>}
                      </h2>
                    )}
                    {isOwner && onRename && (
                      <button
                        onClick={() => { setTitleValue(photo.title ?? ""); setEditingTitle(true); }}
                        className="mt-1 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover/title:opacity-100 transition-all"
                        title="Rename photo"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>

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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-3.5 w-3.5" />
                </a>

                {isOwner && onSetCover && (
                  <button
                    onClick={handleSetCover}
                    disabled={settingCover || photo.imageUrl === coverImageUrl}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted hover:bg-gold/10 hover:text-gold transition-colors text-sm disabled:opacity-40"
                    title={photo.imageUrl === coverImageUrl ? "Current cover" : "Set as gallery cover"}
                  >
                    {settingCover
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Star className={`h-3.5 w-3.5 ${photo.imageUrl === coverImageUrl ? "fill-gold text-gold" : ""}`} />
                    }
                  </button>
                )}

                {isOwner && onDelete && (
                  <div className="ml-auto">
                    {confirmDelete ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-2 py-1.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-sm bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity text-xs disabled:opacity-50"
                        >
                          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
                        title="Delete photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
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
