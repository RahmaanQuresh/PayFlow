import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PayFlow demo data...\n");

  const demoUserId = randomUUID();
  const passwordHash = await bcrypt.hash("demo1234", 12);

  await prisma.user.upsert({
    where: { email: "demo@payflow.app" },
    update: {},
    create: {
      id: demoUserId,
      email: "demo@payflow.app",
      name: "Alex Chen",
      password: passwordHash,
      businessName: "Chen Creative Studio",
      phone: "+1-555-0123",
      addressLine1: "42 Design Avenue",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "US",
      subscriptionStatus: "FREE",
      role: "USER",
    },
  });

  console.log("✅ Demo user: demo@payflow.app / demo1234");

  const clientIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()];
  const clients = [
    { id: clientIds[0], name: "Acme Corp", email: "billing@acme-corp.com", company: "Acme Corporation", phone: "+1-555-1001" },
    { id: clientIds[1], name: "Sarah Johnson", email: "sarah@startupventures.io", company: "Startup Ventures", phone: "+1-555-1002" },
    { id: clientIds[2], name: "Mike's Bakery", email: "mike@mikesbakery.com", company: "Mike's Bakery LLC", phone: "+1-555-1003" },
    { id: clientIds[3], name: "TechFlow Inc", email: "accounts@techflow.dev", company: "TechFlow Inc.", phone: "+1-555-1004" },
    { id: clientIds[4], name: "Green Earth NGO", email: "finance@greenearth.org", company: "Green Earth Foundation", phone: "+1-555-1005" },
  ];

  for (const c of clients) {
    await prisma.client.upsert({
      where: { id: c.id },
      update: {},
      create: { ...c, userId: demoUserId },
    });
  }
  console.log("✅ 5 clients created");

  const seqId = randomUUID();
  const opId = () => randomUUID();
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

  await prisma.reminderSequence.upsert({
    where: { id: seqId },
    update: {},
    create: {
      id: seqId,
      userId: demoUserId,
      name: "Standard Follow-up",
      description: "Gentle reminder at 7 days, firm at 14, urgent at 30.",
      isDefault: true,
      steps: {
        create: [
          {
            id: opId(), daysAfterDue: 7, tone: "FRIENDLY", sortOrder: 0,
            subject: "Gentle Reminder: Invoice {invoice_number}",
            body: "Hi {client_name},\n\nJust a quick nudge — invoice {invoice_number} for ${total} was due on {due_date}. No rush if it's already in process!\n\nView & pay: {portal_url}\n\nThanks,\n{freelancer_name}",
          },
          {
            id: opId(), daysAfterDue: 14, tone: "FORMAL", sortOrder: 1,
            subject: "Payment Reminder: Invoice {invoice_number}",
            body: "Dear {client_name},\n\nInvoice {invoice_number} for ${total} is now 14 days past due. Please arrange payment at your earliest convenience.\n\n{portal_url}\n\nSincerely,\n{freelancer_name}",
          },
          {
            id: opId(), daysAfterDue: 30, tone: "DIRECT", sortOrder: 2,
            subject: "Urgent: Invoice {invoice_number} — Action Required",
            body: "{client_name},\n\nInvoice {invoice_number} for ${total} is 30 days overdue. Immediate payment is required.\n\nPay now: {portal_url}\n\n{freelancer_name}",
          },
        ],
      },
    },
  });
  console.log("✅ Default reminder sequence created (3 steps)");

  interface InvDef {
    id: string; clientId: string; invoiceNumber: string; title: string;
    status: string; issueDate: Date; dueDate: Date; subtotal: number;
    discountAmount?: number; taxRate?: number; taxAmount?: number; total: number;
    paidAmount: number; portalToken: string | null; sentAt: Date | null;
    viewedAt: Date | null; paidAt?: Date | null; currentReminderStep?: number;
    nextReminderDate?: Date | null;
    items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
  }

  const invoiceDefs: InvDef[] = [
    {
      id: opId(), clientId: clientIds[0], invoiceNumber: "INV-2025-0001",
      title: "Website Redesign — Phase 1", status: "PAID",
      issueDate: daysAgo(45), dueDate: daysAgo(15), subtotal: 5000, total: 5000,
      paidAmount: 5000, portalToken: opId(), sentAt: daysAgo(44),
      viewedAt: daysAgo(44), paidAt: daysAgo(14),
      items: [
        { description: "UI/UX Research & Wireframes", quantity: 1, rate: 2000, amount: 2000 },
        { description: "High-fidelity Mockups (10 screens)", quantity: 1, rate: 3000, amount: 3000 },
      ],
    },
    {
      id: opId(), clientId: clientIds[1], invoiceNumber: "INV-2025-0002",
      title: "Brand Identity Package", status: "SENT",
      issueDate: daysAgo(10), dueDate: daysFromNow(20), subtotal: 3500, total: 3500,
      paidAmount: 0, portalToken: opId(), sentAt: daysAgo(9),
      viewedAt: daysAgo(8),
      items: [
        { description: "Logo Design (3 concepts)", quantity: 1, rate: 1500, amount: 1500 },
        { description: "Brand Guidelines Document", quantity: 1, rate: 1200, amount: 1200 },
        { description: "Business Card + Letterhead Design", quantity: 1, rate: 800, amount: 800 },
      ],
    },
    {
      id: opId(), clientId: clientIds[2], invoiceNumber: "INV-2025-0003",
      title: "Social Media Content — June", status: "OVERDUE",
      issueDate: daysAgo(40), dueDate: daysAgo(10), subtotal: 1800, total: 1800,
      paidAmount: 0, portalToken: opId(), sentAt: daysAgo(39),
      viewedAt: daysAgo(38), currentReminderStep: 0, nextReminderDate: daysAgo(3),
      items: [
        { description: "Instagram Posts (15)", quantity: 15, rate: 80, amount: 1200 },
        { description: "TikTok Shorts (5)", quantity: 5, rate: 120, amount: 600 },
      ],
    },
    {
      id: opId(), clientId: clientIds[3], invoiceNumber: "INV-2025-0004",
      title: "API Integration & Dashboard", status: "OVERDUE",
      issueDate: daysAgo(60), dueDate: daysAgo(30), subtotal: 12000,
      discountAmount: 1200, taxRate: 8.5, taxAmount: 918, total: 11718,
      paidAmount: 3000, portalToken: opId(), sentAt: daysAgo(59),
      viewedAt: daysAgo(55), currentReminderStep: 1, nextReminderDate: daysFromNow(4),
      items: [
        { description: "REST API Development (20 endpoints)", quantity: 1, rate: 6000, amount: 6000 },
        { description: "Admin Dashboard UI", quantity: 1, rate: 4000, amount: 4000 },
        { description: "Documentation & Testing", quantity: 1, rate: 2000, amount: 2000 },
      ],
    },
    {
      id: opId(), clientId: clientIds[4], invoiceNumber: "INV-2025-0005",
      title: "Annual Impact Report Design", status: "DRAFT",
      issueDate: daysAgo(2), dueDate: daysFromNow(28), subtotal: 2800, total: 2800,
      paidAmount: 0, portalToken: null, sentAt: null, viewedAt: null, paidAt: null,
      items: [
        { description: "Report Layout & Typography", quantity: 1, rate: 1500, amount: 1500 },
        { description: "Infographic Design (8 graphics)", quantity: 8, rate: 125, amount: 1000 },
        { description: "Print-ready PDF Export", quantity: 1, rate: 300, amount: 300 },
      ],
    },
    {
      id: opId(), clientId: clientIds[0], invoiceNumber: "INV-2025-0006",
      title: "Website Redesign — Phase 2", status: "DRAFT",
      issueDate: daysAgo(1), dueDate: daysFromNow(30), subtotal: 7500,
      taxRate: 8.5, taxAmount: 637.5, total: 8137.5,
      paidAmount: 0, portalToken: null, sentAt: null, viewedAt: null, paidAt: null,
      items: [
        { description: "Frontend Development (React/Next.js)", quantity: 1, rate: 5000, amount: 5000 },
        { description: "CMS Integration", quantity: 1, rate: 1500, amount: 1500 },
        { description: "Performance Optimization", quantity: 1, rate: 1000, amount: 1000 },
      ],
    },
  ];

  for (const inv of invoiceDefs) {
    const { items, ...data } = inv;
    await prisma.invoice.upsert({
      where: { id: data.id },
      update: {},
      create: {
        ...data,
        userId: demoUserId,
        reminderSequenceId: seqId,
        remindersEnabled: true,
        lineItems: {
          create: items.map((li, i) => ({
            id: opId(), description: li.description, quantity: li.quantity,
            rate: li.rate, amount: li.amount, taxable: true, sortOrder: i,
          })),
        },
      },
    });
  }
  console.log("✅ 6 invoices created (1 paid, 1 sent, 2 overdue, 2 draft)");

  const paidInv = invoiceDefs[0];
  await prisma.payment.create({
    data: {
      id: opId(), invoiceId: paidInv.id, userId: demoUserId, clientId: paidInv.clientId,
      amount: paidInv.total, method: "CARD", status: "COMPLETED",
      stripePaymentIntentId: "pi_demo_3k2n8x", paidAt: paidInv.paidAt,
    },
  });

  const partialInv = invoiceDefs[3];
  await prisma.payment.create({
    data: {
      id: opId(), invoiceId: partialInv.id, userId: demoUserId, clientId: partialInv.clientId,
      amount: partialInv.paidAmount, method: "BANK", status: "COMPLETED", paidAt: daysAgo(20),
    },
  });
  console.log("✅ 2 payments created");

  await prisma.toneSample.create({
    data: {
      id: opId(), userId: demoUserId,
      context: "Initial outreach email",
      content: "Hey! Just wanted to check in on this. Totally understand if things are busy — no pressure at all.",
    },
  });
  await prisma.toneSample.create({
    data: {
      id: opId(), userId: demoUserId,
      context: "Follow-up to a client who went quiet",
      content: "Hi again — I know inboxes get wild. Just bumping this in case it slipped through the cracks! 😊",
    },
  });
  console.log("✅ 2 tone samples created\n");

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed complete!");
  console.log("   Login: demo@payflow.app");
  console.log("   Password: demo1234");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
