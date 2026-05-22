"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useInvoices } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils/format";
import { FileText, Clock, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";

export default function ReportsPage() {
  const { invoices, loading, error, refetch } = useInvoices({ limit: 100 });

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load reports</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "viewed");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const paid = invoices.filter((i) => i.status === "paid");

  const avgDaysToPay = paid.length
    ? Math.round(
        paid.reduce((sum, i) => {
          const paidDate = i.paidAt ? new Date(i.paidAt) : new Date();
          const issueDate = new Date(i.issueDate);
          return sum + (paidDate.getTime() - issueDate.getTime()) / 86400000;
        }, 0) / paid.length
      )
    : 0;

  const outstandingTotal = outstanding.reduce((s, i) => s + Number(i.total) - Number(i.paidAmount || 0), 0);
  const overdueTotal = overdue.reduce((s, i) => s + Number(i.total) - Number(i.paidAmount || 0), 0);

  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl mb-1">Reports</h1>
      <p className="text-muted-foreground font-medium mb-8">Insights into your invoicing and payments</p>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="group hover:-translate-y-[3px] hover:shadow-hard-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Outstanding</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border-2 border-foreground group-hover:animate-wiggle">
              <FileText className="h-5 w-5" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl tabular-nums">{formatCurrency(outstandingTotal)}</div>
            <p className="text-sm text-muted-foreground font-medium mt-1">{outstanding.length} invoices</p>
          </CardContent>
        </Card>
        <Card className="group hover:-translate-y-[3px] hover:shadow-hard-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-destructive">Overdue</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border-2 border-destructive group-hover:animate-wiggle">
              <Clock className="h-5 w-5 text-destructive" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl text-destructive tabular-nums">{formatCurrency(overdueTotal)}</div>
            <p className="text-sm text-muted-foreground font-medium mt-1">{overdue.length} invoices</p>
          </CardContent>
        </Card>
        <Card className="group hover:-translate-y-[3px] hover:shadow-hard-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-quaternary">Avg Days to Pay</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-quaternary/10 border-2 border-quaternary group-hover:animate-wiggle">
              <TrendingUp className="h-5 w-5 text-quaternary" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl tabular-nums">{avgDaysToPay}</div>
            <p className="text-sm text-muted-foreground font-medium mt-1">days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: "Invoice Report", desc: "Filter by date, client, and status. Export to CSV or PDF.", gradient: "from-primary to-secondary", icon: FileText },
          { title: "Aging Report", desc: "Breakdown of outstanding invoices by age.", gradient: "from-secondary to-rose-400", icon: Clock },
          { title: "Client Performance", desc: "Identify reliable and slow-paying clients.", gradient: "from-tertiary to-orange-400", icon: TrendingUp },
        ].map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:-translate-y-[2px] hover:shadow-hard-lg">
              <CardHeader>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${report.gradient} border-2 border-foreground shadow-hard-sm mb-3`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground font-medium mb-4">{report.desc}</p>
                <Button variant="outline" className="w-full">View Report <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
