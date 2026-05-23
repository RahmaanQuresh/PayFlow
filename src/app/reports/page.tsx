"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useInvoices } from "@/hooks/use-invoices";
import { useReports, type ReportData } from "@/hooks/use-reports";
import { formatCurrency } from "@/lib/utils/format";
import {
  FileText, Clock, TrendingUp, ArrowRight, AlertCircle, Download,
  FileSpreadsheet, BarChart3, Users, Bell, Search, X,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type Tab = "invoice" | "aging" | "clients" | "reminders";

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

function ReportsSkeleton() {
  return (
    <div>
      <Skeleton className="h-9 w-32 mb-1" />
      <Skeleton className="h-5 w-64 mb-8" />
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-32 mb-1" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

export default function ReportsPage() {
  const { invoices, loading: invoicesLoading, error: invoicesError, refetch: refetchInvoices } = useInvoices({ limit: 100 });
  const { data: reports, loading: reportsLoading, error: reportsError, refetch: refetchReports } = useReports();

  const [activeTab, setActiveTab] = useState<Tab>("invoice");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<string>("issueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const loading = invoicesLoading || reportsLoading;
  const error = invoicesError || reportsError;

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoiceNumber.toLowerCase().includes(q) ||
          (i.client?.name || "").toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter((i) => i.status === statusFilter);
    }
    result.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField];
      const bVal = (b as unknown as Record<string, unknown>)[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return result;
  }, [invoices, search, statusFilter, sortField, sortDir]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams({ format: "csv" });
    if (statusFilter) params.set("status", statusFilter);
    window.open(`/api/reports/export?${params.toString()}`, "_blank");
  };

  if (loading) return <ReportsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load reports</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => { refetchInvoices(); refetchReports(); }}>Try Again</Button>
      </div>
    );
  }

  const outstanding = invoices.filter((i) => i.status === "sent" || i.status === "viewed");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const paid = invoices.filter((i) => i.status === "paid");

  const pendingTotal = outstanding.reduce((s, i) => s + Number(i.total) - Number(i.paidAmount || 0), 0);
  const overdueTotal = overdue.reduce((s, i) => s + Number(i.total) - Number(i.paidAmount || 0), 0);
  const paidTotal = paid.reduce((s, i) => s + Number(i.total), 0);

  const aging = reports?.aging || [];

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "invoice", label: "Invoice Report", icon: FileSpreadsheet },
    { key: "aging", label: "Aging", icon: Clock },
    { key: "clients", label: "Client Performance", icon: Users },
    { key: "reminders", label: "Reminders", icon: Bell },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Reports</h1>
          <p className="text-muted-foreground font-medium mt-1">Insights into your invoicing and payments</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="group hover:-translate-y-[3px] hover:shadow-hard-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Outstanding</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted border-2 border-foreground group-hover:animate-wiggle">
              <FileText className="h-5 w-5" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl tabular-nums">{formatCurrency(pendingTotal)}</div>
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
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-quaternary">Total Collected</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-quaternary/10 border-2 border-quaternary group-hover:animate-wiggle">
              <TrendingUp className="h-5 w-5 text-quaternary" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-3xl text-quaternary tabular-nums">{formatCurrency(paidTotal)}</div>
            <p className="text-sm text-muted-foreground font-medium mt-1">{paid.length} invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "gradient" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "invoice" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-xl border-2 border-foreground bg-background px-3 py-2 text-sm font-bold shadow-hard-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="overdue">Overdue</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="canceled">Canceled</option>
            </select>
            {(search || statusFilter) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>

          {filteredInvoices.length === 0 ? (
            <EmptyState
              icon={<FileSpreadsheet />}
              title="No invoices found"
              description="Try adjusting your filters or create a new invoice."
              action={
                <Link href="/invoices/new">
                  <Button variant="gradient">Create Invoice</Button>
                </Link>
              }
            />
          ) : (
            <div className="rounded-2xl border-2 border-foreground overflow-hidden">
              <div className="grid grid-cols-6 gap-3 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-foreground bg-muted/50">
                <button
                  className="text-left hover:text-foreground"
                  onClick={() => { setSortDir(sortField === "invoiceNumber" && sortDir === "asc" ? "desc" : "asc"); setSortField("invoiceNumber"); }}
                >
                  Invoice # {sortField === "invoiceNumber" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
                <div>Client</div>
                <button
                  className="text-left hover:text-foreground"
                  onClick={() => { setSortDir(sortField === "total" && sortDir === "asc" ? "desc" : "asc"); setSortField("total"); }}
                >
                  Amount {sortField === "total" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
                <div>Status</div>
                <button
                  className="text-left hover:text-foreground"
                  onClick={() => { setSortDir(sortField === "dueDate" && sortDir === "asc" ? "desc" : "asc"); setSortField("dueDate"); }}
                >
                  Due Date {sortField === "dueDate" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
                <div>Balance</div>
              </div>
              {filteredInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="grid grid-cols-6 gap-3 p-3 text-sm hover:bg-tertiary/5 transition-colors border-b-2 border-foreground last:border-0"
                >
                  <div className="font-bold">{invoice.invoiceNumber}</div>
                  <div className="text-muted-foreground font-medium truncate">{invoice.client?.name}</div>
                  <div className="font-bold">{formatCurrency(Number(invoice.total))}</div>
                  <div><StatusBadge status={invoice.status} /></div>
                  <div className="text-muted-foreground font-medium text-xs">
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="font-bold">{formatCurrency(Number(invoice.total) - Number(invoice.paidAmount))}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "aging" && (
        <div>
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <ChartCard title="Outstanding by Age">
              {aging.some((a) => a.amount > 0) ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={aging}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-background)",
                        border: "2px solid var(--color-foreground)",
                        borderRadius: "12px",
                        fontWeight: 600,
                      }}
                      formatter={(value) => [formatCurrency(Number(value)), ""]}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {aging.map((entry, idx) => (
                        <Cell
                          key={entry.bucket}
                          fill={
                            idx === 0 ? "#3b82f6" :
                            idx === 1 ? "#f59e0b" :
                            idx === 2 ? "#f97316" : "#ef4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-60 text-muted-foreground font-medium">No outstanding invoices</div>
              )}
            </ChartCard>
            <div>
              <Card>
                <CardHeader><CardTitle className="text-lg">Aging Summary</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aging.map((bucket) => (
                      <div key={bucket.bucket} className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${bucket.bucket === "0-30 days" ? "bg-blue-500" : bucket.bucket === "31-60 days" ? "bg-amber-500" : bucket.bucket === "61-90 days" ? "bg-orange-500" : "bg-red-500"}`} />
                            <span className="font-bold text-sm">{bucket.bucket}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display font-black">{formatCurrency(bucket.amount)}</div>
                          <div className="text-xs text-muted-foreground font-medium">{bucket.count} invoice{bucket.count !== 1 ? "s" : ""}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === "clients" && (
        <ClientPerformance report={reports} />
      )}

      {activeTab === "reminders" && (
        <ReminderEffectiveness report={reports} />
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ClientPerformance({ report }: { report: ReportData | null }) {
  const clients = report?.clientPerformance || [];

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={<Users />}
        title="No client data"
        description="Add clients and invoices to see performance analytics."
      />
    );
  }

  const sortedByLate = [...clients].sort((a, b) => b.avgDaysToPay - a.avgDaysToPay);

  return (
    <div className="space-y-6">
      <ChartCard title="Average Days to Pay by Client">
        <ResponsiveContainer width="100%" height={Math.max(200, clients.length * 50)}>
          <BarChart data={sortedByLate} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700 }} tickLine={false} width={120} />
            <Tooltip
              contentStyle={{
                background: "var(--color-background)",
                border: "2px solid var(--color-foreground)",
                borderRadius: "12px",
                fontWeight: 600,
              }}
              formatter={(value) => [`${Number(value)} days`, "Avg Days to Pay"]}
            />
            <Bar dataKey="avgDaysToPay" radius={[0, 6, 6, 0]}>
              {sortedByLate.map((c) => (
                <Cell
                  key={c.id}
                  fill={c.avgDaysToPay > 60 ? "#ef4444" : c.avgDaysToPay > 30 ? "#f59e0b" : "#22c55e"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Card>
        <CardHeader><CardTitle className="text-lg">Client Details</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-2xl border-2 border-foreground overflow-hidden">
            <div className="grid grid-cols-6 gap-3 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-foreground bg-muted/50">
              <div>Client</div>
              <div>Invoiced</div>
              <div>Paid</div>
              <div>Outstanding</div>
              <div>Avg Days</div>
              <div>Overdue</div>
            </div>
            {clients.map((c) => (
              <div key={c.id} className="grid grid-cols-6 gap-3 p-3 text-sm border-b-2 border-foreground last:border-0">
                <div className="font-bold">{c.name}</div>
                <div>{formatCurrency(c.totalInvoiced)}</div>
                <div className="text-quaternary font-bold">{formatCurrency(c.totalPaid)}</div>
                <div className="text-destructive font-bold">{formatCurrency(c.totalOutstanding)}</div>
                <div className={c.avgDaysToPay > 45 ? "text-destructive font-bold" : ""}>{c.avgDaysToPay}d</div>
                <div>{c.overdueCount}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReminderEffectiveness({ report }: { report: ReportData | null }) {
  const re = report?.reminderEffectiveness;

  if (!re || re.totalReminders === 0) {
    return (
      <EmptyState
        icon={<Bell />}
        title="No reminder data yet"
        description="Reminders will be tracked automatically as they are sent."
      />
    );
  }

  const toneData = re.byTone.map((t) => ({
    name: t.tone.charAt(0) + t.tone.slice(1).toLowerCase(),
    sent: t.sent,
    delivered: t.delivered,
    opened: t.opened,
    deliveryRate: t.deliveryRate,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="group hover:-translate-y-[2px] hover:shadow-hard-lg">
          <CardContent className="pt-6 text-center">
            <div className="font-display font-black text-3xl tabular-nums">{re.totalReminders}</div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Total Sent</p>
          </CardContent>
        </Card>
        <Card className="group hover:-translate-y-[2px] hover:shadow-hard-lg">
          <CardContent className="pt-6 text-center">
            <div className="font-display font-black text-3xl text-quaternary tabular-nums">{re.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Delivery Rate</p>
          </CardContent>
        </Card>
        <Card className="group hover:-translate-y-[2px] hover:shadow-hard-lg">
          <CardContent className="pt-6 text-center">
            <div className="font-display font-black text-3xl tabular-nums">{re.openRate}%</div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Open Rate</p>
          </CardContent>
        </Card>
        <Card className="group hover:-translate-y-[2px] hover:shadow-hard-lg">
          <CardContent className="pt-6 text-center">
            <div className="font-display font-black text-3xl tabular-nums">{re.avgRemindersToPay}</div>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Avg to Get Paid</p>
          </CardContent>
        </Card>
      </div>

      <ChartCard title="Effectiveness by Tone">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={toneData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} tickLine={false} />
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
            <Bar dataKey="sent" name="Sent" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="delivered" name="Delivered" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="opened" name="Opened" fill="#a78bfa" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <Card>
        <CardHeader><CardTitle className="text-lg">Tone Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-2xl border-2 border-foreground overflow-hidden">
            <div className="grid grid-cols-5 gap-3 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-foreground bg-muted/50">
              <div>Tone</div>
              <div>Sent</div>
              <div>Delivered</div>
              <div>Opened</div>
              <div>Delivery %</div>
            </div>
            {toneData.map((t) => (
              <div key={t.name} className="grid grid-cols-5 gap-3 p-3 text-sm border-b-2 border-foreground last:border-0">
                <div className="font-bold">{t.name}</div>
                <div>{t.sent}</div>
                <div>{t.delivered}</div>
                <div>{t.opened}</div>
                <div className="font-bold">{t.deliveryRate}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
