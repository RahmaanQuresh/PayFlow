import { getSessionUserId } from "@/lib/auth/helpers";
import { getInvoice } from "@/lib/db/invoices";
import { prisma } from "@/lib/db";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice";
import { uploadPdf } from "@/lib/utils/blob-storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getSessionUserId();

  if (!userId) {
    return Response.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
  }

  const invoice = await getInvoice(id, userId);
  if (!invoice) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Invoice not found" } }, { status: 404 });
  }

  const [client, user] = await Promise.all([
    prisma.client.findUnique({ where: { id: invoice.clientId } }),
    prisma.user.findUnique({ where: { id: invoice.userId } }),
  ]);

  if (!client || !user) {
    return Response.json({ error: { code: "NOT_FOUND", message: "Associated records not found" } }, { status: 404 });
  }

  const lineItems = await prisma.lineItem.findMany({
    where: { invoiceId: id },
    orderBy: { sortOrder: "asc" },
  });

  const buffer = await generateInvoicePdf({
    invoice: {
      invoiceNumber: invoice.invoiceNumber,
      title: invoice.title,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount,
      total: invoice.total,
      paidAmount: invoice.paidAmount,
      currency: invoice.currency,
      notes: invoice.notes,
    },
    client: {
      name: client.name,
      email: client.email,
      company: client.company,
      addressLine1: client.addressLine1,
      addressLine2: client.addressLine2,
      city: client.city,
      state: client.state,
      postalCode: client.postalCode,
      country: client.country,
    },
    freelancer: {
      name: user.name,
      email: user.email,
      businessName: user.businessName,
      addressLine1: user.addressLine1,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
    },
    lineItems: lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      rate: li.rate,
      amount: li.amount,
    })),
  });

  uploadPdf(Buffer.from(buffer), invoice.invoiceNumber, userId).catch((err) => {
    console.error("Failed to store PDF in blob:", err);
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
