"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FileState {
  file: File;
  preview: string;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
  title: string;
  description: string;
  tags: string;
}

interface Props {
  galleries: { id: string; title: string }[];
}

export function UploadClient({ galleries }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<FileState[]>([]);
  const [galleryId, setGalleryId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const valid = newFiles.filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    const items: FileState[] = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      status: "idle",
      progress: 0,
      title: f.name.replace(/\.[^.]+$/, ""),
      description: "",
      tags: "",
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateFile(index: number, update: Partial<FileState>) {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, ...update } : f)));
  }

  async function uploadFile(item: FileState, index: number): Promise<void> {
    updateFile(index, { status: "uploading", progress: 10 });

    const sigRes = await fetch("/api/upload");
    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

    const form = new FormData();
    form.append("file", item.file);
    form.append("signature", signature);
    form.append("timestamp", timestamp);
    form.append("api_key", apiKey);
    form.append("folder", folder);

    updateFile(index, { progress: 40 });

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    const cloudData = await cloudRes.json();

    updateFile(index, { progress: 70 });

    await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        galleryId,
        title: item.title,
        description: item.description,
        imageUrl: cloudData.secure_url,
        thumbnailUrl: cloudData.secure_url.replace("/upload/", "/upload/w_400,f_auto/"),
        cloudinaryPublicId: cloudData.public_id,
        width: cloudData.width,
        height: cloudData.height,
        fileSize: item.file.size,
        tags: item.tags,
      }),
    });

    updateFile(index, { status: "done", progress: 100 });
  }

  async function onUploadAll() {
    if (!galleryId || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "idle") {
        try {
          await uploadFile(files[i], i);
        } catch {
          updateFile(i, { status: "error" });
        }
      }
    }

    setUploading(false);
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-light italic">Upload Photos</h1>
        <p className="text-muted-foreground text-sm mt-1">Add photos to your galleries</p>
      </motion.div>

      {/* Gallery selector */}
      <div className="space-y-1.5 mb-6">
        <Label>Gallery <span className="text-destructive">*</span></Label>
        <Select value={galleryId} onValueChange={setGalleryId}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select a gallery" />
          </SelectTrigger>
          <SelectContent>
            {galleries.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {galleries.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No galleries yet.{" "}
            <a href="/dashboard/galleries" className="text-gold hover:underline">Create one first →</a>
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-sm p-12 text-center transition-colors cursor-pointer mb-6",
          dragging ? "border-gold bg-gold/5" : "border-border hover:border-gold/50 hover:bg-muted/30"
        )}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
        />
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium">Drop photos here or click to browse</p>
        <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP — up to 20MB each</p>
      </div>

      {/* Files list */}
      <AnimatePresence>
        {files.map((item, i) => (
          <motion.div
            key={item.preview}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex gap-4 p-4 bg-card border border-border rounded-sm mb-3"
          >
            {/* Preview */}
            <div className="relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 bg-muted">
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
              {item.status === "done" && (
                <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
              )}
              {item.status === "uploading" && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-gold" />
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-2 min-w-0">
              <Input
                placeholder="Title"
                value={item.title}
                onChange={(e) => updateFile(i, { title: e.target.value })}
                disabled={item.status !== "idle"}
                className="text-sm h-8"
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={item.tags}
                onChange={(e) => updateFile(i, { tags: e.target.value })}
                disabled={item.status !== "idle"}
                className="text-sm h-8"
              />
              {item.status === "uploading" && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => removeFile(i)}
              disabled={item.status === "uploading"}
              className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {files.length > 0 && (
        <button
          onClick={onUploadAll}
          disabled={uploading || !galleryId}
          className="flex items-center gap-2 px-6 py-2.5 bg-gold text-background font-medium rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          Upload {files.filter((f) => f.status === "idle").length} Photos
        </button>
      )}
    </div>
  );
}
