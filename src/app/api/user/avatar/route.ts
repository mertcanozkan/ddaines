import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { avatarUrl } = await request.json();
  if (!avatarUrl || typeof avatarUrl !== "string") {
    return NextResponse.json({ error: "Invalid avatarUrl" }, { status: 400 });
  }

  await db.update(users).set({ avatarUrl }).where(eq(users.id, session.user.id));

  return NextResponse.json({ avatarUrl });
}
