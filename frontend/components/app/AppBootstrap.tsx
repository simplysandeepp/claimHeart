"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { seedIfEmpty } from "@/lib/mockData";

export default function AppBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}
