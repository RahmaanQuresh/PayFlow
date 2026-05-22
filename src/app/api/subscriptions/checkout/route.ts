import { successResponse, apiError } from "@/lib/utils/errors";
import { getSessionUserId } from "@/lib/auth/helpers";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, billingPeriod } = body;
    const userId = await getSessionUserId();

    const priceId = billingPeriod === "annual"
      ? process.env[`STRIPE_${planId.toUpperCase()}_ANNUAL_PRICE_ID`]
      : process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`];

    if (!priceId) {
      return apiError("NOT_FOUND", "Plan not found", 404);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
      metadata: { userId, planId },
    });

    return successResponse({ checkoutUrl: session.url });
  } catch (error) {
    console.error("POST /api/subscriptions/checkout error:", error);
    return apiError("INTERNAL_ERROR", "Failed to create checkout", 500);
  }
}
