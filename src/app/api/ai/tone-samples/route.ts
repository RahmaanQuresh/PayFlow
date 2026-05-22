import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/helpers";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { samples } = body;

    if (!samples || !Array.isArray(samples)) {
      return Response.json({ error: { code: "VALIDATION_ERROR", message: "samples array is required" } }, { status: 400 });
    }

    await prisma.toneSample.deleteMany({ where: { userId } });

    if (samples.length > 0) {
      await prisma.toneSample.createMany({
        data: samples.map((s: { content: string; context: string }) => ({
          userId,
          content: s.content,
          context: s.context || "General",
        })),
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/ai/tone-samples error:", error);
    return Response.json({ error: { code: "INTERNAL_ERROR", message: "Failed to save tone samples" } }, { status: 500 });
  }
}
