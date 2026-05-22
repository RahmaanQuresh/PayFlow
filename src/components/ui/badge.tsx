import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-foreground px-3 py-0.5 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-secondary text-white shadow-hard-sm",
        secondary:
          "bg-gradient-to-r from-secondary to-rose-300 text-foreground shadow-hard-sm",
        destructive:
          "bg-gradient-to-r from-destructive to-rose-400 text-white shadow-hard-sm",
        outline:
          "bg-card text-foreground",
        danger:
          "bg-gradient-to-r from-destructive to-red-500 text-white shadow-hard-sm",
        success:
          "bg-gradient-to-r from-quaternary to-emerald-400 text-white shadow-hard-sm",
        warning:
          "bg-gradient-to-r from-tertiary to-orange-400 text-foreground shadow-hard-sm",
        info:
          "bg-gradient-to-r from-info to-blue-400 text-white shadow-hard-sm",
        purple:
          "bg-gradient-to-r from-primary to-violet-400 text-white shadow-hard-sm",
        ghost:
          "border-transparent bg-muted text-muted-foreground shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
