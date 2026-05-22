import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email/resend";
import { cron } from "inngest";

export const sendRemindersFn = inngest.createFunction(
  {
    id: "send-reminders",
    name: "Send Payment Reminders",
    triggers: [cron("0 8 * * *")],
  },
  async ({ step }) => {
    const now = new Date();

    const dueInvoices = await step.run("find-due-invoices", async () => {
      return prisma.invoice.findMany({
        where: {
          status: { in: ["sent", "viewed", "overdue"] },
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
    });

    const results: Array<{ invoiceId: string; status: string; error?: string }> = [];

    for (const invoice of dueInvoices) {
      const result = await step.run(`process-invoice-${invoice.id}`, async () => {
        try {
          const sequence = invoice.reminderSequence;
          if (!sequence || !sequence.steps.length) {
            return { invoiceId: invoice.id, status: "skipped", error: "No reminder sequence" };
          }

          const stepIndex = invoice.currentReminderStep;
          if (stepIndex >= sequence.steps.length) {
            return { invoiceId: invoice.id, status: "completed" };
          }

          const reminderStep = sequence.steps[stepIndex];
          const daysOverdue = Math.floor(
            (now.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
          );

          const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${invoice.portalToken}`;

          await sendReminderEmail({
            to: invoice.client.email,
            clientName: invoice.client.name,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.total,
            dueDate: new Date(invoice.dueDate),
            daysOverdue,
            subject: reminderStep.subject,
            body: reminderStep.body,
            portalUrl,
            freelancerName: invoice.user.name || invoice.user.businessName || "PayFlow",
          });

          const nextStep = stepIndex + 1;
          const nextDays = nextStep < sequence.steps.length
            ? sequence.steps[nextStep].daysAfterDue
            : null;

          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              currentReminderStep: nextStep,
              nextReminderDate: nextDays
                ? new Date(new Date(invoice.dueDate).getTime() + nextDays * 24 * 60 * 60 * 1000)
                : null,
            },
          });

          await prisma.reminderSent.create({
            data: {
              invoiceId: invoice.id,
              stepId: reminderStep.id,
              sequenceId: sequence.id,
              stepNumber: stepIndex + 1,
              subject: reminderStep.subject,
              body: reminderStep.body,
              tone: reminderStep.tone,
              deliveryStatus: "SENT",
            },
          });

          return { invoiceId: invoice.id, status: "sent" };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return { invoiceId: invoice.id, status: "error", error: message };
        }
      });

      results.push(result);
    }

    return { processed: dueInvoices.length, results };
  }
);
