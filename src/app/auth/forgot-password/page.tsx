"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Camera, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setSent(true);
    else setError("Something went wrong. Please try again.");
  }

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
          <h1 className="font-display text-3xl font-light italic mt-4">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1">We&apos;ll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-medium">Check your inbox</p>
            <p className="text-sm text-muted-foreground">
              If that email is registered, you&apos;ll receive a reset link shortly.
            </p>
            <Link href="/auth/login" className="inline-block text-gold hover:underline text-sm">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-destructive/10 text-destructive text-sm rounded-sm">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="bg-muted/30" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gold text-background font-medium rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Reset Link
            </button>
            <p className="text-center text-sm">
              <Link href="/auth/login" className="text-muted-foreground hover:text-gold transition-colors">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
