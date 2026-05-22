import { prisma } from "@/lib/db";

export async function createPayment(data: {
  invoiceId: string;
  userId: string;
  clientId: string;
  amount: number;
  method: string;
  stripePaymentIntentId?: string;
  razorpayOrderId?: string;
}) {
  return prisma.payment.create({
    data: {
      ...data,
      method: data.method as never,
    },
  });
}

export async function getPaymentsByUser(userId: string, filters?: {
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      include: {
        invoice: { select: { invoiceNumber: true, id: true } },
        client: { select: { name: true, id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return {
    payments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
