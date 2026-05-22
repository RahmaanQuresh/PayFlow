import { getInvoices } from "@/lib/db/invoices";
import { invoiceSchema } from "@/lib/utils/validation";
import { createInvoice } from "@/lib/db/invoices";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = await getSessionUserId();

    const invoices = await getInvoices(userId, {
      status: searchParams.get("status") as never,
      clientId: searchParams.get("clientId") || undefined,
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") || "desc") as "asc" | "desc",
    });

    return successResponse(invoices);
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch invoices", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = invoiceSchema.parse(body);
    const userId = await getSessionUserId();

    const invoice = await createInvoice({
      ...data,
      userId,
      dueDate: new Date(data.dueDate),
      lineItems: data.lineItems.map((item) => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
    });

    return successResponse({ invoice }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_ERROR", "Invalid invoice data", 400, { details: error.issues });
    }
    console.error("POST /api/invoices error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create invoice", 500);
  }
}
