"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/api/auth";
import AuthProviderButtons, {
  AUTH_PROVIDER_LABELS,
  type AuthProvider,
} from "@/components/pages/AuthProviderButtons";
import AuthShowcase from "@/components/pages/AuthShowcase";
import { AUTH_ROLE_META } from "@/components/pages/authMeta";
import ClaimHeartLogo from "@/components/ui/ClaimHeartLogo";
import type { UserRole } from "@/types";
import { toast } from "sonner";

type SignupFormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dob: string;
  hospitalRegNo: string;
  organizationType: string;
  city: string;
  website: string;
  organizationCode: string;
};

type RoleFieldConfig = {
  key: keyof SignupFormState;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "password" | "tel" | "date" | "number" | "url";
  inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "url";
};

const commonFieldLabels: Record<UserRole, { name: string; email: string }> = {
  patient: {
    name: "Full name",
    email: "Email address",
  },
  hospital: {
    name: "Organization name",
    email: "Official email",
  },
  insurer: {
    name: "Organization name",
    email: "Official email",
  },
};

const roleFields: Record<UserRole, RoleFieldConfig[]> = {
  patient: [
    { key: "dob", label: "Date of birth", placeholder: "", type: "date" },
  ],
  hospital: [
    { key: "hospitalRegNo", label: "Facility registration number", placeholder: "MH-2019-HC-00472" },
    { key: "organizationType", label: "Organization type", placeholder: "Multi-specialty hospital" },
    { key: "city", label: "Primary city", placeholder: "Mumbai" },
    { key: "website", label: "Website or domain", placeholder: "citycarehospital.com", type: "url", inputMode: "url" },
  ],
  insurer: [
    { key: "organizationCode", label: "License or organization code", placeholder: "IRDAI-TPA-2048" },
    { key: "organizationType", label: "Organization type", placeholder: "Health insurer" },
    { key: "city", label: "Head office city", placeholder: "Chennai" },
    { key: "website", label: "Website or domain", placeholder: "starhealth.in", type: "url", inputMode: "url" },
  ],
};

