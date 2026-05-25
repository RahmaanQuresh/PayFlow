import { NextResponse } from "next/server";
import { markInvoicePaid } from "@/lib/db/invoices";
import { createPayment } from "@/lib/db/payments";

const PAYPAL_BASE = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function verifyWebhookSignature(headers: Headers, body: string): Promise<boolean> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId || !clientId || !secret) {
    console.warn("PayPal webhook verification skipped — missing credentials");
    return false;
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo") || "",
      cert_url: headers.get("paypal-cert-url") || "",
      transmission_id: headers.get("paypal-transmission-id") || "",
      transmission_sig: headers.get("paypal-transmission-sig") || "",
      transmission_time: headers.get("paypal-transmission-time") || "",
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });

  const data = await res.json();
  return data.verification_status === "SUCCESS";
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const isVerified = await verifyWebhookSignature(request.headers, body);

    if (!isVerified && process.env.PAYPAL_WEBHOOK_ID) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = event.resource;
      const amount = Number(resource.amount?.value || 0);

      let invoiceId = resource.invoice_id || "";
      let userId = "";
      let clientId = "";

      if (resource.custom_id) {
        try {
          const parsed = JSON.parse(resource.custom_id);
          invoiceId = parsed.invoiceId || invoiceId;
          userId = parsed.userId || "";
          clientId = parsed.clientId || "";
        } catch {
          invoiceId = resource.custom_id;
        }
      }

      if (!invoiceId) {
        const purchaseUnit = resource.purchase_units?.[0];
        invoiceId = purchaseUnit?.reference_id || purchaseUnit?.custom_id || "";
      }

      if (invoiceId && userId) {
        await createPayment({
          invoiceId,
          userId,
          clientId,
          amount,
          method: "PAYPAL",
        });

        await markInvoicePaid(invoiceId, amount);
      } else {
        console.error("PayPal webhook: missing invoiceId or userId", { invoiceId, userId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
