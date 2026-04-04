"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Stethoscope, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import type { UserRole } from "@/types";
import { toast } from "sonner";

const credentials: Record<UserRole, { email: string; password: string }> = {
  patient: { email: "priya@test.com", password: "patient123" },
  hospital: { email: "apollo@test.com", password: "hospital123" },
  insurer: { email: "star@test.com", password: "insurer123" },
};

const roleIcons = {
  patient: UserRound,
  hospital: Stethoscope,
  insurer: Shield,
} satisfies Record<UserRole, typeof UserRound>;

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("insurer");
  const [email, setEmail] = useState(credentials.insurer.email);
  const [password, setPassword] = useState(credentials.insurer.password);

  const handleRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setEmail(credentials[nextRole].email);
    setPassword(credentials[nextRole].password);
  };

  const handleLogin = async () => {
    const user = await loginUser(email, password, role);
    if (!user) {
      toast.error("Invalid demo credentials for that role.");
      return;
    }

    router.push(`/dashboard/${user.role}`);
  };

  const ActiveRoleIcon = roleIcons[role];

  return (
    <div className="min-h-screen bg-[var(--ch-surface)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden border-r border-slate-200 bg-[linear-gradient(160deg,#eef4fb_0%,#f8fafc_55%,#e8f1fb_100%)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="inline-flex items-center rounded-full border border-[var(--ch-blue-border)] bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--ch-blue-dark)]">
              ClaimHeart Transparency Platform
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-[-0.05em] text-slate-900">Healthcare claims, made visible for every party.</h1>
            <p className="mt-4 max-w-md text-base leading-8 text-[var(--ch-muted)]">Sign in with a seeded role to review live claim movement across patient, hospital, and insurer dashboards.</p>
          </div>

          <div className="space-y-4">
            {[
              "Live cross-role updates across tabs",
              "AI-supported review with timeline visibility",
              "Demo credentials prefilled for faster testing",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-8 lg:border-0 lg:p-0 lg:shadow-none">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                <ActiveRoleIcon className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-900">ClaimHeart Login</h1>
                <p className="mt-1 text-sm text-[var(--ch-muted)] sm:text-base">Choose a role and use the seeded test credentials.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 sm:grid-cols-3">
                {(["patient", "hospital", "insurer"] as UserRole[]).map((option) => (
                  <button key={option} type="button" onClick={() => handleRole(option)} className={`h-10 rounded-xl px-3 text-sm font-semibold capitalize transition sm:h-12 ${role === option ? "bg-[var(--ch-blue)] text-white" : "bg-white text-slate-600"}`}>
                    {option}
                  </button>
                ))}
              </div>
              <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none sm:h-12 sm:py-3 sm:text-base" placeholder="Email" />
              <input value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none sm:h-12 sm:py-3 sm:text-base" placeholder="Password" type="password" />
              <div className="rounded-2xl border border-[var(--ch-blue-border)] bg-[var(--ch-blue-light)] p-4 text-sm text-[var(--ch-blue-dark)]">
                <p className="font-semibold">Test credentials</p>
                <p className="mt-2 break-all">Email: {credentials[role].email}</p>
                <p>Password: {credentials[role].password}</p>
              </div>
              <button type="button" onClick={handleLogin} className="h-10 w-full rounded-2xl bg-[var(--ch-blue)] px-4 py-2 text-center text-sm font-semibold text-white sm:h-12 sm:py-3">Sign In</button>
              <p className="text-center text-sm text-[var(--ch-muted)]">Need a demo user? <Link href="/auth/signup" className="font-semibold text-[var(--ch-blue)]">Create one</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
