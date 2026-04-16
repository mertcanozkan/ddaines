import "dotenv/config";
import { db } from "../src/db";
import { users, galleries, photos } from "../src/db/schema";
import bcrypt from "bcryptjs";
import { uniqueSlug } from "../src/lib/utils";

async function seed() {
  console.log("🌱 Seeding database…");

  const passwordHash = await bcrypt.hash("Admin123!", 12);

  const [admin] = await db
    .insert(users)
    .values({
      name: "DAINES Admin",
      email: "admin@dainesgallery.com",
      username: "admin",
      passwordHash,
      role: "admin",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  if (!admin) {
    console.log("Admin user already exists, skipping…");
    return;
  }

  console.log("✅ Admin user created");

  const galleryData = [
    {
      title: "Golden Landscapes",
      category: "Landscape",
      description: "Breathtaking vistas and natural wonders from around the globe.",
    },
    {
      title: "Intimate Portraits",
      category: "Portrait",
      description: "Candid moments and character studies captured with empathy.",
    },
    {
      title: "Urban Architecture",
      category: "Architecture",
      description: "The geometry, texture, and light of built environments.",
    },
  ];

  for (const gData of galleryData) {
    const [gallery] = await db
      .insert(galleries)
      .values({
        userId: admin.id,
        title: gData.title,
        slug: uniqueSlug(gData.title),
        description: gData.description,
        category: gData.category,
        visibility: "public",
        isFeatured: true,
        coverImageUrl: `https://picsum.photos/seed/${encodeURIComponent(gData.title)}/1200/800`,
      })
      .returning();

    const photoInserts = Array.from({ length: 10 }, (_, i) => ({
      galleryId: gallery.id,
      userId: admin.id,
      title: `${gData.category} #${i + 1}`,
      imageUrl: `https://picsum.photos/seed/${gData.category}-${i}/800/1200`,
      thumbnailUrl: `https://picsum.photos/seed/${gData.category}-${i}/400/600`,
      width: 800,
      height: 1200,
    }));

    await db.insert(photos).values(photoInserts);
    console.log(`✅ Gallery "${gData.title}" seeded with 10 photos`);
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
