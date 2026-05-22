"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { CheckCircle, ArrowRight, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [data, setData] = useState<{ amount: number; invoiceNumber: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verify() {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/payments/verify?session_id=${sessionId}`);
        const result = await res.json();
        if (res.ok && result.data) {
          setData(result.data);
        } else {
          setError(result.message || "Could not verify payment");
        }
      } catch {
        setError("Failed to verify payment");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [sessionId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-10 text-center">
          {error || !sessionId ? (
            <>
              <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-6">
                <AlertCircle className="h-10 w-10 text-destructive" strokeWidth={2.5} />
              </div>
              <h1 className="font-display font-extrabold text-2xl mb-2">
                {error || "No payment session found"}
              </h1>
              <p className="text-muted-foreground font-medium mb-6">
                If you completed payment, please check your email for confirmation.
              </p>
            </>
          ) : (
            <>
              <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-gradient-to-br from-quaternary to-emerald-400 border-2 border-foreground shadow-hard mb-6">
                <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="font-display font-extrabold text-2xl mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground font-medium mb-6">Thank you for your payment</p>

              {data && (
                <div className="rounded-xl border-2 border-foreground bg-muted/20 p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-extrabold">{formatCurrency(data.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-bold">{data.invoiceNumber}</span>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground font-medium mb-6">
                A confirmation email has been sent to your inbox.
              </div>
            </>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button variant="gradient" className="w-full">
                Back to Home <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
