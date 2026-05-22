import { prisma } from "@/lib/db";
import { markInvoicePaid } from "@/lib/db/invoices";
import { sendPaymentReceivedEmail } from "@/lib/email/resend";
import crypto from "crypto";
import { NextResponse } from "next/server";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Razorpay webhook not configured" }, { status: 501 });
    }

    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    if (eventType === "payment.captured") {
      const orderId = payload.payment.entity.order_id;
      const amountInPaise = payload.payment.entity.amount;
      const amount = amountInPaise / 100;

      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
        include: { invoice: { include: { client: true } } },
      });

      if (!payment) {
        return NextResponse.json({ warning: "Payment record not found" }, { status: 200 });
      }

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: payload.payment.entity.id,
          paidAt: new Date(),
        },
      });

      await markInvoicePaid(payment.invoiceId, amount);

      if (payment.invoice?.client?.email) {
        await sendPaymentReceivedEmail({
          to: payment.invoice.client.email,
          invoiceNumber: payment.invoice.invoiceNumber,
          amount,
          clientName: payment.invoice.client.name,
        }).catch(() => {});
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
