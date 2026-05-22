import { getClients, createClient } from "@/lib/db/clients";
import { clientSchema } from "@/lib/utils/validation";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = await getSessionUserId();

    const data = await getClients(userId, {
      search: searchParams.get("search") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    });

    return successResponse(data);
  } catch (error) {
    console.error("GET /api/clients error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch clients", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = clientSchema.parse(body);
    const userId = await getSessionUserId();

    const client = await createClient({ ...data, userId });
    return successResponse({ client }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_ERROR", "Invalid client data", 400, { details: error.issues });
    }
    console.error("POST /api/clients error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create client", 500);
  }
}
