"use client";

import { useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Paperclip, Plus, UploadCloud, X } from "lucide-react";
import type { UploadedDocument } from "@/types";

type UploadBoxProps = {
  label: string;
  files: UploadedDocument[];
  onUpload: (files: UploadedDocument[]) => void;
  onRemove?: (name: string) => void;
};

const formatFileSize = (size: number) => `${Math.max(1, Math.round(size / 1024))} KB`;

export default function UploadBox({ label, files, onUpload, onRemove }: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const pushFiles = (incoming: File[]) => {
    const selected = incoming.map((file) => ({
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: "draft",
    }));

    if (selected.length > 0) {
      onUpload(selected);
      setShowSuccess(true);
      window.setTimeout(() => setShowSuccess(false), 1200);
    }
  };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    pushFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const hasFiles = files.length > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-[1.75rem] border p-5 transition-all ${hasFiles ? "border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]" : isDragging ? "border-[var(--ch-blue)] bg-white shadow-[0_0_0_4px_rgba(74,142,219,0.12)]" : "border-[var(--ch-blue-border)] bg-[linear-gradient(180deg,#f9fbff_0%,#edf4fd_100%)]"}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        pushFiles(Array.from(event.dataTransfer.files ?? []));
      }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${hasFiles ? "bg-slate-100 text-slate-700" : "bg-white text-[var(--ch-blue)]"}`}>
            {hasFiles ? <Paperclip className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-bold tracking-[-0.03em] text-slate-900">{label}</h3>
              <AnimatePresence>
                {showSuccess ? (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Files attached
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--ch-muted)]">
              {hasFiles
                ? "Attached documents are staged for the claim and can be updated anytime before submission."
                : "Drag files into the intake area or choose them manually to attach supporting evidence."}
            </p>
          </div>
        </div>

        <label className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${hasFiles ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100" : "bg-[var(--ch-blue)] text-white hover:opacity-95"}`}>
          {hasFiles ? <Plus className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
          {hasFiles ? "Add More Files" : "Choose Files"}
          <input type="file" multiple className="hidden" onChange={handleFiles} />
        </label>
      </div>

      {hasFiles ? (
        <div className="mt-5 rounded-[1.45rem] border border-slate-200 bg-slate-50 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ch-subtle)]">Attached files</p>
            <p className="text-sm font-semibold text-slate-700">{files.length} file{files.length > 1 ? "s" : ""}</p>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {files.map((file) => (
                <motion.div
                  key={`${file.name}-${file.uploadedAt}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 rounded-[1.25rem] border border-white bg-white px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--ch-blue-light)] text-[var(--ch-blue)]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{file.name}</p>
                      <p className="mt-1 text-sm text-[var(--ch-muted)]">{file.type} · {formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  {onRemove ? (
                    <button
                      type="button"
                      onClick={() => onRemove(file.name)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[1.45rem] border border-dashed border-white/80 bg-white/70 p-5 text-sm leading-6 text-[var(--ch-subtle)]">
          Drop files here or use the upload button to attach the latest supporting records.
        </div>
      )}
    </motion.div>
  );
}
