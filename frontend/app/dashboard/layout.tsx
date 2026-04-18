"use client";

import React from "react";

type LayoutProps = {
  title?: string;
  children?: React.ReactNode;
};

export default function Layout({ title = "Layout", children }: LayoutProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {children ? <div className="mt-2 text-sm text-slate-600">{children}</div> : null}
    </section>
  );
}
