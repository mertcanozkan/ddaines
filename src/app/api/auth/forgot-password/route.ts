import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    // Always respond OK to prevent email enumeration
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // In production, send email here. Log token for dev.
    console.log(`[dev] Password reset token for ${email}: ${token}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
