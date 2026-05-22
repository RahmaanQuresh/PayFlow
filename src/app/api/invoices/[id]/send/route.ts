import { sendInvoice } from "@/lib/db/invoices";
import { getInvoice } from "@/lib/db/invoices";
import { sendInvoiceEmail } from "@/lib/email/resend";
import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getSessionUserId();

    const invoice = await sendInvoice(id, userId);
    const fullInvoice = await getInvoice(id, userId);

    if (!fullInvoice || !fullInvoice.portalToken) {
      return apiError("INTERNAL_ERROR", "Failed to send invoice", 500);
    }

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${fullInvoice.portalToken}`;

    try {
      const user = { name: "Freelancer" };
      await sendInvoiceEmail({
        to: fullInvoice.client.email,
        invoiceNumber: fullInvoice.invoiceNumber,
        clientName: fullInvoice.client.name,
        portalUrl,
        freelancerName: user.name,
        amount: Number(fullInvoice.total),
        dueDate: fullInvoice.dueDate,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return successResponse({ invoice, message: "Invoice sent" });
  } catch (error) {
    console.error("POST /api/invoices/[id]/send error:", error);
    return apiError("INTERNAL_ERROR", "Failed to send invoice", 500);
  }
}
