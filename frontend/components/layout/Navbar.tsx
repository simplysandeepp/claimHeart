"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ClaimHeartLogo from "@/components/ui/ClaimHeartLogo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Demo", href: "/dashboard" },
  { label: "Docs", href: "#" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-6 md:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[var(--ch-blue-border)] bg-[#e9f2fb] p-0.5">
            <ClaimHeartLogo className="h-full w-full" imageClassName="scale-110" priority />
          </div>
          <p className="text-[1.9rem] font-bold leading-none tracking-[-0.03em] text-slate-800 sm:text-[2rem]">ClaimHeart</p>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-base font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-2xl bg-[var(--ch-blue)] px-6 py-3 text-base font-semibold text-white transition hover:opacity-95 hover:shadow-lg"
          >
            Get Started
          </Link>
        </div>

        <button
          className="rounded-xl p-2.5 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
        </button>
      </nav>

      {mobileOpen && <button type="button" className="fixed inset-0 top-20 z-30 bg-slate-950/20 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <div className={`fixed inset-x-0 top-20 z-40 border-b border-slate-200 bg-white px-4 py-4 shadow-xl transition-transform duration-200 md:hidden ${mobileOpen ? "translate-y-0" : "-translate-y-[120%]"}`}>
        <div className="space-y-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="space-y-2 pt-3">
          <Link
            href="/login"
            className="block h-10 w-full rounded-xl border border-slate-200 py-2 text-center text-sm font-medium text-slate-700"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="block h-10 w-full rounded-xl bg-[var(--ch-blue)] py-2 text-center text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
