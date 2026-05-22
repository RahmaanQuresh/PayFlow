import { getInvoiceByPortalToken } from "@/lib/db/invoices";
import { markInvoiceViewed } from "@/lib/db/invoices";
import { successResponse, apiError } from "@/lib/utils/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const invoice = await getInvoiceByPortalToken(token);

    if (!invoice) {
      return apiError("NOT_FOUND", "Invoice not found", 404);
    }

    if (invoice.portalTokenExpiresAt && new Date(invoice.portalTokenExpiresAt) < new Date()) {
      return apiError("NOT_FOUND", "This link has expired", 410);
    }

    // Mark as viewed if sent
    if (invoice.status === "SENT") {
      await markInvoiceViewed(token);
    }

    return successResponse({ invoice });
  } catch (error) {
    console.error("GET /api/portal/[token] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch invoice", 500);
  }
}
