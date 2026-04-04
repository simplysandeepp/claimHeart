import AppBootstrap from "@/components/app/AppBootstrap";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ClaimHeart - AI-Powered Healthcare Claims",
  description: "Smart enough to decide. Human enough to explain why.",
  openGraph: {
    title: "ClaimHeart",
    description: "AI claims orchestration. Explainable by design.",
    siteName: "ClaimHeart",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppBootstrap>{children}</AppBootstrap>
      </body>
    </html>
  );
}
