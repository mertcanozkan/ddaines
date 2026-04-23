"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, Camera } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import type { User } from "@/db/schema";

interface Props {
  user: User;
}

export function SettingsClient({ user }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? undefined);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      username: user.username ?? "",
      bio: user.bio ?? "",
      website: user.website ?? "",
      location: user.location ?? "",
    },
  });

  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);

    const sigRes = await fetch("/api/upload");
    if (!sigRes.ok) { setAvatarUploading(false); return; }
    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

    const form = new FormData();
    form.append("file", file);
    form.append("signature", signature);
    form.append("timestamp", String(timestamp));
    form.append("api_key", apiKey);
    form.append("folder", folder);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });
    const cloudData = await cloudRes.json();
    if (!cloudRes.ok || cloudData.error) { setAvatarUploading(false); return; }

    const url: string = cloudData.secure_url.replace("/upload/", "/upload/w_200,h_200,c_fill,f_auto/");

    const res = await fetch("/api/user/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    });
    if (res.ok) {
      setAvatarUrl(url);
      await update({ image: url });
      router.refresh();
    }
    setAvatarUploading(false);
  }

  async function deleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/user/account", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/" });
    } else {
      setDeleting(false);
    }
  }

  async function onSubmit(data: ProfileInput) {
    setError(null);
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } else {
      const json = await res.json();
      setError(json.error ?? "Failed to save");
    }
  }

  return (
    <div className="max-w-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-4xl font-light italic">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile and account</p>
      </motion.div>

      {/* Avatar section */}
      <div className="flex items-center gap-4 mb-8">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          disabled={avatarUploading}
          className="relative group focus:outline-none"
          title="Change profile photo"
        >
          <Avatar className="h-16 w-16 ring-2 ring-gold/30">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-lg bg-muted">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
            {avatarUploading
              ? <Loader2 className="h-5 w-5 animate-spin text-gold" />
              : <Camera className="h-5 w-5 text-gold" />
            }
          </div>
        </button>
        <div>
          <p className="font-medium">{user.name ?? "Your Name"}</p>
          <p className="text-sm text-muted-foreground">@{user.username ?? "username"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Click photo to change</p>
        </div>
      </div>

      <Separator className="mb-6" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
              <Input className="pl-7" {...register("username")} />
            </div>
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea rows={3} placeholder="Tell the world about yourself…" {...register("bio")} />
        </div>

        <div className="space-y-1.5">
          <Label>Website</Label>
          <Input type="url" placeholder="https://yoursite.com" {...register("website")} />
        </div>

        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input placeholder="New York, USA" {...register("location")} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-gold text-background text-sm font-medium rounded-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </form>

      <Separator className="my-8" />

      {/* Danger zone */}
      <div>
        <h2 className="font-medium text-destructive mb-3">Danger Zone</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="px-4 py-2 text-sm text-destructive border border-destructive/30 rounded-sm hover:bg-destructive/10 transition-colors">
              Delete Account
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes your account, all galleries, and photos. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteAccount}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin inline mr-1.5" /> : null}
                Delete My Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
