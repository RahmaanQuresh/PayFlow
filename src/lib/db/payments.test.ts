import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    payment: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { createPayment, getPaymentsByUser } from "@/lib/db/payments";

const prismaMock = prisma as unknown as {
  payment: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createPayment", () => {
  it("creates a payment record", async () => {
    const paymentData = {
      invoiceId: "inv-1",
      userId: "user-1",
      clientId: "client-1",
      amount: 500,
      method: "card",
      stripePaymentIntentId: "pi_123",
    };

    prismaMock.payment.create.mockResolvedValue({ id: "pay-1", ...paymentData });

    const result = await createPayment(paymentData);

    expect(result.id).toBe("pay-1");
    expect(prismaMock.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ amount: 500, method: "card" }),
    });
  });
});

describe("getPaymentsByUser", () => {
  it("returns paginated payments", async () => {
    prismaMock.payment.findMany.mockResolvedValue([
      {
        id: "p1",
        invoiceId: "inv-1",
        userId: "user-1",
        clientId: "client-1",
        amount: 100,
        method: "card",
        status: "completed",
        paidAt: new Date(),
        createdAt: new Date(),
        invoice: { invoiceNumber: "INV-2026-0001", id: "inv-1" },
        client: { name: "Acme", id: "client-1" },
      },
    ]);
    prismaMock.payment.count.mockResolvedValue(1);

    const result = await getPaymentsByUser("user-1");

    expect(result.payments).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });
});
