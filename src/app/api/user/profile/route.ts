import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, username, bio, website, location } = parsed.data;

  const existingUsername = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existingUsername.length > 0 && existingUsername[0].id !== session.user.id) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  await db
    .update(users)
    .set({ name, username, bio, website: website || null, location: location || null })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({ success: true });
}
