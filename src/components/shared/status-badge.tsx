import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT_MAP: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "ghost"> = {
  draft: "ghost",
  sent: "default",
  viewed: "secondary",
  overdue: "destructive",
  paid: "success",
  partially_paid: "warning",
  canceled: "outline",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] || "ghost";

  return (
    <Badge className={cn(className)} variant={variant}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
