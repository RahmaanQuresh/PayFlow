import { getClient, updateClient, deleteClient } from "@/lib/db/clients";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    const client = await getClient(id, userId);
    if (!client) {
      return apiError("NOT_FOUND", "Client not found", 404);
    }

    return successResponse({ client });
  } catch (error) {
    console.error("GET /api/clients/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch client", 500);
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

    await updateClient(id, userId, body);
    const client = await getClient(id, userId);

    return successResponse({ client });
  } catch (error) {
    console.error("PATCH /api/clients/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update client", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    await deleteClient(id, userId);
    return successResponse({ message: "Client deleted" });
  } catch (error) {
    console.error("DELETE /api/clients/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete client", 500);
  }
}
