"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface ReportData {
  statusCounts: Record<string, number>;
  statusAmounts: Record<string, number>;
  monthlyRevenue: { month: string; revenue: number; count: number }[];
  overdueTrends: { month: string; count: number; amount: number }[];
  aging: { bucket: string; count: number; amount: number }[];
  clientPerformance: {
    id: string;
    name: string;
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    invoiceCount: number;
    overdueCount: number;
    avgDaysToPay: number;
  }[];
  reminderEffectiveness: {
    totalReminders: number;
    deliveredReminders: number;
    openedReminders: number;
    deliveryRate: number;
    openRate: number;
    avgRemindersToPay: number;
    byTone: {
      tone: string;
      sent: number;
      delivered: number;
      opened: number;
      deliveryRate: number;
    }[];
  };
}

export function useReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchReports = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/overview");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load reports");
      setData(json.data || json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    fetchReports();
    return () => { mounted.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, refetch: fetchReports };
}
