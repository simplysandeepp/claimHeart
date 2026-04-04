"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDashboardPath, getRole } from "@/lib/api/auth";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    getRole().then((role) => {
      router.replace(getDashboardPath(role));
    });
  }, [router]);

  return <div className="text-sm text-[var(--ch-muted)]">Loading dashboard...</div>;
}
