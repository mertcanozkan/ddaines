"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, StarOff, Trash2, Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";

interface Gallery {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  isFeatured: boolean | null;
  createdAt: Date | null;
  coverImageUrl: string | null;
  userName: string | null;
  photoCount: number;
}

interface Props {
  galleries: Gallery[];
}

export function AdminGalleriesClient({ galleries: initial }: Props) {
  const [galleries, setGalleries] = useState(initial);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function toggleFeatured(id: string, current: boolean | null) {
    await fetch(`/api/admin/galleries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFeatured: !current }),
    });
    setGalleries(galleries.map((g) => (g.id === id ? { ...g, isFeatured: !current } : g)));
  }

  async function deleteGallery(id: string) {
    await fetch(`/api/galleries/${id}`, { method: "DELETE" });
    setGalleries(galleries.filter((g) => g.id !== id));
    setDeleteTarget(null);
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-light italic">Galleries</h1>
        <p className="text-muted-foreground text-sm mt-1">{galleries.length} total galleries</p>
      </motion.div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Gallery</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Owner</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Photos</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden lg:table-cell">Created</th>
              <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {galleries.map((gallery) => (
              <tr key={gallery.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/gallery/${gallery.slug}`} className="font-medium hover:text-gold transition-colors">
                          {gallery.title}
                        </Link>
                        {gallery.isFeatured && (
                          <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">Featured</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        {gallery.visibility === "private" ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {gallery.visibility}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{gallery.userName ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{gallery.photoCount}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                  {gallery.createdAt ? formatDate(gallery.createdAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => toggleFeatured(gallery.id, gallery.isFeatured)}
                      className="p-1.5 rounded-sm hover:bg-gold/10 hover:text-gold transition-colors"
                      title={gallery.isFeatured ? "Unfeature" : "Feature"}
                    >
                      {gallery.isFeatured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(gallery.id)}
                      className="p-1.5 rounded-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
            <AlertDialogDescription>This permanently deletes the gallery and all its photos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteGallery(deleteTarget)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
