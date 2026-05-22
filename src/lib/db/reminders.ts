import { prisma } from "@/lib/db";

export async function getSequences(userId: string) {
  return prisma.reminderSequence.findMany({
    where: { userId, isActive: true },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDefaultSequence(userId: string) {
  return prisma.reminderSequence.findFirst({
    where: { userId, isDefault: true, isActive: true },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createSequence(
  userId: string,
  data: {
    name: string;
    description?: string;
    isDefault?: boolean;
    steps: Array<{
      daysAfterDue: number;
      tone: string;
      subject: string;
      body: string;
      useAi?: boolean;
    }>;
  }
) {
  return prisma.reminderSequence.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      isDefault: data.isDefault || false,
      steps: {
        create: data.steps.map((step, i) => ({
          daysAfterDue: step.daysAfterDue,
          tone: step.tone,
          subject: step.subject,
          body: step.body,
          useAi: step.useAi || false,
          sortOrder: i,
        })),
      },
    },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getSequence(id: string, userId: string) {
  return prisma.reminderSequence.findFirst({
    where: { id, userId, isActive: true },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function updateSequence(
  id: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
    isDefault?: boolean;
    steps?: Array<{
      daysAfterDue: number;
      tone: string;
      subject: string;
      body: string;
      useAi?: boolean;
    }>;
  }
) {
  if (data.steps) {
    await prisma.reminderStep.deleteMany({ where: { sequenceId: id } });
    await prisma.reminderStep.createMany({
      data: data.steps.map((step, i) => ({
        sequenceId: id,
        daysAfterDue: step.daysAfterDue,
        tone: step.tone,
        subject: step.subject,
        body: step.body,
        useAi: step.useAi || false,
        sortOrder: i,
      })),
    });
  }

  return prisma.reminderSequence.update({
    where: { id, userId },
    data: {
      name: data.name,
      description: data.description,
      isDefault: data.isDefault,
    },
    include: { steps: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function deleteSequence(id: string, userId: string) {
  return prisma.reminderSequence.update({
    where: { id, userId },
    data: { isActive: false },
  });
}

export async function createDefaultSequenceForUser(userId: string) {
  const existing = await prisma.reminderSequence.findFirst({
    where: { userId, isDefault: true },
  });

  if (existing) return existing;

  return createSequence(userId, {
    name: "Default Sequence",
    description: "Standard 3-step reminder sequence",
    isDefault: true,
    steps: [
      {
        daysAfterDue: 7,
        tone: "FRIENDLY",
        subject: "Friendly Reminder: Invoice #{invoice_number}",
        body: "Hi {client_name},\n\nJust a friendly reminder that invoice #{invoice_number} for ${total} was due on {due_date}. You can view and pay it here: {portal_url}\n\nBest regards,\n{freelancer_name}",
      },
      {
        daysAfterDue: 14,
        tone: "FORMAL",
        subject: "Payment Reminder: Invoice #{invoice_number}",
        body: "Dear {client_name},\n\nThis is a formal reminder that invoice #{invoice_number} for ${total} is now 14 days overdue. Please arrange payment at your earliest convenience: {portal_url}\n\nSincerely,\n{freelancer_name}",
      },
      {
        daysAfterDue: 30,
        tone: "DIRECT",
        subject: "Urgent: Invoice #{invoice_number} Overdue",
        body: "Dear {client_name},\n\nInvoice #{invoice_number} for ${total} is now 30 days overdue. Immediate payment is required. Please contact us if you have any questions.\n\nPay now: {portal_url}\n\n{freelancer_name}",
      },
    ],
  });
}
