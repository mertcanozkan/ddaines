import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username too long")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const gallerySchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(2000).optional(),
  category: z.string().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
});

export const photoUploadSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
  tags: z.string().optional(),
  galleryId: z.string().uuid("Select a valid gallery"),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(255),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(255).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
