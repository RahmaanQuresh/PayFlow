import { generateToneAdaptedReminder } from "@/lib/ai/generate-tone";
import { getSessionUserId } from "@/lib/auth/helpers";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const rl = rateLimit(`ai-tone:${userId}`, 20, 60 * 1000);
  if (rl.limited) {
    return Response.json({ error: { code: "RATE_LIMITED", message: "Too many requests" } }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { subject, body: emailBody, tone, invoiceId } = body;

    if (!subject || !emailBody || !tone) {
      return Response.json(
        { error: { code: "VALIDATION_ERROR", message: "subject, body, and tone are required" } },
        { status: 400 }
      );
    }

    const toneSamples = await prisma.toneSample.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    let context = {
      clientName: "",
      invoiceNumber: "INV-0001",
      amount: 0,
      daysOverdue: 0,
      freelancerName: "",
    };

    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId, userId },
        include: { client: true, user: true },
      });
      if (invoice) {
        const daysOverdue = Math.floor(
          (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        context = {
          clientName: invoice.client.name,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.total,
          daysOverdue: Math.max(0, daysOverdue),
          freelancerName: invoice.user.name,
        };
      }
    }

    const result = await generateToneAdaptedReminder({
      originalSubject: subject,
      originalBody: emailBody,
      tone,
      toneSamples: toneSamples.map((s) => ({ content: s.content, context: s.context })),
      context,
    });

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("POST /api/ai/generate-tone error:", error);
    return Response.json({ error: { code: "INTERNAL_ERROR", message: "Failed to generate tone" } }, { status: 500 });
  }
}
