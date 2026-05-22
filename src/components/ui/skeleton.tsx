import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse-soft rounded-xl border-2 border-foreground bg-muted",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
