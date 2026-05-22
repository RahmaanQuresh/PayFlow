"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { usePortal } from "@/hooks/use-portal";
import { formatCurrency } from "@/lib/utils/format";
import { Download, Zap, AlertCircle } from "lucide-react";

export default function PortalInvoicePage() {
  const params = useParams();
  const token = params.token as string;
  const { invoice, loading, error } = usePortal(token);

  if (loading) return <LoadingSpinner />;

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-extrabold text-2xl">
            {error || "Invoice not found"}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">This invoice may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary border-2 border-foreground shadow-hard-sm mb-3">
            <Zap className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-extrabold text-2xl">Invoice Portal</h1>
        </div>

        <div className="rounded-2xl border-2 border-foreground bg-card p-6 sm:p-8 shadow-hard space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-display font-extrabold text-xl">{invoice.invoiceNumber}</h2>
              <p className="text-muted-foreground font-medium">{invoice.title}</p>
            </div>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="flex justify-between text-sm flex-wrap gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Bill To</div>
              <div className="font-bold">{invoice.client?.name}</div>
              <div className="font-medium">{invoice.client?.email}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Due Date</div>
              <div className="font-bold">
                {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="rounded-xl border-2 border-foreground overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 border-b-2 border-foreground">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Rate</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {(invoice.lineItems || []).map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 p-3 text-sm border-b-2 border-foreground last:border-0 font-medium">
                <div className="col-span-6 font-bold">{item.description}</div>
                <div className="col-span-2">{item.quantity}</div>
                <div className="col-span-2">{formatCurrency(Number(item.rate))}</div>
                <div className="col-span-2 text-right font-bold">{formatCurrency(Number(item.amount))}</div>
              </div>
            ))}
            <div className="flex justify-end p-4 border-t-2 border-foreground bg-muted/20">
              <div className="w-48">
                <div className="flex justify-between text-sm font-medium">
                  <span>Subtotal</span><span className="font-bold">{formatCurrency(Number(invoice.total))}</span>
                </div>
                <div className="flex justify-between font-extrabold text-lg mt-2 pt-2 border-t-2 border-foreground">
                  <span>Total</span>
                  <span className="font-display font-black">{formatCurrency(Number(invoice.total))}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.status !== "paid" && (
            <div className="flex justify-center pt-2">
              <Link href={`/pay/${token}`}>
                <Button variant="gradient" size="xl" className="px-10">
                  Pay Now - {formatCurrency(Number(invoice.total))}
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center border-t-2 border-foreground pt-6">
            <a href={`/api/portal/${token}/pdf`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground font-medium mt-8">
          Powered by <span className="font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">PayFlow</span> — Secure Invoice Portal
        </p>
      </div>
    </div>
  );
}
