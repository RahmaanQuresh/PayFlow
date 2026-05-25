import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getInvoice } from "@/lib/db/invoices";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Missing session_id" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Payment not completed" },
        { status: 200 }
      );
    }

    const { invoiceId, userId } = session.metadata || {};

    if (!invoiceId || !userId) {
      const amount = session.amount_total ? session.amount_total / 100 : 0;
      return NextResponse.json({
        success: true,
        data: { amount, invoiceNumber: "N/A" },
      });
    }

    const invoice = await getInvoice(invoiceId, userId);
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        amount,
        invoiceNumber: invoice?.invoiceNumber || "N/A",
      },
    });
  } catch (error) {
    console.error("GET /api/payments/verify error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
