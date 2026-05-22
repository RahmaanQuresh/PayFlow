import { getPaymentsByUser } from "@/lib/db/payments";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = await getSessionUserId();

    const data = await getPaymentsByUser(userId, {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    });

    return successResponse(data);
  } catch (error) {
    console.error("GET /api/payments/history error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch payments", 500);
  }
}
