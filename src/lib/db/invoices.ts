import { prisma } from "@/lib/db";
import type { Invoice } from "@/types";

export async function getInvoices(userId: string, filters?: {
  status?: string;
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { userId };

  if (filters?.status) where.status = filters.status;
  if (filters?.clientId) where.clientId = filters.clientId;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { invoiceNumber: { contains: filters.search, mode: "insensitive" } },
      { client: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
      },
      orderBy: { [filters?.sortBy || "createdAt"]: filters?.sortOrder || "desc" },
      skip,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);

  const summary = await prisma.invoice.aggregate({
    _sum: {
      total: true,
      paidAmount: true,
    },
    where: { userId },
  });

  return {
    invoices,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    summary: {
      totalOutstanding: Number(summary._sum.total || 0) - Number(summary._sum.paidAmount || 0),
    },
  };
}

export async function getInvoice(id: string, userId: string) {
  return prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      client: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
      remindersSent: { orderBy: { sentAt: "desc" } },
    },
  });
}

export async function getInvoiceByPortalToken(token: string) {
  return prisma.invoice.findFirst({
    where: { portalToken: token },
    include: {
      client: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
}

export async function createInvoice(data: {
  userId: string;
  clientId: string;
  title: string;
  dueDate: Date;
  description?: string;
  paymentTerms?: string;
  currency?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxable?: boolean;
  }>;
  discountType?: string;
  discountValue?: number;
  taxRate?: number;
  notes?: string;
  reminderSequenceId?: string;
}) {
  const lineItems = data.lineItems.map((item, index) => ({
    ...item,
    sortOrder: index,
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  let discountAmount = 0;

  if (data.discountType === "FIXED" && data.discountValue) {
    discountAmount = data.discountValue;
  } else if (data.discountType === "PERCENTAGE" && data.discountValue) {
    discountAmount = (subtotal * data.discountValue) / 100;
  }

  const afterDiscount = subtotal - discountAmount;
  const taxRate = data.taxRate || 0;
  const taxAmount = (afterDiscount * taxRate) / 100;
  const total = afterDiscount + taxAmount;

  const invoiceNumber = await generateInvoiceNumber(data.userId);

  return prisma.invoice.create({
    data: {
      userId: data.userId,
      clientId: data.clientId,
      invoiceNumber,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      paymentTerms: data.paymentTerms || "NET30",
      currency: data.currency || "USD",
      subtotal,
      discountType: data.discountType || null,
      discountValue: data.discountValue || 0,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      notes: data.notes,
      reminderSequenceId: data.reminderSequenceId,
      lineItems: { create: lineItems },
    },
    include: {
      client: { select: { id: true, name: true, email: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function updateInvoice(
  id: string,
  userId: string,
  data: {
    title?: string;
    dueDate?: Date;
    status?: string;
  }
) {
  return prisma.invoice.update({
    where: { id, userId },
    data,
    include: {
      client: { select: { id: true, name: true, email: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function sendInvoice(id: string, userId: string) {
  const portalToken = generatePortalToken();

  return prisma.invoice.update({
    where: { id, userId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      portalToken,
      portalTokenExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function cancelInvoice(id: string, userId: string) {
  return prisma.invoice.update({
    where: { id, userId },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
      remindersEnabled: false,
    },
  });
}

export async function markInvoiceViewed(token: string) {
  return prisma.invoice.updateMany({
    where: { portalToken: token, status: "SENT" },
    data: { status: "VIEWED", viewedAt: new Date() },
  });
}

export async function markInvoicePaid(id: string, amount: number) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) throw new Error("Invoice not found");

  const newPaidAmount = Number(invoice.paidAmount) + amount;
  const newStatus = newPaidAmount >= Number(invoice.total) ? "PAID" : "PARTIALLY_PAID";

  return prisma.invoice.update({
    where: { id },
    data: {
      status: newStatus,
      paidAmount: newPaidAmount,
      paidAt: newStatus === "PAID" ? new Date() : undefined,
      remindersEnabled: newStatus === "PAID" ? false : undefined,
    },
  });
}

async function generateInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      userId,
      invoiceNumber: { startsWith: `INV-${year}-` },
    },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  const lastNumber = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.split("-")[2]!, 10)
    : 0;

  return `INV-${year}-${String(lastNumber + 1).padStart(4, "0")}`;
}

function generatePortalToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}
