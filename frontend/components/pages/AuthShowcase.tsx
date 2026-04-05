"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight } from "lucide-react";
import ClaimHeartLogo from "@/components/ui/ClaimHeartLogo";
import { AUTH_IMAGE_SET, AUTH_ROLE_META } from "@/components/pages/authMeta";
import type { UserRole } from "@/types";

type AuthShowcaseProps = {
  mode: "login" | "signup";
  role: UserRole;
  className?: string;
};

const SCREEN_COPY = {
  login: {
    badge: "Role-based access",
    title: "Secure access across the full claims journey.",
    description: "Designed for patients, hospitals, and insurers to enter the same platform with the right context, controls, and confidence.",
    ribbon: "Production-ready auth",
  },
  signup: {
    badge: "Structured onboarding",
    title: "Provision the right claims workspace from day one.",
    description: "Capture only the essential setup data needed to model patient access, hospital operations, and insurer review flows.",
    ribbon: "Workspace-aware setup",
  },
} as const;

const marqueeImages = [...AUTH_IMAGE_SET, ...AUTH_IMAGE_SET];

export default function AuthShowcase({ mode, role, className = "" }: AuthShowcaseProps) {
  const roleMeta = AUTH_ROLE_META[role];
  const RoleIcon = roleMeta.icon;
  const screen = SCREEN_COPY[mode];
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % AUTH_IMAGE_SET.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      className={[
        "relative overflow-hidden bg-[linear-gradient(160deg,#0a1727_0%,#133a63_46%,#1f5a8f_100%)] p-5 text-white sm:p-6 lg:p-7",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.14),transparent_30%)]" />
      <div className="absolute -left-16 top-12 h-44 w-44 rounded-full bg-white/8 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-sky-200/10 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col gap-5">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-1 backdrop-blur">
                <ClaimHeartLogo className="h-full w-full" imageClassName="scale-110" priority={mode === "login"} />
              </div>
              <div>
                <p className="text-lg font-bold tracking-[-0.04em] text-white sm:text-xl">ClaimHeart</p>
                <p className="text-sm text-white/70">Claims platform</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
              <Activity className="h-3.5 w-3.5" />
              {screen.badge}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
              <RoleIcon className="h-3.5 w-3.5" />
              {roleMeta.eyebrow}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
              <ArrowUpRight className="h-3.5 w-3.5 text-sky-200" />
              {screen.ribbon}
            </div>
          </div>

          <h1 className="max-w-2xl text-[1.95rem] font-bold tracking-[-0.05em] text-white sm:text-[2.15rem] xl:text-[2.3rem]">
            {screen.title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px] sm:leading-7">
            {screen.description}
          </p>

          <div className="flex flex-wrap gap-2.5">
            {roleMeta.bullets.slice(0, 2).map((item) => (
              <div key={item} className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-2 text-sm font-medium text-white/82 backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto rounded-[1.55rem] border border-white/12 bg-white/8 p-3 shadow-[0_22px_50px_rgba(8,15,30,0.25)] backdrop-blur-md sm:p-4">
          <div className="relative overflow-hidden rounded-[1.45rem] border border-white/10 bg-slate-950/20">
            <motion.div
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="flex"
            >
              {AUTH_IMAGE_SET.map((image, index) => (
                <div key={image.src} className="relative h-56 w-full shrink-0 sm:h-64 lg:h-72 xl:h-[19rem]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 1279px) 100vw, 46vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,30,0.10),rgba(8,15,30,0.16)_35%,rgba(8,15,30,0.72)_100%)]" />
                  <motion.div
                    key={`${image.src}-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: index === activeIndex ? 1 : 0.7, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                    className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4"
                  >
                    <div className="max-w-lg rounded-[1.15rem] border border-white/12 bg-slate-950/45 p-3.5 backdrop-blur-md sm:p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/90">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        Sliding window
                      </div>
                      <p className="mt-3 inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                        {image.label}
                      </p>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {AUTH_IMAGE_SET.map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-9 bg-white" : "w-2.5 bg-white/35 hover:bg-white/55"}`}
                  aria-label={`Show ${image.label}`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Responsive slider</p>
          </div>

          <div className="mt-3 overflow-hidden rounded-[1.3rem] border border-white/10 bg-slate-950/22 p-2.5">
            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="flex min-w-max gap-2.5"
            >
              {marqueeImages.map((image, index) => (
                <div key={`${image.src}-${index}`} className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-[1rem] border border-white/10 sm:h-24 sm:w-36">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="144px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
                  <div className="absolute bottom-2 left-2 rounded-full border border-white/10 bg-slate-950/45 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {image.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


