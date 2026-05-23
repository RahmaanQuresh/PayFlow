import { login } from "@/auth";
import { validateCsrfToken } from "@/lib/auth/csrf";
import { rateLimit } from "@/lib/utils/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const rl = rateLimit(`login:${ip}`, 5, 60 * 1000);
  if (rl.limited) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const validCsrf = await validateCsrfToken(request);
  if (!validCsrf) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const { email, password } = await request.json();
  const result = await login(email, password);

  if (!result.ok) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
