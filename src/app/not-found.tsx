import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted border-2 border-foreground mb-6">
          <FileQuestion className="h-10 w-10 text-muted-foreground" strokeWidth={2.5} />
        </div>
        <h1 className="font-display font-extrabold text-4xl mb-2">404</h1>
        <h2 className="font-display font-extrabold text-xl mb-2">Page Not Found</h2>
        <p className="text-muted-foreground font-medium mb-6 text-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="gradient">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
