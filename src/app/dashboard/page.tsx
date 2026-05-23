"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useInvoices } from "@/hooks/use-invoices";
import { useReports } from "@/hooks/use-reports";
import { Plus, FileText, DollarSign, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  paid: "#22c55e",
  partially_paid: "#a78bfa",
  sent: "#3b82f6",
  viewed: "#8b5cf6",
  overdue: "#ef4444",
  draft: "#6b7280",
  canceled: "#9ca3af",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  partially_paid: "Partially Paid",
  sent: "Sent",
  viewed: "Viewed",
  overdue: "Overdue",
  draft: "Draft",
  canceled: "Canceled",
};

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-32 mb-1" />
      <Skeleton className="h-5 w-48 mb-8" />
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent><Skeleton className="h-60 w-full rounded-xl" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent><Skeleton className="h-60 w-full rounded-xl" /></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-72 w-full rounded-xl" /></CardContent>
      </Card>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { invoices, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useInvoices({ limit: 5 });
  const { data: reports, loading: reportsLoading, error: reportsError, refetch: refetchReports } = useReports();

  const loading = invoicesLoading || reportsLoading;
  const error = invoicesError || reportsError;

  const { outstanding, overdue, paid30d, pieData, revenueData, overdueTrendData } = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = now.getTime() - 30 * 86400000;
    return {
      outstanding: invoices.filter((i) => i.status === "sent" || i.status === "viewed"),
      overdue: invoices.filter((i) => i.status === "overdue"),
      paid30d: invoices.filter(
        (i) => i.status === "paid" && new Date(i.paidAt || 0).getTime() > thirtyDaysAgo
      ),
      pieData: reports?.statusCounts
        ? Object.entries(reports.statusCounts)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => ({ name: STATUS_LABELS[status] || status, value: count, status }))
        : [],
      revenueData: reports?.monthlyRevenue || [],
      overdueTrendData: reports?.overdueTrends || [],
    };
  }, [invoices, reports]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load dashboard</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => { refetchInvoices(); refetchReports(); }}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Dashboard</h1>
          <p className="text-muted-foreground font-medium mt-1">Welcome back! Here&rsquo;s your overview.</p>
        </div>
        <Link href="/invoices/new">
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
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

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <ChartCard title="Invoice Status Breakdown">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="var(--color-foreground)"
                  strokeWidth={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#6b7280"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background)",
                    border: "2px solid var(--color-foreground)",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                  formatter={(value) => {
                    const v = Number(value);
                    return [`${v} invoice${v !== 1 ? "s" : ""}`, undefined];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-muted-foreground font-medium">No invoice data yet</div>
          )}
        </ChartCard>

        <ChartCard title="Monthly Revenue (12 months)">
          {revenueData.some((d) => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background)",
                    border: "2px solid var(--color-foreground)",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="url(#revenueGradient)" />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-secondary)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-muted-foreground font-medium">No paid invoices yet</div>
          )}
        </ChartCard>
      </div>

      {/* Overdue Trends */}
      <div className="mb-8">
        <ChartCard title="Overdue Trends (6 months)">
          {overdueTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={overdueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background)",
                    border: "2px solid var(--color-foreground)",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", r: 5, strokeWidth: 2 }}
                  name="Overdue Invoices"
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 5, strokeWidth: 2 }}
                  name="Amount ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-muted-foreground font-medium">No overdue data yet</div>
          )}
        </ChartCard>
      </div>

      {/* Recent Invoices */}
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
