import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markInvoicePaid } from "@/lib/db/invoices";
import { createPayment } from "@/lib/db/payments";
import { getInvoice } from "@/lib/db/invoices";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy");

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature") || "";
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    let event: Stripe.Event;

    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        event = JSON.parse(body) as Stripe.Event;
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { invoiceId, userId } = session.metadata || {};

      if (invoiceId && userId && session.amount_total) {
        const amount = session.amount_total / 100;
        const invoice = await getInvoice(invoiceId, userId);

        await createPayment({
          invoiceId,
          userId,
          clientId: invoice?.clientId || "",
          amount,
          method: "CARD",
          stripePaymentIntentId: session.payment_intent as string,
        });

        await markInvoicePaid(invoiceId, amount);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
