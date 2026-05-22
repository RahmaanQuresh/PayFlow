import { prisma } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email/resend";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    const dueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ["SENT", "VIEWED", "OVERDUE"] },
        remindersEnabled: true,
        remindersPaused: false,
        nextReminderDate: { lte: now },
      },
      include: {
        client: true,
        user: true,
        reminderSequence: { include: { steps: { orderBy: { sortOrder: "asc" } } } },
      },
    });

    const results: Array<{
      invoiceId: string;
      status: "sent" | "skipped" | "completed" | "error";
      error?: string;
    }> = [];

    for (const invoice of dueInvoices) {
      try {
        const sequence = invoice.reminderSequence;
        if (!sequence || !sequence.steps.length) {
          results.push({ invoiceId: invoice.id, status: "skipped", error: "No reminder sequence" });
          continue;
        }

        const stepIndex = invoice.currentReminderStep;
        if (stepIndex >= sequence.steps.length) {
          results.push({ invoiceId: invoice.id, status: "completed" });
          continue;
        }

        const step = sequence.steps[stepIndex];
        const daysOverdue = Math.floor(
          (now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        const subject = step.subject
          .replace("{invoice_number}", invoice.invoiceNumber)
          .replace("{total}", invoice.total.toString())
          .replace("{due_date}", new Date(invoice.dueDate).toLocaleDateString());

        const body = step.body
          .replace("{client_name}", invoice.client.name)
          .replace("{invoice_number}", invoice.invoiceNumber)
          .replace("{total}", invoice.total.toString())
          .replace("{due_date}", new Date(invoice.dueDate).toLocaleDateString())
          .replace("{portal_url}", `${process.env.NEXT_PUBLIC_APP_URL}/share/${invoice.portalToken}`)
          .replace("{freelancer_name}", invoice.user.name)
          .replace("{days_overdue}", daysOverdue.toString());

        await sendReminderEmail({
          to: invoice.client.email,
          clientName: invoice.client.name,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.total,
          dueDate: invoice.dueDate,
          daysOverdue,
          subject,
          body,
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${invoice.portalToken}`,
          freelancerName: invoice.user.name,
        });

        await prisma.reminderSent.create({
          data: {
            invoiceId: invoice.id,
            stepId: step.id,
            sequenceId: sequence.id,
            stepNumber: stepIndex + 1,
            subject,
            body,
            tone: step.tone,
            wasAiGenerated: step.useAi,
            deliveryStatus: "SENT",
            sentAt: now,
          },
        });

        const nextStepIndex = stepIndex + 1;
        const nextStep = sequence.steps[nextStepIndex];

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            currentReminderStep: nextStepIndex,
            nextReminderDate: nextStep
              ? new Date(now.getTime() + nextStep.daysAfterDue * 24 * 60 * 60 * 1000)
              : null,
            status: "OVERDUE",
          },
        });

        results.push({ invoiceId: invoice.id, status: "sent" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        results.push({ invoiceId: invoice.id, status: "error", error: message });
      }
    }

    return Response.json({ success: true, processed: dueInvoices.length, results });
  } catch (error) {
    console.error("Cron send-reminders error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
