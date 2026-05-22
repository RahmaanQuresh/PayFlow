"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useInvoices } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils/format";
import { ArrowRight, Scale, FileText, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

function LegalSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-48 mb-1" />
      <Skeleton className="h-5 w-64 mb-8" />
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-12 w-12 rounded-xl mb-3" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-48 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function LegalPage() {
  const { invoices, loading, error, refetch } = useInvoices();

  const overdueInvoices = useMemo(() => {
    const now = new Date();
    return invoices
      .filter((i) => i.status === "overdue")
      .map((inv) => ({
        ...inv,
        daysOverdue: Math.round((now.getTime() - new Date(inv.dueDate).getTime()) / 86400000),
      }));
  }, [invoices]);

  if (loading) return <LegalSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load data</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl mb-1">Legal Escalation</h1>
      <p className="text-muted-foreground font-medium mb-8">Tools to help you recover unpaid invoices</p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="hover:-translate-y-[2px] hover:shadow-hard-lg">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary border-2 border-foreground shadow-hard-sm mb-3">
              <FileText className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <CardTitle>Demand Letter Generator</CardTitle>
            <CardDescription>Generate a formal, legally-reviewed demand letter for any overdue invoice.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4 font-medium">
              {["Auto-populated with invoice details", "Customizable letter body", "Download as PDF", "Includes legal disclaimer"].map((text) => (
                <li key={text} className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-primary shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/legal/demand-letter">
              <Button variant="gradient"><ArrowRight className="h-4 w-4 mr-2" />Generate Demand Letter</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-[2px] hover:shadow-hard-lg">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-tertiary to-orange-400 border-2 border-foreground shadow-hard-sm mb-3">
              <Scale className="h-6 w-6 text-foreground" strokeWidth={2.5} />
            </div>
            <CardTitle>Small Claims Court Guide</CardTitle>
            <CardDescription>Step-by-step guidance for filing small claims in your jurisdiction.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4 font-medium">
              {["Jurisdiction-specific guidance", "Required documents checklist", "Filing procedures & fees", "Resource links"].map((text) => (
                <li key={text} className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-tertiary shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
            <Link href="/legal/small-claims">
              <Button variant="outline"><ArrowRight className="h-4 w-4 mr-2" />View Guide</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {overdueInvoices.length > 0 ? (
        <div>
          <h2 className="font-display font-extrabold text-xl mb-4">Overdue Invoices Eligible for Escalation</h2>
          <div className="rounded-2xl border-2 border-foreground overflow-hidden shadow-hard-sm">
            {overdueInvoices.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4 border-b-2 border-foreground last:border-0 hover:bg-tertiary/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border-2 border-destructive">
                    <AlertTriangle className="h-5 w-5 text-destructive" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-bold">{inv.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground font-medium">{inv.client?.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">{formatCurrency(Number(inv.total))}</div>
                  <div className="text-sm text-destructive font-bold">{inv.daysOverdue} days overdue</div>
                </div>
                <Link href={`/legal/demand-letter/${inv.id}`}>
                  <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-2" /> Generate Letter</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-10">
          <EmptyState
            icon={<CheckCircle />}
            title="All caught up"
            description="No overdue invoices — great job collecting payments!"
          />
        </Card>
      )}
    </div>
  );
}
