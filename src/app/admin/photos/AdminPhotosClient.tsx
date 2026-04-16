"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Flag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Photo {
  id: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  title: string | null;
  isFlagged: boolean | null;
  createdAt: Date | null;
  userName: string | null;
  galleryTitle: string | null;
  gallerySlug: string | null;
}

interface Props {
  photos: Photo[];
}

export function AdminPhotosClient({ photos: initial }: Props) {
  const [photos, setPhotos] = useState(initial);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function toggleFlag(id: string, current: boolean | null) {
    await fetch(`/api/admin/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFlagged: !current }),
    });
    setPhotos(photos.map((p) => (p.id === id ? { ...p, isFlagged: !current } : p)));
  }

  async function deletePhoto(id: string) {
    await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
    setPhotos(photos.filter((p) => p.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-light italic">Photos</h1>
        <p className="text-muted-foreground text-sm mt-1">{photos.length} photos</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative bg-muted rounded-sm overflow-hidden aspect-square">
            <Image
              src={photo.thumbnailUrl ?? photo.imageUrl}
              alt={photo.title ?? "Photo"}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            {photo.isFlagged && (
              <div className="absolute top-1 left-1">
                <Badge className="bg-destructive text-destructive-foreground text-xs">Flagged</Badge>
              </div>
            )}
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div>
                <p className="text-xs font-medium truncate">{photo.title ?? "Untitled"}</p>
                <p className="text-xs text-muted-foreground truncate">{photo.userName}</p>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <button
                  onClick={() => toggleFlag(photo.id, photo.isFlagged)}
                  className="p-1 rounded-sm hover:bg-yellow-500/20 hover:text-yellow-500 transition-colors"
                >
                  <Flag className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(photo.id)}
                  className="p-1 rounded-sm hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the photo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deletePhoto(deleteTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
