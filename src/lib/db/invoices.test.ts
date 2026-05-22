import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    client: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), count: vi.fn() },
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
  },
}));

import { prisma } from "@/lib/db";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  sendInvoice,
  cancelInvoice,
  markInvoicePaid,
} from "@/lib/db/invoices";

const prismaMock = prisma as unknown as {
  client: { findFirst: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; updateMany: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn> };
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
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getInvoices", () => {
  it("returns paginated invoices with summary", async () => {
    prismaMock.invoice.findMany.mockResolvedValue([]);
    prismaMock.invoice.count.mockResolvedValue(0);
    prismaMock.invoice.aggregate.mockResolvedValue({
      _sum: { total: 5000, paidAmount: 2000 },
    });

    const result = await getInvoices("user-1");

    expect(result.summary.totalOutstanding).toBe(3000);
    expect(result.pagination.page).toBe(1);
  });

  it("filters by status", async () => {
    prismaMock.invoice.findMany.mockResolvedValue([]);
    prismaMock.invoice.count.mockResolvedValue(0);
    prismaMock.invoice.aggregate.mockResolvedValue({ _sum: {} });

    await getInvoices("user-1", { status: "OVERDUE" });

    expect(prismaMock.invoice.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1", status: "OVERDUE" }),
      })
    );
  });
});

describe("createInvoice", () => {
  it("computes total with percentage discount", async () => {
    prismaMock.invoice.findFirst.mockResolvedValue(null);
    prismaMock.invoice.create.mockResolvedValue({ id: "inv-1" });

    await createInvoice({
      userId: "user-1",
      clientId: "client-1",
      title: "Test Invoice",
      dueDate: new Date("2026-06-01"),
      lineItems: [
        { description: "Item 1", quantity: 1, rate: 100, amount: 100, taxable: true },
        { description: "Item 2", quantity: 2, rate: 50, amount: 100, taxable: true },
      ],
      discountType: "PERCENTAGE",
      discountValue: 10,
      taxRate: 0,
    });

    expect(prismaMock.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 200,
          discountAmount: 20,
          total: 180,
        }),
      })
    );
  });

  it("computes total with fixed discount", async () => {
    prismaMock.invoice.findFirst.mockResolvedValue(null);
    prismaMock.invoice.create.mockResolvedValue({ id: "inv-2" });

    await createInvoice({
      userId: "user-1",
      clientId: "client-1",
      title: "Test Invoice",
      dueDate: new Date("2026-06-01"),
      lineItems: [{ description: "Item", quantity: 1, rate: 1000, amount: 1000, taxable: false }],
      discountType: "FIXED",
      discountValue: 50,
      taxRate: 10,
    });

    expect(prismaMock.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 1000,
          discountAmount: 50,
          taxAmount: 95,
          total: 1045,
        }),
      })
    );
  });

  it("generates incremental invoice number", async () => {
    prismaMock.invoice.findFirst.mockResolvedValue({
      invoiceNumber: "INV-2026-0005",
    });
    prismaMock.invoice.create.mockResolvedValue({ id: "inv-3" });

    await createInvoice({
      userId: "user-1",
      clientId: "client-1",
      title: "Invoice",
      dueDate: new Date(),
      lineItems: [],
    });

    expect(prismaMock.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          invoiceNumber: "INV-2026-0006",
        }),
      })
    );
  });
});

describe("sendInvoice", () => {
  it("sets status to SENT with portal token", async () => {
    prismaMock.invoice.update.mockResolvedValue({ id: "inv-1", status: "SENT", portalToken: "abc123" });

    await sendInvoice("inv-1", "user-1");

    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inv-1", userId: "user-1" },
        data: expect.objectContaining({
          status: "SENT",
          portalToken: expect.any(String),
          sentAt: expect.any(Date),
        }),
      })
    );
  });
});

describe("cancelInvoice", () => {
  it("cancels and disables reminders", async () => {
    prismaMock.invoice.update.mockResolvedValue({ id: "inv-1", status: "CANCELED" });

    await cancelInvoice("inv-1", "user-1");

    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "CANCELED",
          remindersEnabled: false,
        }),
      })
    );
  });
});

describe("markInvoicePaid", () => {
  it("marks fully paid when amount covers total", async () => {
    prismaMock.invoice.findUnique.mockResolvedValue({ id: "inv-1", total: 500, paidAmount: 0 });
    prismaMock.invoice.update.mockResolvedValue({ id: "inv-1" });

    await markInvoicePaid("inv-1", 500);

    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PAID",
          paidAmount: 500,
          remindersEnabled: false,
        }),
      })
    );
  });

  it("marks partially paid when amount is less than total", async () => {
    prismaMock.invoice.findUnique.mockResolvedValue({ id: "inv-1", total: 1000, paidAmount: 0 });
    prismaMock.invoice.update.mockResolvedValue({ id: "inv-1" });

    await markInvoicePaid("inv-1", 300);

    expect(prismaMock.invoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PARTIALLY_PAID",
          paidAmount: 300,
        }),
      })
    );
  });

  it("throws when invoice not found", async () => {
    prismaMock.invoice.findUnique.mockResolvedValue(null);
    await expect(markInvoicePaid("bad-id", 100)).rejects.toThrow("Invoice not found");
  });
});
