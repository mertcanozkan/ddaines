import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      galleryId, title, description, imageUrl, thumbnailUrl,
      cloudinaryPublicId, width, height, fileSize, exifData, tags,
    } = body;

    if (!galleryId || !imageUrl) {
      return NextResponse.json({ error: "galleryId and imageUrl required" }, { status: 400 });
    }

    const [photo] = await db
      .insert(photos)
      .values({
        galleryId,
        userId: session.user.id,
        title,
        description,
        imageUrl,
        thumbnailUrl,
        cloudinaryPublicId,
        width,
        height,
        fileSize,
        exifData,
        tags: tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      })
      .returning();

    return NextResponse.json(photo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
