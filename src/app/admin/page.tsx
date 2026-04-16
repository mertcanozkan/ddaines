import { db } from "@/db";
import { users, galleries, photos } from "@/db/schema";
import { count } from "drizzle-orm";
import { AdminOverviewClient } from "./AdminOverviewClient";

export default async function AdminPage() {
  const [userCount, galleryCount, photoCount] = await Promise.all([
    db.select({ count: count() }).from(users).then((r) => r[0].count),
    db.select({ count: count() }).from(galleries).then((r) => r[0].count),
    db.select({ count: count() }).from(photos).then((r) => r[0].count),
  ]);

  return <AdminOverviewClient stats={{ users: userCount, galleries: galleryCount, photos: photoCount }} />;
}
