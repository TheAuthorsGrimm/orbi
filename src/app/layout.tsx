import "@/styles/index.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orbi — ADHD companion",
  description: "Your gentle ADHD productivity companion by GrimmForged.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
