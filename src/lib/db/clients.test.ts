import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    client: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
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
  },
}));

import { prisma } from "@/lib/db";
import { getClients, getClient, createClient, updateClient, deleteClient } from "@/lib/db/clients";

const prismaMock = prisma as unknown as {
  client: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
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
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getClients", () => {
  it("returns paginated clients for a user", async () => {
    const mockClients = [
      { id: "1", name: "Acme Corp", email: "acme@test.com", company: null, phone: null, addressLine1: null, addressLine2: null, city: null, state: null, postalCode: null, country: "US", notes: null, totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0, invoiceCount: 0, lastInvoiceDate: null, deletedAt: null, createdAt: new Date(), updatedAt: new Date(), userId: "user-1" },
    ];

    prismaMock.client.findMany.mockResolvedValue(mockClients);
    prismaMock.client.count.mockResolvedValue(1);

    const result = await getClients("user-1");

    expect(result.clients).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(result.pagination.page).toBe(1);
  });

  it("applies search filter", async () => {
    prismaMock.client.findMany.mockResolvedValue([]);
    prismaMock.client.count.mockResolvedValue(0);

    await getClients("user-1", { search: "Acme" });

    expect(prismaMock.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: "user-1",
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: "Acme" }) }),
          ]),
        }),
      })
    );
  });

  it("handles pagination params", async () => {
    prismaMock.client.findMany.mockResolvedValue([]);
    prismaMock.client.count.mockResolvedValue(50);

    const result = await getClients("user-1", { page: 3, limit: 10 });

    expect(prismaMock.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 })
    );
    expect(result.pagination.totalPages).toBe(5);
  });
});

describe("getClient", () => {
  it("returns a single client with recent invoices", async () => {
    const mockClient = { id: "c1", userId: "user-1", name: "Acme", email: "a@t.com", invoices: [] };
    prismaMock.client.findFirst.mockResolvedValue(mockClient);

    const result = await getClient("c1", "user-1");

    expect(result).toEqual(mockClient);
    expect(prismaMock.client.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1", userId: "user-1", deletedAt: null },
        include: expect.objectContaining({ invoices: expect.any(Object) }),
      })
    );
  });

  it("returns null for non-existent client", async () => {
    prismaMock.client.findFirst.mockResolvedValue(null);
    const result = await getClient("none", "user-1");
    expect(result).toBeNull();
  });
});

describe("createClient", () => {
  it("creates a client with provided data", async () => {
    const data = { userId: "user-1", name: "New Corp", email: "new@corp.com", country: "CA" };
    const mockCreated = { id: "new", ...data, company: null, phone: null };
    prismaMock.client.create.mockResolvedValue(mockCreated);

    const result = await createClient(data);

    expect(result).toEqual(mockCreated);
    expect(prismaMock.client.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: "New Corp", country: "CA" }) })
    );
  });

  it("defaults country to US when not provided", async () => {
    prismaMock.client.create.mockResolvedValue({ id: "x" });
    await createClient({ userId: "u1", name: "T", email: "t@t.com" });
    expect(prismaMock.client.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ country: "US" }) })
    );
  });
});

describe("updateClient", () => {
  it("updates only provided fields", async () => {
    prismaMock.client.updateMany.mockResolvedValue({ count: 1 });

    await updateClient("c1", "user-1", { name: "Updated Name" });

    expect(prismaMock.client.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1", userId: "user-1", deletedAt: null },
        data: { name: "Updated Name" },
      })
    );
  });
});

describe("deleteClient", () => {
  it("soft-deletes client with active invoices", async () => {
    prismaMock.invoice.count.mockResolvedValue(3);
    prismaMock.client.update.mockResolvedValue({ id: "c1", deletedAt: new Date() });

    await deleteClient("c1", "user-1");

    expect(prismaMock.client.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "c1", userId: "user-1" },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it("hard-deletes client with no active invoices", async () => {
    prismaMock.invoice.count.mockResolvedValue(0);
    prismaMock.client.delete.mockResolvedValue({ id: "c1" });

    await deleteClient("c1", "user-1");

    expect(prismaMock.client.delete).toHaveBeenCalledWith({
      where: { id: "c1", userId: "user-1" },
    });
  });
});
