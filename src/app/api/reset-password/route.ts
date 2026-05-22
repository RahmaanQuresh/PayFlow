import { validateResetToken, consumeResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/utils/rate-limit";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`reset-password:${ip}`, 5, 15 * 60 * 1000);
    if (rl.limited) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { token, password } = await request.json();

    if (!token || !password || typeof password !== "string") {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const email = await validateResetToken(token);
    if (!email) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await consumeResetToken(token);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("POST /api/reset-password error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
