import { NextResponse } from "next/server";
import { markInvoicePaid } from "@/lib/db/invoices";
import { createPayment } from "@/lib/db/payments";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify PayPal webhook — in production, validate with PayPal's verify-webhook-signature
    // For now, check the event type
    const eventType = body.event_type;

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = body.resource;
      const invoiceId = resource.invoice_id || resource.custom_id;

      if (invoiceId) {
        const amount = Number(resource.amount?.value || 0);

        // In production, fetch actual invoice/user data
        await createPayment({
          invoiceId,
          userId: resource.custom || "",
          clientId: resource.customer_id || "",
          amount,
          method: "PAYPAL",
        });

        await markInvoicePaid(invoiceId, amount);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
