"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MasonryGrid, type PhotoItem } from "@/components/gallery/MasonryGrid";
import { Lightbox } from "@/components/gallery/Lightbox";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Landscape", "Portrait", "Architecture", "Street", "Nature", "Abstract"];

interface ExploreClientProps {
  photos: PhotoItem[];
  initialCategory?: string;
}

export function ExploreClient({ photos, initialCategory }: ExploreClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "All");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filtered = photos.filter((p) => {
    const matchesSearch = !debouncedSearch ||
      p.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.user?.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = category === "All" ||
      p.gallery?.title?.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleNavigate = useCallback((photo: PhotoItem) => {
    setSelectedPhoto(photo);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <p className="text-gold text-xs uppercase tracking-widest mb-2">Discover</p>
        <h1 className="font-display text-5xl font-light italic mb-6">Explore Gallery</h1>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search photos, photographers…"
            className="pl-9 bg-muted/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm transition-all duration-200",
                category === cat
                  ? "bg-gold text-background font-medium"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      <p className="text-sm text-muted-foreground mb-6">
        {filtered.length} {filtered.length === 1 ? "photo" : "photos"}
      </p>

      <MasonryGrid photos={filtered} onPhotoClick={setSelectedPhoto} />

      <Lightbox
        photo={selectedPhoto}
        photos={filtered}
        onClose={() => setSelectedPhoto(null)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
