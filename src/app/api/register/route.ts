import { prisma } from "@/lib/db";
import { successResponse, apiError } from "@/lib/utils/errors";
import { validateCsrfToken } from "@/lib/auth/csrf";
import { rateLimit } from "@/lib/utils/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`register:${ip}`, 5, 60 * 1000);
    if (rl.limited) {
      return apiError("RATE_LIMITED", "Too many attempts. Please try again later.", 429);
    }

    const validCsrf = await validateCsrfToken(request);
    if (!validCsrf) {
      return apiError("FORBIDDEN", "Invalid CSRF token", 403);
    }

    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return apiError("CONFLICT", "An account with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    return successResponse({ userId: user.id }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_ERROR", error.issues[0].message, 400);
    }
    console.error("POST /api/register error:", error);
    return apiError("INTERNAL_ERROR", "Registration failed", 500);
  }
}
