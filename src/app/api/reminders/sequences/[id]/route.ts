import { getSequence, updateSequence, deleteSequence } from "@/lib/db/reminders";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    const sequence = await getSequence(id, userId);
    if (!sequence) return apiError("NOT_FOUND", "Sequence not found", 404);
    return successResponse({ sequence });
  } catch (error) {
    console.error("GET /api/reminders/sequences/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch sequence", 500);
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
    const sequence = await updateSequence(id, userId, body);
    return successResponse({ sequence });
  } catch (error) {
    console.error("PATCH /api/reminders/sequences/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update sequence", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();
    await deleteSequence(id, userId);
    return successResponse({ message: "Sequence deleted" });
  } catch (error) {
    console.error("DELETE /api/reminders/sequences/[id] error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete sequence", 500);
  }
}
