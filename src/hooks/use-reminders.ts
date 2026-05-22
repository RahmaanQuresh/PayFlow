"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReminderSequence } from "@/types";

export function useReminders() {
  const [sequences, setSequences] = useState<ReminderSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSequences = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reminders/sequences");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch sequences");
      setSequences(data.sequences || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  return { sequences, loading, error, refetch: fetchSequences };
}

export function useSequence(id: string) {
  const [sequence, setSequence] = useState<ReminderSequence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSequence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reminders/sequences/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch sequence");
      setSequence(data.sequence || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSequence();
  }, [fetchSequence]);

  return { sequence, loading, error, refetch: fetchSequence };
}
