"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/api/auth";
import type { UserRole } from "@/types";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patient");

  const handleSignup = async () => {
    const user = await signupUser({ name, email, password, role });
    router.push(`/dashboard/${user.role}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ch-surface)] px-6 py-10">
      <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-900">Create Demo Account</h1>
        <div className="mt-6 space-y-4">
          <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Name" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" placeholder="Password" type="password" />
          <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none">
            <option value="patient">Patient</option>
            <option value="hospital">Hospital</option>
            <option value="insurer">Insurer</option>
          </select>
          <button type="button" onClick={handleSignup} className="w-full rounded-2xl bg-[var(--ch-blue)] px-4 py-3 text-center text-sm font-semibold text-white">Create Account</button>
          <p className="text-center text-sm text-[var(--ch-muted)]">Already have access? <Link href="/auth/login" className="font-semibold text-[var(--ch-blue)]">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
