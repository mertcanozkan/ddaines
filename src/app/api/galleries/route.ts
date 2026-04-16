import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { auth } from "@/lib/auth";
import { gallerySchema } from "@/lib/validations";
import { uniqueSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId");

  const query = db
    .select()
    .from(galleries)
    .orderBy(desc(galleries.createdAt))
    .limit(50);

  const results = userId
    ? await db.select().from(galleries).where(eq(galleries.userId, userId)).orderBy(desc(galleries.createdAt))
    : await query;

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = gallerySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const slug = uniqueSlug(parsed.data.title);

    const [gallery] = await db
      .insert(galleries)
      .values({
        userId: session.user.id,
        title: parsed.data.title,
        slug,
        description: parsed.data.description,
        category: parsed.data.category,
        coverImageUrl: parsed.data.coverImageUrl,
        visibility: parsed.data.visibility,
      })
      .returning();

    return NextResponse.json(gallery, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
