"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getCurrentUser } from "@/lib/api/auth";
import { getNotificationHref, notificationClasses, formatDateTime, formatRelativeTime } from "@/lib/claimUi";
import { useAppStore } from "@/store/useAppStore";
import { SkeletonCard } from "@/components/ui/Skeleton";
import usePageReady from "@/hooks/usePageReady";
import type { AppUser, UserRole } from "@/types";

export default function NotificationsPage({ role }: { role: UserRole }) {
  const searchParams = useSearchParams();
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);
  const [user, setUser] = useState<AppUser | null>(null);
  const ready = usePageReady();
  const selectedNotificationId = searchParams.get("notification");
  const selectedRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const filtered = useMemo(() => notifications.filter((notification) => {
    const matchesRole = notification.targetRole === role || notification.targetRole === "all";
    const matchesUser = !notification.targetUserId || notification.targetUserId === user?.id || notification.targetUserId === user?.patientId;
    return matchesRole && matchesUser;
  }), [notifications, role, user]);

  useEffect(() => {
    if (!ready || !selectedNotificationId) {
      return;
    }

    const selectedNotification = filtered.find((notification) => notification.id === selectedNotificationId);
    if (!selectedNotification) {
      return;
    }

    if (!selectedNotification.read) {
      markNotificationRead(selectedNotification.id);
    }

    const timer = window.setTimeout(() => {
      selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [filtered, markNotificationRead, ready, selectedNotificationId]);

  if (!ready) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} lines={2} />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[1.8rem] font-bold tracking-[-0.04em] text-slate-900 sm:text-[2rem]">Notifications</h1>
          <p className="mt-2 text-sm text-[var(--ch-muted)] sm:text-base md:text-lg">All transparency events relevant to your role.</p>
        </div>
        <button type="button" onClick={() => markAllNotificationsRead(role, user?.patientId ?? user?.id)} className="h-10 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 sm:h-12 sm:py-3">Mark all read</button>
      </div>
      <div className="space-y-4">
        {filtered.length === 0 ? <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"><p className="text-sm text-[var(--ch-muted)]">No notifications yet.</p></div> : filtered.map((notification, index) => {
          const isSelected = notification.id === selectedNotificationId;
          return (
            <motion.div
              key={notification.id}
              ref={isSelected ? selectedRef : null}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.24, delay: index * 0.05 }}
              onClick={() => markNotificationRead(notification.id)}
              className={`cursor-pointer rounded-[1.5rem] border border-slate-200 border-l-4 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-5 ${notificationClasses[notification.type]} ${notification.read ? "bg-white" : "bg-white/90"} ${isSelected ? "ring-2 ring-[var(--ch-blue)] ring-offset-2" : ""}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{notification.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ch-muted)]">{notification.message}</p>
                  <p className="mt-3 text-xs text-[var(--ch-subtle)]">{formatDateTime(notification.time)} ? {formatRelativeTime(notification.time)}</p>
                </div>
                {notification.claimId ? <Link href={getNotificationHref(role, notification.claimId)} className="text-sm font-semibold text-[var(--ch-blue)] transition-all hover:opacity-80">View claim ?</Link> : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
