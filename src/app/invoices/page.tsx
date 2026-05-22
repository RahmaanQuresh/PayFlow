"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils/format";

function InvoicesSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-40 mb-2" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="rounded-2xl border-2 border-foreground overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b-2 border-foreground bg-muted/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b-2 border-foreground last:border-0">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const { invoices, loading, error, refetch } = useInvoices();

  if (loading) return <InvoicesSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load invoices</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Invoices</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage all your invoices</p>
        </div>
        <Link href="/invoices/new">
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No invoices yet"
          description="Create your first invoice to get started with PayFlow."
          action={
            <Link href="/invoices/new">
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />Create Invoice
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border-2 border-foreground overflow-hidden shadow-hard-sm">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-4 p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-foreground bg-muted/50 min-w-[600px]">
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
                className="grid grid-cols-5 gap-4 p-4 text-sm hover:bg-tertiary/5 transition-colors border-b-2 border-foreground last:border-0 font-medium min-w-[600px]"
              >
                <div className="font-bold">{invoice.invoiceNumber}</div>
                <div className="text-muted-foreground">{invoice.client?.name}</div>
                <div className="font-bold">{formatCurrency(Number(invoice.total))}</div>
                <div><StatusBadge status={invoice.status} /></div>
                <div className="text-muted-foreground">
                  {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
