"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Invoice } from "@/types";

interface UseInvoicesOptions {
  status?: string;
  clientId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UseInvoicesReturn {
  invoices: Invoice[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useInvoices(opts: UseInvoicesOptions = {}): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchInvoices = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.status) params.set("status", opts.status);
      if (opts.clientId) params.set("clientId", opts.clientId);
      if (opts.search) params.set("search", opts.search);
      if (opts.page) params.set("page", String(opts.page));
      if (opts.limit) params.set("limit", String(opts.limit));

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch invoices");
      setInvoices(data.data || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [opts.status, opts.clientId, opts.search, opts.page, opts.limit]);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { invoices, total, loading, error, refetch: fetchInvoices };
}

export function useInvoice(id: string) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchInvoice = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch invoice");
      setInvoice(data.invoice || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { invoice, loading, error, refetch: fetchInvoice };
}
