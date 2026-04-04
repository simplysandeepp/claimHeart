"use client";

import { useEffect, useState } from "react";

export default function usePageReady(delay = 0) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let frame = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (delay > 0) {
      timeout = setTimeout(() => setReady(true), delay);
    } else {
      frame = window.requestAnimationFrame(() => setReady(true));
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (timeout) clearTimeout(timeout);
    };
  }, [delay]);

  return ready;
}
