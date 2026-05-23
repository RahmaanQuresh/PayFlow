import { successResponse, apiError } from "@/lib/utils/errors";
import { markInvoicePaid } from "@/lib/db/invoices";
import { createPayment } from "@/lib/db/payments";

const PAYPAL_BASE = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getPayPalToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal not configured");

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, invoiceId, userId, clientId } = body;

    if (!orderId || !invoiceId || !userId) {
      return apiError("VALIDATION_ERROR", "orderId, invoiceId, and userId are required", 400);
    }

    const accessToken = await getPayPalToken();

    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const capture = await captureRes.json();

    if (!captureRes.ok) {
      console.error("PayPal capture error:", capture);
      return apiError("PAYMENT_ERROR", capture.message || "Failed to capture PayPal payment", 500);
    }

    const purchaseUnit = capture.purchase_units?.[0];
    const captureDetail = purchaseUnit?.payments?.captures?.[0];

    if (captureDetail?.status === "COMPLETED") {
      const amount = Number(captureDetail.amount.value);

      await createPayment({
        invoiceId,
        userId,
        clientId: clientId || "",
        amount,
        method: "PAYPAL",
      });

      await markInvoicePaid(invoiceId, amount);
    }

    return successResponse({ status: captureDetail?.status || "UNKNOWN", capture });
  } catch (error) {
    if (error instanceof Error && error.message === "PayPal not configured") {
      return apiError("CONFIG_ERROR", "PayPal is not configured", 503);
    }
    console.error("POST /api/payments/paypal/capture error:", error);
    return apiError("INTERNAL_ERROR", "Failed to capture PayPal payment", 500);
  }
}
