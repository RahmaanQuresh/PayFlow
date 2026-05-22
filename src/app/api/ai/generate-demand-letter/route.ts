import { generateLegalDemandLetter } from "@/lib/ai/generate-tone";
import { getSessionUserId } from "@/lib/auth/helpers";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const rl = rateLimit(`ai-demand:${userId}`, 10, 60 * 1000);
  if (rl.limited) {
    return Response.json({ error: { code: "RATE_LIMITED", message: "Too many requests" } }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = await generateLegalDemandLetter(body);
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/ai/generate-demand-letter error:", error);
    return Response.json({ error: { code: "INTERNAL_ERROR", message: "Failed to generate demand letter" } }, { status: 500 });
  }
}
