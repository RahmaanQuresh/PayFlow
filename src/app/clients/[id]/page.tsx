"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "@/hooks/use-clients";
import { formatCurrency } from "@/lib/utils/format";
import { ArrowLeft, Edit, Mail, Phone, Building, AlertCircle } from "lucide-react";

function ClientDetailSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-48 mb-1" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </CardHeader>
          <CardContent>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 p-3 border-b-2 border-foreground last:border-0">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { client, loading, error } = useClient(id);

  if (loading) return <ClientDetailSkeleton />;

  if (error || !client) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">{error || "Client not found"}</h2>
        <Link href="/clients" className="mt-4">
          <Button variant="outline">Back to Clients</Button>
        </Link>
      </div>
    );
  }

  const invoices = (client as unknown as { invoices?: Array<{ id: string; invoiceNumber: string; status: string; total: number; dueDate: string }> }).invoices || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/clients">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="font-display font-extrabold text-2xl">{client.name}</h1>
            {client.company && <p className="text-muted-foreground font-medium">{client.company}</p>}
          </div>
        </div>
        <Link href={`/clients/${client.id}/edit`}>
          <Button variant="outline"><Edit className="h-4 w-4 mr-2" />Edit</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-2xl">{formatCurrency(Number(client.totalInvoiced))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-2xl">{formatCurrency(Number(client.totalPaid))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display font-black text-2xl">{formatCurrency(Number(client.totalOutstanding))}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold">{client.email}</span>
            </div>
            {client.company && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{client.company}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{client.phone}</span>
              </div>
            )}
            {client.notes && (
              <div className="mt-4 p-4 rounded-xl border-2 border-foreground bg-muted/30">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Notes</div>
                <div className="text-sm font-medium whitespace-pre-wrap">{client.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <Link href={`/invoices/new?clientId=${client.id}`}>
              <Button variant="outline" size="sm">New Invoice</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground font-medium">No invoices for this client yet.</p>
                <Link href={`/invoices/new?clientId=${client.id}`} className="mt-3 inline-block">
                  <Button variant="gradient" size="sm">Create First Invoice</Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-foreground overflow-hidden shadow-hard-sm">
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-4 gap-4 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-foreground bg-muted/50 min-w-[500px]">
                    <div>Invoice</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div>Due Date</div>
                  </div>
                  {invoices.map((inv) => (
                    <Link
                      key={inv.id}
                      href={`/invoices/${inv.id}`}
                      className="grid grid-cols-4 gap-4 p-3 text-sm hover:bg-tertiary/5 transition-colors border-b-2 border-foreground last:border-0 font-medium min-w-[500px]"
                    >
                    <div className="font-bold">{inv.invoiceNumber}</div>
                    <div className="font-bold tabular-nums">{formatCurrency(Number(inv.total))}</div>
                    <div>
                      <span className={`inline-flex items-center rounded-full border-2 border-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === "paid" ? "bg-gradient-to-r from-quaternary to-emerald-400 text-white" :
                        inv.status === "overdue" ? "bg-gradient-to-r from-destructive to-rose-400 text-white" :
                        "bg-card text-foreground"
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </Link>
                ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
