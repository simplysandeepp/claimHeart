"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import AuthProviderButtons, {
  AUTH_PROVIDER_LABELS,
  type AuthProvider,
} from "@/components/pages/AuthProviderButtons";
import AuthShowcase from "@/components/pages/AuthShowcase";
import { AUTH_ROLE_META } from "@/components/pages/authMeta";
import ClaimHeartLogo from "@/components/ui/ClaimHeartLogo";
import type { UserRole } from "@/types";
import { toast } from "sonner";

const credentials: Record<UserRole, { email: string; password: string }> = {
  patient: { email: "priya@test.com", password: "patient123" },
  hospital: { email: "apollo@test.com", password: "hospital123" },
  insurer: { email: "star@test.com", password: "insurer123" },
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("insurer");
  const [email, setEmail] = useState(credentials.insurer.email);
  const [password, setPassword] = useState(credentials.insurer.password);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRole = (nextRole: UserRole) => {
    setRole(nextRole);
    setEmail(credentials[nextRole].email);
    setPassword(credentials[nextRole].password);
  };

  const applyDemoCredentials = () => {
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
    toast.success(`${AUTH_ROLE_META[role].label} demo credentials loaded.`);
  };

  const handleSocialLogin = (provider: AuthProvider) => {
    toast.info(
      `${AUTH_PROVIDER_LABELS[provider]} sign-in is available as a UI entry point and can be connected to your production identity provider.`,
    );
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Enter the role, email, and password to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await loginUser(email, password, role);
      if (!user) {
        toast.error("Invalid demo credentials for that role.");
        return;
      }

      toast.success(`Welcome back to the ${AUTH_ROLE_META[user.role].label.toLowerCase()} workspace.`);
      router.push(`/dashboard/${user.role}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eaf3fb_0%,#f8fafc_42%,#f1f5f9_100%)] p-3 sm:p-4 xl:h-[100dvh] xl:overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl xl:h-full">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:h-full xl:grid-cols-[1.02fr_0.98fr]">
          <div className="order-1 flex bg-white/96 px-5 py-5 sm:px-7 lg:px-8 xl:order-2 xl:h-full xl:min-h-0">
            <div className="mx-auto flex w-full max-w-xl flex-col justify-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--ch-blue-border)] bg-[var(--ch-blue-light)] p-1">
                  <ClaimHeartLogo className="h-full w-full" imageClassName="scale-110" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ch-blue-dark)]">
                    Secure Login
                  </p>
                  <h2 className="text-[1.8rem] font-bold tracking-[-0.05em] text-slate-900 sm:text-[2rem]">
                    Sign in to ClaimHeart
                  </h2>
                </div>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ch-muted)] sm:text-[15px]">
                Sign in with the account type that matches your access level and continue into the right workspace with the correct mock credentials.
              </p>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {(["patient", "hospital", "insurer"] as UserRole[]).map((option) => {
                  const optionMeta = AUTH_ROLE_META[option];
                  const OptionIcon = optionMeta.icon;
                  const active = role === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleRole(option)}
                      className={`rounded-[1.15rem] border p-3 text-left transition-all ${
                        active
                          ? "border-[var(--ch-blue)] bg-[linear-gradient(180deg,rgba(74,142,219,0.12),rgba(255,255,255,0.96))] shadow-[0_12px_22px_rgba(74,142,219,0.14)]"
                          : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${active ? "bg-[var(--ch-blue)] text-white" : "bg-white text-[var(--ch-blue)]"}`}>
                          <OptionIcon className="h-4.5 w-4.5" />
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--ch-blue-dark)]">
                          {optionMeta.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleLogin} className="mt-4 space-y-3.5">
                <div className="rounded-[1.35rem] border border-[var(--ch-blue-border)] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-3.5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 sm:max-w-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ch-blue-dark)]">
                        Demo access
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-[var(--ch-muted)]">
                        Load the seeded credentials for the selected role or enter the same mock values manually.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={applyDemoCredentials}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                    >
                      Load Demo Credentials
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">
                        Seeded email
                      </p>
                      <p className="mt-1.5 break-all text-sm font-semibold text-slate-900">
                        {credentials[role].email}
                      </p>
                    </div>
                    <div className="rounded-[1.1rem] border border-slate-200 bg-white px-4 py-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">
                        Seeded password
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">{credentials[role].password}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="login-email" className="text-sm font-semibold text-slate-800">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                    placeholder="name@claimheart.ai"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="text-sm font-semibold text-slate-800">
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="login-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-14 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-500 transition-colors hover:text-slate-800"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ch-blue)] px-4 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(74,142,219,0.18)] transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55 sm:text-base"
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-center text-sm text-[var(--ch-muted)]">
                  Need a project-ready demo user?{" "}
                  <Link href="/auth/signup" className="font-semibold text-[var(--ch-blue)]">
                    Create one
                  </Link>
                </p>
              </form>

              <AuthProviderButtons mode="login" onSelect={handleSocialLogin} className="mt-4 border-t border-slate-200 pt-4" />
            </div>
          </div>

          <AuthShowcase
            mode="login"
            role={role}
            className="order-2 border-t border-slate-200/70 xl:order-1 xl:border-r xl:border-r-white/10 xl:border-t-0"
          />
        </div>
      </div>
    </div>
  );
}
