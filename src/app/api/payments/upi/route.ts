import { successResponse, apiError } from "@/lib/utils/errors";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

function isConfigured(): boolean {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && RAZORPAY_KEY_ID.startsWith("rzp_"));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amount, currency = "INR" } = body;

    if (!invoiceId || !amount) {
      return apiError("VALIDATION_ERROR", "invoiceId and amount are required", 400);
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    if (!isConfigured()) {
      return successResponse({
        orderId: `order_${Date.now()}`,
        amount: amountInPaise,
        currency,
        keyId: RAZORPAY_KEY_ID,
        message: "UPI payment order created (test mode — Razorpay not configured)",
      });
    }

    const orderData = {
      amount: amountInPaise,
      currency,
      receipt: `invoice_${invoiceId}`,
      notes: {
        invoiceId,
        source: "payflow",
      },
    };

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Razorpay order creation failed:", errorData);
      return apiError("PAYMENT_ERROR", "Failed to create payment order", 502);
    }

    const order = await response.json();

    return successResponse({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      message: "UPI payment order created",
    });
  } catch (error) {
    console.error("POST /api/payments/upi error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create UPI payment", 500);
  }
}
