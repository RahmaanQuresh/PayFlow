"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePortal } from "@/hooks/use-portal";
import { formatCurrency } from "@/lib/utils/format";
import { CreditCard, Wallet, AlertCircle, ArrowLeft, Check } from "lucide-react";

export default function PayInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { invoice, loading, error } = usePortal(token);
  const [method, setMethod] = useState<"stripe" | "paypal">("stripe");
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
      } else {
        const res = await fetch("/api/payments/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            total,
            currency: invoice.currency || "USD",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to create PayPal order");

        if (data.data?.approvalUrl) {
          window.location.href = data.data.approvalUrl;
        } else {
          throw new Error("No approval URL returned from PayPal");
        }
      }
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Payment failed");
      setPaying(false);
    }
  };

  return (
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
            Secure payment processed by {method === "stripe" ? "Stripe" : "PayPal"}
          </p>
        </div>
      </div>
    </div>
  );
}
