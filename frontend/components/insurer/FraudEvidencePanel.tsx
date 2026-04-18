"use client";

import React from "react";

type FraudevidencepanelProps = {
  title?: string;
  children?: React.ReactNode;
};

export default function Fraudevidencepanel({ title = "Fraudevidencepanel", children }: FraudevidencepanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children ? <div className="mt-2 text-sm text-slate-600">{children}</div> : null}
    </section>
  );
}