const initialFormState: SignupFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  dob: "",
  hospitalRegNo: "",
  organizationType: "",
  city: "",
  website: "",
  organizationCode: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("patient");
  const [form, setForm] = useState<SignupFormState>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <T extends keyof SignupFormState>(key: T, value: SignupFormState[T]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSocialSignup = (provider: AuthProvider) => {
    toast.info(
      `${AUTH_PROVIDER_LABELS[provider]} signup is available as a UI entry point and can be connected to your production identity provider.`,
    );
  };

  const validateForm = () => {
    const requiredFields: Record<UserRole, Array<keyof SignupFormState>> = {
      patient: ["name", "email", "phone", "password", "confirmPassword", "dob"],
      hospital: ["name", "email", "phone", "password", "confirmPassword", "hospitalRegNo", "organizationType", "city", "website"],
      insurer: ["name", "email", "phone", "password", "confirmPassword", "organizationCode", "organizationType", "city", "website"],
    };

    const missingField = requiredFields[role].find((fieldKey) => !String(form[fieldKey]).trim());
    if (missingField) {
      toast.error("Complete all required fields for the selected account type.");
      return false;
    }

    if (form.password.length < 8) {
      toast.error("Use at least 8 characters for the password.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Password and confirm password must match.");
      return false;
    }

    if (!acceptTerms) {
      toast.error("Accept the demo terms to create the account.");
      return false;
    }

    return true;
  };

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = await signupUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role,
        dob: role === "patient" ? form.dob : undefined,
        hospitalRegNo: role === "hospital" ? form.hospitalRegNo.trim() : undefined,
        city: role !== "patient" ? form.city.trim() : undefined,
        website: role !== "patient" ? form.website.trim() : undefined,
        organizationType: role !== "patient" ? form.organizationType.trim() : undefined,
        organizationCode: role === "insurer" ? form.organizationCode.trim() : undefined,
      });

      toast.success(`${AUTH_ROLE_META[user.role].label} account created successfully.`);
      router.push(`/dashboard/${user.role}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create the account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRoleFields = roleFields[role];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e7f1fb_0%,#f8fafc_45%,#eef2f7_100%)] p-3 sm:p-4 xl:h-[100dvh] xl:overflow-hidden">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl xl:h-full">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/82 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur xl:h-full xl:grid-cols-[0.96fr_1.04fr]">
          <div className="order-1 flex bg-white/96 px-5 py-5 sm:px-7 lg:px-8 xl:order-1 xl:h-full xl:min-h-0">
            <div className="mx-auto flex w-full max-w-3xl flex-col xl:min-h-0">
              <div className="shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--ch-blue-border)] bg-[var(--ch-blue-light)] p-1">
                    <ClaimHeartLogo className="h-full w-full" imageClassName="scale-110" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ch-blue-dark)]">
                      Project Signup
                    </p>
                    <h2 className="text-[1.65rem] font-bold tracking-[-0.05em] text-slate-900 sm:text-[1.9rem]">
                      Create a ClaimHeart account
                    </h2>
                  </div>
                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ch-muted)] sm:text-[15px]">
                  Start with stable account and organization details, then capture claim-specific and workflow-specific information later inside the platform.
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
                        onClick={() => setRole(option)}
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
              </div>

              <form onSubmit={handleSignup} className="mt-4 flex flex-1 flex-col xl:min-h-0">
                <div className="space-y-4 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-2">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="sm:col-span-2 xl:col-span-3">
                      <label htmlFor="signup-name" className="text-sm font-semibold text-slate-800">
                        {commonFieldLabels[role].name}
                      </label>
                      <input
                        id="signup-name"
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                        placeholder={role === "patient" ? "Priya Sharma" : role === "hospital" ? "City Care Hospital" : "HDFC ERGO General Insurance"}
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-email" className="text-sm font-semibold text-slate-800">
                        {commonFieldLabels[role].email}
                      </label>
                      <input
                        id="signup-email"
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                        placeholder={role === "patient" ? "priya@example.com" : "ops@claimheart.ai"}
                        type="email"
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-phone" className="text-sm font-semibold text-slate-800">
                        Contact number
                      </label>
                      <input
                        id="signup-phone"
                        value={form.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                        placeholder="+91 98765 43210"
                        type="tel"
                        autoComplete="tel"
                      />
                    </div>

                    <div>
                      <label htmlFor="signup-password" className="text-sm font-semibold text-slate-800">
                        Password
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          id="signup-password"
                          value={form.password}
                          onChange={(event) => updateField("password", event.target.value)}
                          className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-14 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                          placeholder="Create a secure password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
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

                    <div>
                      <label htmlFor="signup-confirm-password" className="text-sm font-semibold text-slate-800">
                        Confirm password
                      </label>
                      <div className="relative mt-1.5">
                        <input
                          id="signup-confirm-password"
                          value={form.confirmPassword}
                          onChange={(event) => updateField("confirmPassword", event.target.value)}
                          className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 pr-14 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                          placeholder="Repeat the password"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((current) => !current)}
                          className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-slate-500 transition-colors hover:text-slate-800"
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold tracking-[-0.03em] text-slate-900">
                      {role === "patient" ? "Profile basics" : "Organization basics"}
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-[var(--ch-muted)]">
                      {role === "patient"
                        ? "Capture only the stable details needed to create a patient identity in ClaimHeart."
                        : "Capture only the stable organization details needed to provision the workspace."}
                    </p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {activeRoleFields.map((field) => (
                        <div key={field.key}>
                          <label htmlFor={`signup-${String(field.key)}`} className="text-sm font-semibold text-slate-800">
                            {field.label}
                          </label>
                          <input
                            id={`signup-${String(field.key)}`}
                            value={form[field.key]}
                            onChange={(event) => updateField(field.key, event.target.value)}
                            className="mt-1.5 h-10 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all focus:border-[var(--ch-blue)] focus:shadow-[0_0_0_4px_rgba(74,142,219,0.12)] sm:h-11 sm:text-base"
                            placeholder={field.placeholder}
                            type={field.type || "text"}
                            inputMode={field.inputMode}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(event) => setAcceptTerms(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--ch-blue)]"
                      />
                      <span className="text-sm leading-5 text-slate-700">
                        Store this account locally to support the ClaimHeart project demo experience.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-4 shrink-0 border-t border-slate-200 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--ch-blue)] px-4 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(74,142,219,0.18)] transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55 sm:text-base"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="mt-3 text-center text-sm text-[var(--ch-muted)]">
                    Already have access?{" "}
                    <Link href="/auth/login" className="font-semibold text-[var(--ch-blue)]">
                      Login
                    </Link>
                  </p>
                </div>
              </form>

              <AuthProviderButtons mode="signup" onSelect={handleSocialSignup} className="mt-4 shrink-0 border-t border-slate-200 pt-4" />
            </div>
          </div>

          <AuthShowcase
            mode="signup"
            role={role}
            className="order-2 border-t border-slate-200/70 xl:order-2 xl:border-l xl:border-l-white/10 xl:border-t-0"
          />
        </div>
      </div>
    </div>
  );
}
