import { getInvoice, updateInvoice, sendInvoice, cancelInvoice } from "@/lib/db/invoices";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    const invoice = await getInvoice(id, userId);
    if (!invoice) {
      return apiError("NOT_FOUND", "Invoice not found", 404);
    }

    return successResponse({ invoice });
  } catch (error) {
    console.error("GET /api/invoices/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch invoice", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const body = await request.json();

    const invoice = await updateInvoice(id, userId, body);
    return successResponse({ invoice });
  } catch (error) {
    console.error("PATCH /api/invoices/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update invoice", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    await cancelInvoice(id, userId);
    return successResponse({ message: "Invoice canceled" });
  } catch (error) {
    console.error("DELETE /api/invoices/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to cancel invoice", 500);
  }
}
