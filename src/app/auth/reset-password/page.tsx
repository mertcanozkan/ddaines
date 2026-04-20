"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    setError(null);
    if (!token) {
      setError("Invalid reset link.");
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      const json = await res.json();
      setError(json.error ?? "Something went wrong. The link may have expired.");
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive">Invalid or missing reset token.</p>
        <Link href="/auth/forgot-password" className="text-gold hover:underline text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center space-y-4">
      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
      <p className="font-medium">Password updated!</p>
      <p className="text-sm text-muted-foreground">Redirecting you to sign in…</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-sm">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" className="bg-muted/30" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" className="bg-muted/30" {...register("confirmPassword")} />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-gold text-background font-medium rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Set New Password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Camera className="h-6 w-6 text-gold" />
            <span className="font-display text-2xl tracking-widest uppercase">
              DAINES<span className="text-gold">·</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-light italic mt-4">New password</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a strong password</p>
        </div>
        <Suspense fallback={<div className="h-40 animate-pulse bg-muted rounded-sm" />}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
