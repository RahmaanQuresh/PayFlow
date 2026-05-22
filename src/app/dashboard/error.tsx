"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={2.5} />
      </div>
      <h1 className="font-display font-extrabold text-xl mb-2">Something went wrong</h1>
      <p className="text-muted-foreground font-medium text-sm mb-6 text-center max-w-xs">
        {error.message || "Failed to load this page. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>Try Again</Button>
        <Link href="/dashboard"><Button variant="gradient">Dashboard</Button></Link>
      </div>
    </div>
  );
}
