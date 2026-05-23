import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/helpers";
import { apiError } from "@/lib/utils/errors";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const clientId = searchParams.get("clientId") || undefined;
    const status = searchParams.get("status") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    const where: Record<string, unknown> = { userId };
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.issueDate = {};
      if (dateFrom) (where.issueDate as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.issueDate as Record<string, unknown>).lte = new Date(dateTo);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { name: true, email: true } },
        lineItems: { select: { description: true, quantity: true, rate: true, amount: true } },
        payments: { select: { amount: true, method: true, status: true, paidAt: true } },
      },
      orderBy: { issueDate: "desc" },
    });

    if (format === "csv") {
      const headers = [
        "Invoice #", "Client", "Email", "Title", "Status", "Issue Date",
        "Due Date", "Payment Terms", "Subtotal", "Tax", "Total",
        "Paid Amount", "Balance", "Paid At", "Line Items",
      ];

      const rows = invoices.map((inv) => {
        const lineItemSummary = inv.lineItems
          .map((li) => `${li.description} (${li.quantity}x ${li.rate})`)
          .join("; ");

        return [
          inv.invoiceNumber,
          inv.client.name,
          inv.client.email,
          inv.title,
          inv.status,
          new Date(inv.issueDate).toLocaleDateString(),
          new Date(inv.dueDate).toLocaleDateString(),
          inv.paymentTerms,
          String(inv.subtotal),
          String(inv.taxAmount),
          String(inv.total),
          String(inv.paidAmount),
          String(Number(inv.total) - Number(inv.paidAmount)),
          inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : "",
          lineItemSummary,
        ];
      });

      const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="invoice-report-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ invoices, total: invoices.length });
  } catch (error) {
    console.error("GET /api/reports/export error:", error);
    return apiError("INTERNAL_ERROR", "Failed to export report", 500);
  }
}
