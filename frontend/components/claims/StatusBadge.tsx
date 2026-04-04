"use client";

import { motion } from "framer-motion";
import { claimStatusClasses } from "@/lib/claimUi";
import type { ClaimStatus } from "@/types";

export default function StatusBadge({ status }: { status: ClaimStatus }) {
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.92, opacity: 0.8 }}
      animate={{ scale: [1, 1.05, 1], opacity: 1 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${claimStatusClasses[status]}`}
    >
      {status.replace("_", " ")}
    </motion.span>
  );
}
