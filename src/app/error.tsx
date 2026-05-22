"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive mb-6">
            <AlertCircle className="h-10 w-10 text-destructive" strokeWidth={2.5} />
          </div>
          <h1 className="font-display font-extrabold text-2xl mb-2">Something went wrong</h1>
          <p className="text-muted-foreground font-medium mb-6 text-sm">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={reset}>Try Again</Button>
            <Link href="/"><Button variant="gradient">Go Home</Button></Link>
          </div>
        </div>
      </body>
    </html>
  );
}
