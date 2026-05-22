"use client";

import { useState, useEffect, useCallback } from "react";
import type { Invoice } from "@/types";

export function usePortal(token: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invoice not found");
      setInvoice(data.invoice || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPortal();
  }, [fetchPortal]);

  return { invoice, loading, error };
}
