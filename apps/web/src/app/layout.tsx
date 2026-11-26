import type { Metadata } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const martian = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-martian",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Pulse", template: "%s · Pulse" },
  description: "Self-hosted uptime monitoring with alerts and a public status page.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${martian.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
