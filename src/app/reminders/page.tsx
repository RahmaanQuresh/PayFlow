"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReminders } from "@/hooks/use-reminders";
import { Plus, Bell, Edit, AlertCircle } from "lucide-react";

const toneGradients: Record<string, string> = {
  friendly: "from-primary to-secondary",
  formal: "from-secondary to-rose-400",
  direct: "from-tertiary to-orange-400",
  legal: "from-destructive to-rose-400",
};

function RemindersSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="relative pl-8">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-foreground/15" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="group relative">
              <div className="absolute -left-8 top-6 h-4 w-4 rounded-full bg-muted border-2 border-foreground" />
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RemindersPage() {
  const { sequences, loading, error, refetch } = useReminders();

  if (loading) return <RemindersSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
        </div>
        <h2 className="font-display font-extrabold text-xl">Failed to load reminders</h2>
        <p className="text-muted-foreground font-medium mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={refetch}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Reminder Sequences</h1>
          <p className="text-muted-foreground font-medium mt-1">Configure automated payment reminders</p>
        </div>
        <Link href="/reminders/new">
          <Button variant="gradient"><Plus className="h-4 w-4 mr-2" />New Sequence</Button>
        </Link>
      </div>

      {sequences.length === 0 ? (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-foreground shadow-hard">
              <Bell className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl">No reminder sequences</h3>
              <p className="text-sm text-muted-foreground font-medium mt-1 max-w-xs">
                Set up automated payment reminders to follow up with clients.
              </p>
            </div>
            <Link href="/reminders/new">
              <Button variant="gradient"><Plus className="h-4 w-4 mr-2" />Create Sequence</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-foreground/15" />
          <div className="space-y-4">
            {sequences.map((seq) => (
              <Card key={seq.id} className="group hover:-translate-y-[2px] hover:shadow-hard-lg relative">
                <div className={`absolute -left-8 top-6 h-4 w-4 rounded-full bg-gradient-to-br ${toneGradients.friendly} border-2 border-foreground shadow-hard-sm`} />
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-5">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary border-2 border-foreground shadow-hard-sm">
                      <Bell className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold">{seq.name}</span>
                        {seq.isDefault && (
                          <span className="rounded-full bg-gradient-to-r from-tertiary to-orange-400 text-foreground border-2 border-foreground px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-hard-sm">Default</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-1">{seq.description}</p>
                      <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">
                        {(seq.steps?.length || 0)} steps
                      </p>
                    </div>
                  </div>
                  <Link href={`/reminders/${seq.id}/edit`}>
                    <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
