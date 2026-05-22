"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useClients } from "@/hooks/use-clients";
import { formatCurrency } from "@/lib/utils/format";

function ClientsSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="rounded-2xl border-2 border-foreground overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-4 border-b-2 border-foreground bg-muted/50">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b-2 border-foreground last:border-0">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { clients, loading, error, refetch } = useClients();

  if (loading) return <ClientsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load clients</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Clients</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage your clients</p>
        </div>
        <Link href="/clients/new">
          <Button variant="gradient">
            <Plus className="h-4 w-4 mr-2" />Add Client
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="No clients yet"
          description="Add your first client to start creating invoices."
          action={
            <Link href="/clients/new">
              <Button variant="gradient"><Plus className="h-4 w-4 mr-2" />Add Client</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-2xl border-2 border-foreground overflow-hidden shadow-hard-sm">
          <div className="grid grid-cols-4 gap-4 p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-foreground bg-muted/50">
            <div>Name</div>
            <div>Email</div>
            <div>Invoices</div>
            <div>Total Paid</div>
          </div>
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="grid grid-cols-4 gap-4 p-4 text-sm hover:bg-tertiary/5 transition-colors border-b-2 border-foreground last:border-0 font-medium"
            >
              <div>
                <div className="font-bold">{c.name}</div>
                {c.company && <div className="text-xs text-muted-foreground">{c.company}</div>}
              </div>
              <div className="text-muted-foreground">{c.email}</div>
              <div className="font-bold">{c.invoiceCount}</div>
              <div className="font-bold tabular-nums">{formatCurrency(Number(c.totalPaid))}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
