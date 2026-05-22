"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Payment } from "@/types";

export function usePayments(opts: { page?: number; limit?: number } = {}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchPayments = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.page) params.set("page", String(opts.page));
      if (opts.limit) params.set("limit", String(opts.limit));

      const res = await fetch(`/api/payments/history?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch payments");
      setPayments(data.data || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [opts.page, opts.limit]);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { payments, total, loading, error, refetch: fetchPayments };
}
