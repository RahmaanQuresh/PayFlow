import { vi } from "vitest";

const prismaMock = {
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
  $transaction: vi.fn((fn: () => unknown) => fn()),
};

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

export { prismaMock };
