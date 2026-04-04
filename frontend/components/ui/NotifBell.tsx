"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bell, BellRing, CheckCheck } from "lucide-react";
import { formatDateTime, formatRelativeTime, notificationClasses } from "@/lib/claimUi";
import { useAppStore } from "@/store/useAppStore";
import type { AppUser, UserRole } from "@/types";

export default function NotifBell({ role, user }: { role: UserRole; user: AppUser | null }) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const notifications = useAppStore((state) => state.notifications);
  const markAllNotificationsRead = useAppStore((state) => state.markAllNotificationsRead);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => notifications.filter((notification) => {
    const matchesRole = notification.targetRole === role || notification.targetRole === "all";
    const matchesUser = !notification.targetUserId || notification.targetUserId === user?.id || notification.targetUserId === user?.patientId;
    return matchesRole && matchesUser;
  }), [notifications, role, user]);

  const unread = filtered.filter((notification) => !notification.read).length;
  const previewItems = filtered.slice(0, 4);
  const notificationsHref = `/dashboard/${role}/notifications`;
  const isNotificationsPage = pathname === notificationsHref;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (isNotificationsPage) {
            return;
          }
          setOpen((current) => !current);
        }}
        className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
        aria-label="Open notifications"
        aria-expanded={isNotificationsPage ? false : open}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open && !isNotificationsPage ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-[80] mt-3 w-[min(92vw,26rem)] overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]"
          >
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-[-0.03em] text-slate-900">Notifications</p>
                    <p className="mt-1 text-sm text-[var(--ch-muted)]">Quick reference for recent updates. Open the detailed page for the full notification history.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => markAllNotificationsRead(role, user?.patientId ?? user?.id)}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
              {previewItems.length === 0 ? (
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 text-sm text-[var(--ch-muted)]">No notifications yet.</div>
              ) : (
                previewItems.map((notification, index) => (
                  <motion.div key={notification.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }}>
                    <Link
                      href={`${notificationsHref}?notification=${notification.id}`}
                      onClick={() => setOpen(false)}
                      className={`block rounded-[1.35rem] border border-slate-200 border-l-4 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] ${notificationClasses[notification.type]} ${notification.read ? "bg-white" : "bg-white/90"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">{notification.title}</p>
                          <p className="mt-2 text-xs text-[var(--ch-subtle)]">{formatRelativeTime(notification.time)} ? {formatDateTime(notification.time)}</p>
                        </div>
                        {!notification.read ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ch-blue)]" /> : null}
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-[var(--ch-muted)]">{filtered.length > previewItems.length ? `${filtered.length - previewItems.length} more updates available` : "Open the full page for detail and claim links"}</p>
                <Link href={notificationsHref} onClick={() => setOpen(false)} className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[var(--ch-blue)] px-4 text-sm font-semibold text-white transition-all hover:opacity-95">
                  Open notifications
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
