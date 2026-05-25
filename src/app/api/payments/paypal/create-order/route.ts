import { NextResponse } from "next/server";
import { successResponse, apiError } from "@/lib/utils/errors";

const PAYPAL_BASE = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

async function getPayPalToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    throw new Error("PayPal not configured");
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, invoiceNumber, total, currency = "USD", clientId, userId } = body;

    const accessToken = await getPayPalToken();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const purchaseUnit: Record<string, unknown> = {
      reference_id: invoiceId,
      description: `Payment for invoice ${invoiceNumber}`,
      amount: {
        currency_code: currency,
        value: Number(total).toFixed(2),
      },
    };

    if (invoiceId || userId) {
      purchaseUnit.custom_id = JSON.stringify({ invoiceId, userId, clientId });
    }

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [purchaseUnit],
        application_context: {
          brand_name: "PayFlow",
          landing_page: "LOGIN",
          user_action: "PAY_NOW",
          return_url: `${appUrl}/pay/success?source=paypal`,
          cancel_url: `${appUrl}/share/${invoiceId}`,
        },
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error("PayPal create order error:", order);
      return apiError("PAYMENT_ERROR", order.message || "Failed to create PayPal order", 500);
    }

    return successResponse({
      orderId: order.id,
      approvalUrl: order.links?.find((l: { rel: string }) => l.rel === "approve")?.href || null,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PayPal not configured") {
      return apiError("CONFIG_ERROR", "PayPal is not configured", 503);
    }
    console.error("POST /api/payments/paypal/create-order error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create PayPal order", 500);
  }
}
