import { getSequences, createSequence } from "@/lib/db/reminders";
import { reminderSequenceSchema } from "@/lib/utils/validation";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";
import { z } from "zod";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    const sequences = await getSequences(userId);
    return successResponse({ sequences });
  } catch (error) {
    console.error("GET /api/reminders/sequences error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch sequences", 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = reminderSequenceSchema.parse(body);
    const userId = await getSessionUserId();

    const sequence = await createSequence(userId, data);
    return successResponse({ sequence }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("VALIDATION_ERROR", "Invalid sequence data", 400, { details: error.issues });
    }
    console.error("POST /api/reminders/sequences error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create sequence", 500);
  }
}
