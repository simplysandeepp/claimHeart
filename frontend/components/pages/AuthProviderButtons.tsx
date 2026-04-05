import type { ComponentType, SVGProps } from "react";

export type AuthProvider = "google" | "apple" | "microsoft";

export const AUTH_PROVIDER_LABELS: Record<AuthProvider, string> = {
  google: "Google",
  apple: "Apple",
  microsoft: "Microsoft",
};

type AuthProviderButtonsProps = {
  mode: "login" | "signup";
  onSelect: (provider: AuthProvider) => void;
  className?: string;
};

const PROVIDERS: Array<{
  id: AuthProvider;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}> = [
  { id: "google", icon: GoogleIcon },
  { id: "apple", icon: AppleIcon },
  { id: "microsoft", icon: MicrosoftIcon },
];

export default function AuthProviderButtons({ mode, onSelect, className = "" }: AuthProviderButtonsProps) {
  const label = mode === "login" ? "Continue with" : "Sign up with";

  return (
    <div className={["space-y-3", className].filter(Boolean).join(" ")}>
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ch-subtle)]">
        {label}
      </p>

      <div className="flex items-center justify-center gap-3">
        {PROVIDERS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            aria-label={`${label} ${AUTH_PROVIDER_LABELS[id]}`}
            title={`${label} ${AUTH_PROVIDER_LABELS[id]}`}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">
              {label} {AUTH_PROVIDER_LABELS[id]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.72h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.33 2.97-7.28Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.5c-.9.6-2.06.96-3.39.96-2.6 0-4.8-1.76-5.58-4.12H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC04"
        d="M6.42 13.9A6 6 0 0 1 6.1 12c0-.66.12-1.3.32-1.9V7.52H3.08A10 10 0 0 0 2 12c0 1.6.38 3.1 1.08 4.48l3.34-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.98c1.47 0 2.8.5 3.84 1.48l2.88-2.88C16.96 2.94 14.7 2 12 2A10 10 0 0 0 3.08 7.52L6.42 10.1c.78-2.36 2.98-4.12 5.58-4.12Z"
      />
    </svg>
  );
}

function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" {...props}>
      <path d="M15.1 5.1c.8-1 1.3-2.2 1.2-3.4-1.2.1-2.5.8-3.3 1.8-.7.9-1.3 2.1-1.2 3.3 1.3.1 2.5-.6 3.3-1.7Zm4 12.2c-.5 1.2-.8 1.7-1.5 2.7-1 1.4-2.3 3.2-3.9 3.2-1.4 0-1.8-.9-3.7-.9-1.9 0-2.4.9-3.8.9-1.6 0-2.8-1.6-3.8-3-2.8-3.9-3.1-8.4-1.4-10.9 1.2-1.8 3-2.9 4.8-2.9 1.9 0 3.1 1 4.6 1 1.4 0 2.3-1 4.5-1 .7 0 3.1.2 4.6 2.4-.1.1-2.8 1.6-2.8 4.8 0 3.8 3.3 5.1 3.4 5.1-.1.3-.2.5-.4.8Z" />
    </svg>
  );
}

function MicrosoftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#F25022" d="M3 3h8.5v8.5H3z" />
      <path fill="#7FBA00" d="M12.5 3H21v8.5h-8.5z" />
      <path fill="#00A4EF" d="M3 12.5h8.5V21H3z" />
      <path fill="#FFB900" d="M12.5 12.5H21V21h-8.5z" />
    </svg>
  );
}
