"use client";

import { Suspense } from "react";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PaymentSuccessContent } from "./content";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <LoadingSpinner />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
