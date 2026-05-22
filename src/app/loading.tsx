import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b-2 border-foreground flex items-center px-6">
        <Skeleton className="h-6 w-28" />
        <div className="flex-1" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-9 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
