"use client";

import { useEffect, useState } from "react";

export default function useRealtimeUpdates<T = unknown>(initialValue: T | null = null) {
  const [value, setValue] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { value, setValue, loading, setLoading, error, setError };
}
