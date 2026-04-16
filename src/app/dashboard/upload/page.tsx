import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UploadClient } from "./UploadClient";

export default async function UploadPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const userGalleries = await db
    .select({ id: galleries.id, title: galleries.title })
    .from(galleries)
    .where(eq(galleries.userId, session.user.id));

  return <UploadClient galleries={userGalleries} />;
}
