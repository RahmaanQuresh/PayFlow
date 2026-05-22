"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInvoice } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils/format";
import { ArrowLeft, Download, Send, Pause, Play, AlertCircle } from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { invoice, loading, error, refetch } = useInvoice(id);

  if (loading) return <LoadingSpinner />;

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">
          {error || "Invoice not found"}
        </h2>
        <Link href="/invoices" className="mt-4">
          <Button variant="outline">Back to Invoices</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-2xl">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground font-medium">{invoice.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Download
          </Button>
          {invoice.status !== "paid" && (
            <Button variant="gradient" size="sm">
              <Send className="h-4 w-4 mr-2" /> Send
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent><StatusBadge status={invoice.status} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-2xl">{formatCurrency(Number(invoice.total))}</div>
            {Number(invoice.paidAmount) > 0 && (
              <p className="text-sm text-quaternary font-bold mt-1">
                {formatCurrency(Number(invoice.paidAmount))} paid
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-2xl">
              {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Line Items</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(invoice.lineItems || []).map((item) => (
                <div key={item.id} className="flex justify-between py-3 border-b-2 border-foreground last:border-0">
                  <div>
                    <div className="font-bold">{item.description}</div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {item.quantity} x {formatCurrency(Number(item.rate))}
                    </div>
                  </div>
                  <div className="font-extrabold">{formatCurrency(Number(item.amount))}</div>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t-2 border-foreground">
                <span className="font-extrabold">Total</span>
                <span className="font-display font-black text-lg">{formatCurrency(Number(invoice.total))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Client</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Name</div>
                <div className="font-bold">{invoice.client?.name}</div>
              </div>
              {invoice.client?.company && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company</div>
                  <div className="font-medium">{invoice.client.company}</div>
                </div>
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</div>
                <div className="font-medium">{invoice.client?.email}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {invoice.remindersEnabled && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Reminders</CardTitle>
            <div className="flex gap-2">
              {invoice.remindersPaused ? (
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" /> Resume
                </Button>
              ) : (
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" /> Pause
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              <span className="text-muted-foreground">Current step: </span>
              <span className="font-bold">{invoice.currentReminderStep}</span>
              <span className="text-muted-foreground ml-4">Status: </span>
              <StatusBadge status={invoice.remindersPaused ? "draft" : "sent"} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
