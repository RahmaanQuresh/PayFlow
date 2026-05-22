"use client";

import { useState, useEffect, useCallback } from "react";
import type { Client } from "@/types";

export function useClients(opts: { search?: string; page?: number; limit?: number } = {}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (opts.search) params.set("search", opts.search);
      if (opts.page) params.set("page", String(opts.page));
      if (opts.limit) params.set("limit", String(opts.limit));

      const res = await fetch(`/api/clients?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch clients");
      setClients(data.data || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [opts.search, opts.page, opts.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClients();
  }, [fetchClients]);

  return { clients, total, loading, error, refetch: fetchClients };
}

export function useClient(id: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch client");
      setClient(data.client || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClient();
  }, [fetchClient]);

  return { client, loading, error, refetch: fetchClient };
}
