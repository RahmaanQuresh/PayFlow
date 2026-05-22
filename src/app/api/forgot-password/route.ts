import { createPasswordResetToken, sendResetEmail } from "@/lib/auth/password-reset";
import { rateLimit } from "@/lib/utils/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000);
    if (rl.limited) {
      return NextResponse.json(
        { message: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const token = await createPasswordResetToken(email);
    if (token) {
      await sendResetEmail(email, token);
    }

    return NextResponse.json({
      message: "If an account with that email exists, we've sent a reset link.",
    });
  } catch (error) {
    console.error("POST /api/forgot-password error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
