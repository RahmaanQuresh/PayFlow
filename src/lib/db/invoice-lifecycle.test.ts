import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    invoice: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    payment: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    client: {
      findFirst: vi.fn(),
    },
    reminderSent: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/helpers", () => ({
  getSessionUserId: vi.fn().mockResolvedValue("user-test-1"),
}));

import { prisma } from "@/lib/db";
import { createInvoice, sendInvoice, markInvoicePaid, cancelInvoice, getInvoices, getInvoice } from "@/lib/db/invoices";
import { createPayment } from "@/lib/db/payments";

const prismaMock = prisma as unknown as {
  invoice: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    aggregate: ReturnType<typeof vi.fn>;
  };
  payment: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  client: {
    findFirst: ReturnType<typeof vi.fn>;
  };
  reminderSent: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

const mockInvoice = {
  id: "inv-1",
  userId: "user-test-1",
  clientId: "client-1",
  invoiceNumber: "INV-2026-0001",
  title: "Logo Design",
  description: "Full logo design package",
  status: "DRAFT",
  issueDate: new Date(),
  dueDate: new Date(Date.now() + 30 * 86400000),
  paymentTerms: "NET30",
  currency: "USD",
  subtotal: 500,
  discountType: null,
  discountValue: 0,
  discountAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  total: 500,
  paidAmount: 0,
  notes: null,
  currentReminderStep: 0,
  nextReminderDate: null,
  remindersEnabled: true,
  remindersPaused: false,
  portalToken: "abc123",
  portalTokenExpiresAt: null,
  sentAt: null,
  viewedAt: null,
  paidAt: null,
  canceledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  client: { id: "client-1", name: "Acme Corp", email: "acme@test.com" },
  lineItems: [{ id: "li-1", invoiceId: "inv-1", description: "Logo design", quantity: 1, rate: 500, amount: 500, taxable: true, sortOrder: 0 }],
  payments: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Invoice Lifecycle (E2E smoke test)", () => {
  it("1. Creates an invoice", async () => {
    prismaMock.invoice.findFirst.mockResolvedValue(null);
    prismaMock.invoice.create.mockResolvedValue(mockInvoice);

    const invoice = await createInvoice({
      userId: "user-test-1",
      clientId: "client-1",
      title: "Logo Design",
      dueDate: new Date(Date.now() + 30 * 86400000),
      lineItems: [{ description: "Logo design", quantity: 1, rate: 500, amount: 500 }],
    });

    expect(invoice.id).toBe("inv-1");
    expect(invoice.status).toBe("DRAFT");
    expect(invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(invoice.total).toBe(500);
  });

  it("2. Sends an invoice (DRAFT → SENT)", async () => {
    const sentInvoice = { ...mockInvoice, status: "SENT", sentAt: new Date() };
    prismaMock.invoice.update.mockResolvedValue(sentInvoice);

    const result = await sendInvoice("inv-1", "user-test-1");

    expect(result.status).toBe("SENT");
    expect(result.portalToken).toBeDefined();
    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inv-1", userId: "user-test-1" },
        data: expect.objectContaining({ status: "SENT", portalToken: expect.any(String) }),
      })
    );
  });

  it("3. Marks invoice as paid (SENT → PAID)", async () => {
    const paidInvoice = { ...mockInvoice, status: "PAID", paidAmount: 500, paidAt: new Date() };
    prismaMock.invoice.findUnique.mockResolvedValue(mockInvoice);
    prismaMock.invoice.update.mockResolvedValue(paidInvoice);
    prismaMock.payment.create.mockResolvedValue({ id: "pay-1", amount: 500 });

    const payment = await createPayment({
      invoiceId: "inv-1",
      userId: "user-test-1",
      clientId: "client-1",
      amount: 500,
      method: "CARD",
      stripePaymentIntentId: "pi_test_123",
    });
    expect(payment).toBeDefined();

    const result = await markInvoicePaid("inv-1", 500);
    expect(result.status).toBe("PAID");
    expect(result.paidAmount).toBe(500);
    expect(result.paidAt).toBeDefined();
  });

  it("4. Cancels an invoice (DRAFT → CANCELED)", async () => {
    const canceledInvoice = { ...mockInvoice, status: "CANCELED", canceledAt: new Date(), remindersEnabled: false };
    prismaMock.invoice.update.mockResolvedValue(canceledInvoice);

    const result = await cancelInvoice("inv-1", "user-test-1");

    expect(result.status).toBe("CANCELED");
    expect(result.canceledAt).toBeDefined();
  });

  it("5. Partial payment (DRAFT → PARTIALLY_PAID)", async () => {
    prismaMock.invoice.findUnique.mockResolvedValue(mockInvoice);
    const partial = { ...mockInvoice, status: "PARTIALLY_PAID", paidAmount: 200 };
    prismaMock.invoice.update.mockResolvedValue(partial);

    const result = await markInvoicePaid("inv-1", 200);
    expect(result.status).toBe("PARTIALLY_PAID");
    expect(result.paidAmount).toBe(200);
  });

  it("6. Full lifecycle: list invoices returns correct data", async () => {
    const invoices = [
      { ...mockInvoice, id: "1", status: "PAID" },
      { ...mockInvoice, id: "2", status: "OVERDUE" },
      { ...mockInvoice, id: "3", status: "DRAFT" },
    ];
    prismaMock.invoice.findMany.mockResolvedValue(invoices);
    prismaMock.invoice.count.mockResolvedValue(3);
    prismaMock.invoice.aggregate.mockResolvedValue({
      _sum: { total: 1500, paidAmount: 500 },
    });

    const result = await getInvoices("user-test-1");

    expect(result.invoices).toHaveLength(3);
    expect(result.pagination.total).toBe(3);
    expect(result.summary.totalOutstanding).toBe(1000);
  });

  it("7. Gets single invoice with details", async () => {
    const fullInvoice = { ...mockInvoice, remindersSent: [] };
    prismaMock.invoice.findFirst.mockResolvedValue(fullInvoice);

    const result = await getInvoice("inv-1", "user-test-1");

    expect(result).toBeDefined();
    expect(result?.client?.name).toBe("Acme Corp");
    expect(result?.lineItems).toHaveLength(1);
  });

  it("8. Filters invoices by status", async () => {
    prismaMock.invoice.findMany.mockResolvedValue([]);
    prismaMock.invoice.count.mockResolvedValue(0);
    prismaMock.invoice.aggregate.mockResolvedValue({ _sum: { total: 0, paidAmount: 0 } });

    await getInvoices("user-test-1", { status: "OVERDUE" });

    expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "OVERDUE" }),
      })
    );
  });
});
