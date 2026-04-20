"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Edit, ImageIcon, Globe, Lock, Star, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { gallerySchema, type GalleryInput } from "@/lib/validations";
import type { Gallery, Photo } from "@/db/schema";

const CATEGORIES = ["Landscape", "Portrait", "Architecture", "Street", "Nature", "Abstract", "Travel", "Other"];

interface Props {
  gallery: Gallery;
  photos: Photo[];
}

interface EditingPhoto {
  id: string;
  title: string;
  tags: string;
}

export function GalleryManageClient({ gallery: initial, photos: initialPhotos }: Props) {
  const router = useRouter();
  const [gallery, setGallery] = useState(initial);
  const [photos, setPhotos] = useState(initialPhotos);
  const [editGalleryOpen, setEditGalleryOpen] = useState(false);
  const [deleteGalleryOpen, setDeleteGalleryOpen] = useState(false);
  const [deletePhotoTarget, setDeletePhotoTarget] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<EditingPhoto | null>(null);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [settingCover, setSettingCover] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const closePreview = useCallback(() => setPreviewIndex(null), []);
  const prevPhoto = useCallback(() => setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto = useCallback(() => setPreviewIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i)), [photos.length]);

  useEffect(() => {
    if (previewIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, closePreview, prevPhoto, nextPhoto]);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema),
    values: {
      title: gallery.title,
      description: gallery.description ?? "",
      category: gallery.category ?? "",
      visibility: gallery.visibility as "public" | "private",
      coverImageUrl: gallery.coverImageUrl ?? "",
    },
  });

  async function onEditGallery(data: GalleryInput) {
    const res = await fetch(`/api/galleries/${gallery.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setGallery(updated);
      setEditGalleryOpen(false);
    }
  }

  async function onDeleteGallery() {
    await fetch(`/api/galleries/${gallery.id}`, { method: "DELETE" });
    router.push("/dashboard/galleries");
  }

  async function onDeletePhoto() {
    if (!deletePhotoTarget) return;
    setDeletingPhoto(true);
    const res = await fetch(`/api/photos/${deletePhotoTarget}`, { method: "DELETE" });
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== deletePhotoTarget));
      if (gallery.coverImageUrl) {
        const deleted = photos.find((p) => p.id === deletePhotoTarget);
        if (deleted?.imageUrl === gallery.coverImageUrl) {
          setGallery((g) => ({ ...g, coverImageUrl: null }));
        }
      }
    }
    setDeletingPhoto(false);
    setDeletePhotoTarget(null);
  }

  async function onSavePhoto() {
    if (!editingPhoto) return;
    setSavingPhoto(true);
    const res = await fetch(`/api/photos/${editingPhoto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editingPhoto.title, tags: editingPhoto.tags }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPhoto(null);
    }
    setSavingPhoto(false);
  }

  async function onSetCover(photo: Photo) {
    setSettingCover(photo.id);
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
    if (res.ok) {
      const updated = await res.json();
      setGallery(updated);
    }
    setSettingCover(null);
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link
          href="/dashboard/galleries"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All Galleries
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-4xl font-light italic">{gallery.title}</h1>
              {gallery.visibility === "private" ? (
                <Lock className="h-4 w-4 text-muted-foreground mt-1" />
              ) : (
                <Globe className="h-4 w-4 text-muted-foreground mt-1" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-muted-foreground">{photos.length} photos</p>
              {gallery.category && <Badge variant="secondary">{gallery.category}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/gallery/${gallery.slug}`}
              target="_blank"
              className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-muted transition-colors"
            >
              View Public Page
            </Link>
            <button
              onClick={() => setEditGalleryOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
              title="Edit gallery"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDeleteGalleryOpen(true)}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
              title="Delete gallery"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Photos grid */}
      {photos.length === 0 ? (
        <div className="text-center py-24">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-display text-2xl text-muted-foreground italic">No photos yet</p>
          <Link href="/dashboard/upload" className="mt-4 inline-block text-sm text-gold hover:underline">
            Upload photos →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
                className="group relative bg-muted rounded-sm overflow-hidden"
              >
                <div
                  className="aspect-square relative cursor-zoom-in"
                  onClick={() => setPreviewIndex(i)}
                >
                  <Image
                    src={photo.thumbnailUrl ?? photo.imageUrl}
                    alt={photo.title ?? ""}
                    fill
                    className="object-cover"
                  />
                  {gallery.coverImageUrl === photo.imageUrl && (
                    <div className="absolute top-2 left-2">
                      <Badge className="text-xs bg-gold text-background border-0">Cover</Badge>
                    </div>
                  )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none">
                  <div className="flex justify-end gap-1 pointer-events-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSetCover(photo); }}
                      disabled={settingCover === photo.id || gallery.coverImageUrl === photo.imageUrl}
                      className="p-1.5 bg-black/50 rounded-sm text-white hover:bg-gold/80 transition-colors disabled:opacity-40"
                      title="Set as cover"
                    >
                      {settingCover === photo.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Star className="h-3.5 w-3.5" />
                      }
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingPhoto({ id: photo.id, title: photo.title ?? "", tags: (photo.tags ?? []).join(", ") }); }}
                      className="p-1.5 bg-black/50 rounded-sm text-white hover:bg-white/20 transition-colors"
                      title="Edit photo"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletePhotoTarget(photo.id); }}
                      className="p-1.5 bg-black/50 rounded-sm text-white hover:bg-destructive/80 transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {photo.title && (
                    <p className="text-xs text-white truncate">{photo.title}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit gallery dialog */}
      <Dialog open={editGalleryOpen} onOpenChange={setEditGalleryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-light italic">Edit Gallery</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditGallery)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} {...register("description")} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select defaultValue={gallery.category ?? ""} onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select defaultValue={gallery.visibility} onValueChange={(v) => setValue("visibility", v as "public" | "private")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditGalleryOpen(false)} className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-gold text-background rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit photo inline dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={(o) => !o && setEditingPhoto(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-light italic">Edit Photo</DialogTitle>
          </DialogHeader>
          {editingPhoto && (
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tags</Label>
                <Input
                  placeholder="nature, travel, landscape"
                  value={editingPhoto.tags}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, tags: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Comma-separated</p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditingPhoto(null)} className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button onClick={onSavePhoto} disabled={savingPhoto} className="px-4 py-2 text-sm bg-gold text-background rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                  {savingPhoto && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete photo confirmation */}
      <AlertDialog open={!!deletePhotoTarget} onOpenChange={() => setDeletePhotoTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the photo from your gallery and Cloudinary. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingPhoto}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeletePhoto}
              disabled={deletingPhoto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingPhoto && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox */}
      <AnimatePresence>
        {previewIndex !== null && photos[previewIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closePreview}
          >
            <button
              onClick={closePreview}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {previewIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                className="absolute left-4 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}

            {previewIndex < photos.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                className="absolute right-4 p-2 text-white/70 hover:text-white transition-colors"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            )}

            <motion.div
              key={previewIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[85vh] w-full mx-16"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[previewIndex].imageUrl}
                alt={photos[previewIndex].title ?? ""}
                className="w-full h-full object-contain max-h-[85vh] rounded-sm"
              />
              {photos[previewIndex].title && (
                <p className="text-center text-white/80 text-sm mt-3 font-display italic">
                  {photos[previewIndex].title}
                </p>
              )}
              <p className="text-center text-white/40 text-xs mt-1">
                {previewIndex + 1} / {photos.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete gallery confirmation */}
      <AlertDialog open={deleteGalleryOpen} onOpenChange={setDeleteGalleryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{gallery.title}</strong> and all {photos.length} photos in it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteGallery}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Gallery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
