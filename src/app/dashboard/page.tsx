"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInvoices } from "@/hooks/use-invoices";
import { Plus, FileText, DollarSign, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

export default function DashboardPage() {
  const { invoices, loading, error, refetch } = useInvoices({ limit: 5 });

  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "viewed");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const paid30d = invoices.filter(
    (i) => i.status === "paid" && new Date(i.paidAt || 0) > new Date(Date.now() - 30 * 86400000)
  );

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load dashboard</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refetch}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Dashboard</h1>
          <p className="text-muted-foreground font-medium mt-1">Welcome back! Here's your overview.</p>
        </div>
        <Link href="/invoices/new">
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="group hover:-translate-y-[3px] hover:shadow-hard-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Outstanding
            </CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border-2 border-foreground group-hover:animate-wiggle">
              <FileText className="h-5 w-5" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl tabular-nums">
              {formatCurrency(outstanding.reduce((s, i) => s + Number(i.total) - Number(i.paidAmount || 0), 0))}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {outstanding.length} invoice{outstanding.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:-translate-y-[3px] hover:shadow-hard-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-destructive">
              Overdue
            </CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border-2 border-destructive group-hover:animate-wiggle">
              <DollarSign className="h-5 w-5 text-destructive" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl text-destructive tabular-nums">
              {formatCurrency(overdue.reduce((s, i) => s + Number(i.total) - Number(i.paidAmount || 0), 0))}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {overdue.length} invoice{overdue.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:-translate-y-[3px] hover:shadow-hard-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-quaternary">
              Paid (30d)
            </CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-quaternary/10 border-2 border-quaternary group-hover:animate-wiggle">
              <TrendingUp className="h-5 w-5 text-quaternary" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl text-quaternary tabular-nums">
              {formatCurrency(paid30d.reduce((s, i) => s + Number(i.total), 0))}
            </div>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              {paid30d.length} invoice{paid30d.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-extrabold text-xl">Recent Invoices</h2>
          <Link href="/invoices">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        {invoices.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-muted-foreground font-medium">No invoices yet. Create your first one!</p>
            <Link href="/invoices/new" className="mt-4 inline-block">
              <Button variant="gradient" size="sm">
                <Plus className="h-4 w-4 mr-2" /> New Invoice
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="rounded-2xl border-2 border-foreground overflow-hidden">
            <div className="hidden md:grid grid-cols-5 gap-4 p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-foreground bg-muted/50">
              <div>Invoice #</div>
              <div>Client</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Due Date</div>
            </div>
            {invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/invoices/${invoice.id}`}
                className="block p-4 text-sm hover:bg-tertiary/5 transition-colors border-b-2 border-foreground last:border-0"
              >
                <div className="md:grid md:grid-cols-5 md:gap-4 space-y-1 md:space-y-0">
                  <div className="font-bold">{invoice.invoiceNumber}</div>
                  <div className="text-muted-foreground font-medium">{invoice.client?.name}</div>
                  <div className="font-bold">{formatCurrency(Number(invoice.total))}</div>
                  <div><StatusBadge status={invoice.status} /></div>
                  <div className="text-muted-foreground font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
