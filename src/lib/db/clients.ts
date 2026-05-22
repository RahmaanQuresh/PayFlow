import { prisma } from "@/lib/db";

export async function getClients(userId: string, filters?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    userId,
    deletedAt: null,
  };

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { company: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return {
    clients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getClient(id: string, userId: string) {
  return prisma.client.findFirst({
    where: { id, userId, deletedAt: null },
    include: {
      invoices: {
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          dueDate: true,
          paidAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function createClient(data: {
  userId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}) {
  return prisma.client.create({
    data: {
      ...data,
      country: data.country || "US",
    },
  });
}

export async function updateClient(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    email: string;
    company: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    notes: string;
  }>
) {
  return prisma.client.updateMany({
    where: { id, userId, deletedAt: null },
    data,
  });
}

export async function deleteClient(id: string, userId: string) {
  const invoiceCount = await prisma.invoice.count({
    where: { clientId: id, status: { not: "CANCELED" } },
  });

  if (invoiceCount > 0) {
    return prisma.client.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  }

  return prisma.client.delete({ where: { id, userId } });
}
