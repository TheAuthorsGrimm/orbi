import "@/styles/index.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Orbi — ADHD companion",
  description: "Your gentle ADHD productivity companion by GrimmForged.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Match the dark theme so the browser chrome / status bar doesn't flash white.
  themeColor: "#080814",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
