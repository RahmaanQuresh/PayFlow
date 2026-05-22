import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-center relative",
        className
      )}
    >
      {icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-foreground shadow-hard">
          <div className="text-white [&>svg]:h-10 [&>svg]:w-10 [&>svg]:stroke-[2.5px]">
            {icon}
          </div>
        </div>
      )}
      <h3 className="font-display font-extrabold text-xl text-foreground">
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
