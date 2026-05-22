import Stripe from "stripe";
import { successResponse, apiError } from "@/lib/utils/errors";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amount, userId } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: `Invoice Payment`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/share/${invoiceId}`,
      metadata: {
        invoiceId,
        userId,
      },
    });

    return successResponse({ checkoutUrl: session.url });
  } catch (error) {
    console.error("POST /api/payments/create-session error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create payment session", 500);
  }
}
