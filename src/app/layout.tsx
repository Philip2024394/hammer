import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hammerex Products",
  description: "Hammerex — products store with international delivery."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-bg text-brand-text antialiased">{children}</body>
    </html>
  );
}
