"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Globe, Lock, Images } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gallerySchema, type GalleryInput } from "@/lib/validations";
import { Loader2 } from "lucide-react";

interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  coverImageUrl: string | null;
  visibility: string;
  isFeatured: boolean | null;
  photoCount: number;
}

interface Props {
  galleries: Gallery[];
  userId: string;
}

const CATEGORIES = ["Landscape", "Portrait", "Architecture", "Street", "Nature", "Abstract", "Travel", "Other"];

export function GalleriesClient({ galleries: initial, userId }: Props) {
  const router = useRouter();
  const [galleries, setGalleries] = useState(initial);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema),
    defaultValues: { visibility: "public" },
  });

  async function onCreate(data: GalleryInput) {
    const res = await fetch("/api/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const newGallery = await res.json();
      setGalleries([{ ...newGallery, photoCount: 0 }, ...galleries]);
      setCreateOpen(false);
      reset();
      router.refresh();
    }
  }

  async function onDelete(id: string) {
    await fetch(`/api/galleries/${id}`, { method: "DELETE" });
    setGalleries(galleries.filter((g) => g.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-display text-4xl font-light italic">My Galleries</h1>
          <p className="text-muted-foreground text-sm mt-1">{galleries.length} galleries</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-background text-sm font-medium rounded-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> New Gallery
        </button>
      </motion.div>

      {galleries.length === 0 ? (
        <div className="text-center py-24">
          <Images className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-display text-2xl text-muted-foreground italic">No galleries yet</p>
          <button onClick={() => setCreateOpen(true)} className="mt-4 text-sm text-gold hover:underline">
            Create your first gallery →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery, i) => (
            <motion.div
              key={gallery.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-sm overflow-hidden hover:border-gold/30 transition-colors"
            >
              <div className="relative aspect-[4/3] bg-muted">
                {gallery.coverImageUrl ? (
                  <Image src={gallery.coverImageUrl} alt={gallery.title} fill className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Images className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{gallery.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{gallery.photoCount} photos</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {gallery.visibility === "private" ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {gallery.category && (
                  <Badge variant="secondary" className="mt-2 text-xs">{gallery.category}</Badge>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Link
                    href={`/gallery/${gallery.slug}`}
                    className="flex-1 text-center text-xs py-1.5 rounded-sm bg-muted hover:bg-muted/80 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(gallery.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-light italic">New Gallery</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="My Gallery" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Describe your gallery…" rows={3} {...register("description")} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select onValueChange={(v) => setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select defaultValue="public" onValueChange={(v) => setValue("visibility", v as "public" | "private")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 text-sm border border-border rounded-sm hover:bg-muted transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-gold text-background rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create Gallery
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the gallery and all its photos. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && onDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
