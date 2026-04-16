import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminUsersClient } from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return <AdminUsersClient users={allUsers} />;
}
