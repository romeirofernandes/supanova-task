import { useEffect, useRef, useState } from "react";
import { preview, type PreviewResponse } from "@/lib/api";
import type { Weights } from "@/lib/weights";

export function usePreview(projectId: string, weights: Weights) {
  const [data, setData] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await preview(projectId, weights);
        setData(res);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Preview failed");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [projectId, weights]);

  return { data, loading, error };
}
