"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePortal } from "@/hooks/use-portal";
import { formatCurrency } from "@/lib/utils/format";
import { CreditCard, Wallet, Smartphone, AlertCircle, ArrowLeft, Check } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: () => void) => void;
}

export default function PayInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { invoice, loading, error } = usePortal(token);
  const [method, setMethod] = useState<"stripe" | "paypal" | "upi">("stripe");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (loading) return <LoadingSpinner />;

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-extrabold text-2xl">{error || "Invoice not found"}</h1>
        </div>
      </div>
    );
  }

  const total = Number(invoice.total) - Number(invoice.paidAmount || 0);

  const handlePay = async () => {
    setPaying(true);
    setPayError(null);

    try {
      if (method === "stripe") {
        const res = await fetch("/api/payments/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: invoice.id,
            amount: total,
            userId: invoice.userId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create payment");
        window.location.href = data.data.checkoutUrl;
      } else if (method === "paypal") {
        const res = await fetch("/api/payments/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            total,
            currency: invoice.currency || "USD",
            clientId: invoice.clientId,
            userId: invoice.userId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create PayPal order");

        if (data.data?.approvalUrl) {
          window.location.href = data.data.approvalUrl;
        } else {
          throw new Error("No approval URL returned from PayPal");
        }
      } else if (method === "upi") {
        const res = await fetch("/api/payments/upi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: invoice.id,
            amount: total,
            currency: invoice.currency || "INR",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create UPI order");

        const { orderId, amount, keyId, currency } = data.data;
        const amountInPaise = Number(amount);

        if (typeof window.Razorpay === "undefined") {
          throw new Error("Razorpay script not loaded");
        }

        const razorpay = new window.Razorpay({
          key: keyId,
          amount: amountInPaise,
          currency: currency || "INR",
          name: "PayFlow",
          description: `Payment for ${invoice.invoiceNumber}`,
          order_id: orderId,
          handler: function (response: { razorpay_payment_id: string }) {
            window.location.href = `/pay/success?source=upi&payment_id=${response.razorpay_payment_id}`;
          },
          prefill: {
            name: invoice.client?.name || "",
            email: invoice.client?.email || "",
          },
          theme: {
            color: "#6366f1",
          },
        });

        razorpay.on("payment.failed", function () {
          setPaying(false);
          setPayError("UPI payment failed. Please try again.");
        });

        razorpay.open();
      }
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
      setPaying(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => router.push(`/share/${token}`)}
            className="flex items-center gap-1 text-sm text-muted-foreground font-medium mb-4 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to invoice
          </button>

          <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-hard">
            <h1 className="font-display font-extrabold text-2xl mb-1">Pay Invoice</h1>
            <p className="text-muted-foreground font-medium mb-6">
              {invoice.invoiceNumber} — {invoice.title}
            </p>

            <Card className="p-4 mb-6 border-2 border-foreground">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Total Due</span>
                <span className="font-display font-black text-2xl tabular-nums">{formatCurrency(total)}</span>
              </div>
            </Card>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setMethod("stripe")}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-left transition-all ${
                  method === "stripe"
                    ? "border-primary bg-primary/5"
                    : "border-foreground/20 hover:border-foreground/50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${method === "stripe" ? "border-primary bg-primary/10" : "border-foreground/20"}`}>
                  <CreditCard className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="flex-1">Card (Stripe)</div>
                {method === "stripe" && <Check className="h-5 w-5 text-primary" strokeWidth={3} />}
              </button>

              <button
                onClick={() => setMethod("paypal")}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-left transition-all ${
                  method === "paypal"
                    ? "border-primary bg-primary/5"
                    : "border-foreground/20 hover:border-foreground/50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${method === "paypal" ? "border-primary bg-primary/10" : "border-foreground/20"}`}>
                  <Wallet className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="flex-1">PayPal</div>
                {method === "paypal" && <Check className="h-5 w-5 text-primary" strokeWidth={3} />}
              </button>

              <button
                onClick={() => setMethod("upi")}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 font-bold text-left transition-all ${
                  method === "upi"
                    ? "border-primary bg-primary/5"
                    : "border-foreground/20 hover:border-foreground/50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 ${method === "upi" ? "border-primary bg-primary/10" : "border-foreground/20"}`}>
                  <Smartphone className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <div className="flex-1">UPI / Razorpay</div>
                {method === "upi" && <Check className="h-5 w-5 text-primary" strokeWidth={3} />}
              </button>
            </div>

            {payError && (
              <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-3 mb-4">
                <p className="text-sm font-bold text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {payError}
                </p>
              </div>
            )}

            <Button
              variant="gradient"
              className="w-full"
              size="xl"
              onClick={handlePay}
              disabled={paying || total <= 0}
            >
              {paying ? (
                <LoadingSpinner className="h-5 w-5 mr-2" />
              ) : (
                <>
                  Pay {formatCurrency(total)}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground font-medium text-center mt-4">
              Secure payment processed by {method === "stripe" ? "Stripe" : method === "paypal" ? "PayPal" : "Razorpay"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
