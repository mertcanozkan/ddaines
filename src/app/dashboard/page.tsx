import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { galleries, photos, likes } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { DashboardOverview } from "./DashboardOverview";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const [galleryCount, photoCount, likeCount] = await Promise.all([
    db.select({ count: count() }).from(galleries).where(eq(galleries.userId, session.user.id)).then((r) => r[0].count),
    db.select({ count: count() }).from(photos).where(eq(photos.userId, session.user.id)).then((r) => r[0].count),
    db.select({ count: count() }).from(likes).where(eq(likes.userId, session.user.id)).then((r) => r[0].count),
  ]);

  return (
    <DashboardOverview
      user={session.user}
      stats={{ galleries: galleryCount, photos: photoCount, likes: likeCount }}
    />
  );
}
