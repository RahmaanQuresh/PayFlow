"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Invoice } from "@/types";

export function usePortal(token: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchPortal = useCallback(async () => {
    if (!mounted.current) return;
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
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPortal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { invoice, loading, error };
}
