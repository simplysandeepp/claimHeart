"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useSyncStore } from "@/hooks/useSyncStore";
import { getCurrentUser, logout } from "@/lib/api/auth";
import { getActiveDemoCaseId, getDefaultDemoCaseId, resolveViewerForRole, type DemoCaseId } from "@/lib/demoWorkflow";
import LiveBadge from "@/components/ui/LiveBadge";
import NotifBell from "@/components/ui/NotifBell";
import PageTransition from "@/components/ui/PageTransition";
import ClaimHeartLogo from "@/components/ui/ClaimHeartLogo";
import type { AppUser, UserRole } from "@/types";

const NAV_ITEMS: Record<UserRole, { label: string; href: string; icon: typeof LayoutDashboard }[]> = {
  insurer: [
    { label: "Dashboard", href: "/dashboard/insurer", icon: LayoutDashboard },
    { label: "Claims Queue", href: "/claims", icon: FileText },
    { label: "Notifications", href: "/dashboard/insurer/notifications", icon: Bell },
    { label: "Policy Library", href: "/policies", icon: BookOpen },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  hospital: [
    { label: "Dashboard", href: "/dashboard/hospital", icon: LayoutDashboard },
    { label: "Notifications", href: "/dashboard/hospital/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  patient: [
    { label: "Dashboard", href: "/dashboard/patient", icon: LayoutDashboard },
    { label: "Notifications", href: "/dashboard/patient/notifications", icon: Bell },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

function SidebarContent({
  navItems,
  pathname,
  role,
  user,
  collapsed,
  activeNavHref,
}: {
  navItems: { label: string; href: string; icon: typeof LayoutDashboard }[];
  pathname: string;
  role: UserRole;
  user: AppUser | null;
  collapsed: boolean;
  activeNavHref: string | null;
}) {
  return (
    <>
      <div className={`flex h-[72px] items-center border-b border-white/10 ${collapsed ? "justify-center px-3" : "gap-3 px-5"}`}>
        <div className="flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-xl bg-[#f7fbff] p-0.5">
          <ClaimHeartLogo className="h-full w-full" imageClassName="scale-105" />
        </div>
        <div className={`overflow-hidden transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
          <p className="whitespace-nowrap text-lg font-bold tracking-[-0.03em] text-white">ClaimHeart</p>
          <p className="whitespace-nowrap text-[11px] text-white/65">Transparency Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-5">
        {navItems.map((item) => {
          const active = item.href === activeNavHref;
          return (
            <motion.div key={item.href} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={item.href}
                className={`flex items-center rounded-2xl py-3 text-[15px] font-semibold transition-all ${collapsed ? "justify-center px-3" : "gap-3 px-4"} ${active ? "bg-white/18 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" : "text-white/72 hover:bg-white/10 hover:text-white"}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className={`flex items-center rounded-2xl bg-white/10 py-3 ${collapsed ? "justify-center px-2" : "gap-3 px-4"}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ch-blue)] text-white">
            <User className="h-4 w-4" />
          </div>
          <div className={`min-w-0 overflow-hidden transition-all duration-200 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <p className="truncate whitespace-nowrap text-sm font-semibold text-white">{user?.name ?? "Loading user"}</p>
            <p className="whitespace-nowrap text-[11px] capitalize text-white/60">{role}</p>
          </div>
          {!collapsed ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => logout()}
              className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition-all hover:bg-white/14"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          ) : null}
        </div>

      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useSyncStore();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<DemoCaseId>(getDefaultDemoCaseId());

  const routeRole: UserRole | null = pathname.startsWith("/dashboard/patient")
    ? "patient"
    : pathname.startsWith("/dashboard/hospital")
      ? "hospital"
      : pathname.startsWith("/dashboard/insurer")
        ? "insurer"
        : null;
  const role = routeRole ?? user?.role ?? "insurer";

  useEffect(() => {
    getCurrentUser().then(setUser);
    setActiveCaseId(getActiveDemoCaseId());
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [mobileMenuOpen]);

  const navItems = useMemo(() => NAV_ITEMS[role], [role]);
  const viewer = useMemo(() => resolveViewerForRole(role, user, activeCaseId), [activeCaseId, role, user]);
  const activeNavHref = useMemo(() => {
    const matches = navItems.filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    if (matches.length === 0) {
      return null;
    }

    return matches.sort((left, right) => right.href.length - left.href.length)[0]?.href ?? null;
  }, [navItems, pathname]);
  const pageTitle = navItems.find((item) => item.href === activeNavHref)?.label ?? "ClaimHeart";
  const desktopSidebarWidth = collapsed ? "lg:pl-[4.75rem]" : "lg:pl-[17rem]";
  const sidebarWidth = collapsed ? "w-[4.75rem]" : "w-[17rem]";
  const togglePosition = collapsed ? "left-[4.75rem]" : "left-[17rem]";
  const primaryActionHref = role === "insurer" ? "/claims" : `/dashboard/${role}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--ch-surface)]">
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.26, ease: "easeOut" }}
            id="mobile-dashboard-sidebar"
            className="fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col bg-[var(--ch-blue-dark)] shadow-[2px_0_16px_rgba(47,111,178,0.16)] lg:hidden"
          >
            <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-xl bg-[#f7fbff] p-0.5">
          <ClaimHeartLogo className="h-full w-full" imageClassName="scale-105" />
                </div>
                <div>
                  <p className="whitespace-nowrap text-lg font-bold tracking-[-0.03em] text-white">ClaimHeart</p>
                  <p className="whitespace-nowrap text-[11px] text-white/65">Transparency Platform</p>
                </div>
              </div>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="rounded-xl p-2 text-white/80 transition hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
              {navItems.map((item) => {
                const active = item.href === activeNavHref;
                return (
                  <motion.div key={`mobile-${item.href}`} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}>
                    <Link href={item.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold transition-all ${active ? "bg-white/18 text-white" : "text-white/72 hover:bg-white/10 hover:text-white"}`}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ch-blue)] text-white">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{viewer?.name ?? "Loading user"}</p>
                  <p className="text-[11px] capitalize text-white/60">{role}</p>
                </div>
                <motion.button type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => logout()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white transition-all hover:bg-white/14" title="Logout" aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-50 hidden flex-col bg-[var(--ch-blue-dark)] shadow-[2px_0_16px_rgba(47,111,178,0.16)] transition-[width] duration-200 lg:flex ${sidebarWidth}`}>
        <SidebarContent navItems={navItems} pathname={pathname} role={role} user={viewer} collapsed={collapsed} activeNavHref={activeNavHref} />
      </aside>

      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className={`fixed top-[78px] z-[60] hidden h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.14)] transition-all duration-200 hover:bg-slate-50 lg:flex ${togglePosition}`} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
      </motion.button>

      <div className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ${desktopSidebarWidth}`}>
        <header className="sticky top-0 z-40 flex min-h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="button"
              className="rounded-xl p-2 text-slate-500 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-dashboard-sidebar"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
            <span className="hidden text-slate-400 lg:inline-flex"><X className="h-4 w-4" /></span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            <span className="truncate text-xl font-bold tracking-[-0.03em] text-slate-800 sm:text-2xl">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Search claims, patients...</span>
            </div>
            <div className="hidden sm:block"><LiveBadge /></div>
            <NotifBell role={role} user={viewer} />
            <Link href={primaryActionHref} className="hidden h-10 items-center rounded-2xl bg-[var(--ch-blue)] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,142,219,0.18)] transition-all hover:opacity-95 sm:flex sm:h-12 sm:px-5">
              {role === "insurer" ? "Open Queue" : role === "hospital" ? "Submit Claim" : "My Claims"}
            </Link>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
