"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ReminderSequence } from "@/types";

export function useReminders() {
  const [sequences, setSequences] = useState<ReminderSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchSequences = useCallback(async () => {
    if (!mounted.current) return;
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
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSequences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sequences, loading, error, refetch: fetchSequences };
}

export function useSequence(id: string) {
  const [sequence, setSequence] = useState<ReminderSequence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchSequence = useCallback(async () => {
    if (!mounted.current) return;
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
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSequence();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sequence, loading, error, refetch: fetchSequence };
}
