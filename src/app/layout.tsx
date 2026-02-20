import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FloorOS — Event Floor Plan Platform",
  description:
    "Create interactive floor plans for events, trade shows, and exhibitions. Manage booths, exhibitors, and attendee experiences.",
  keywords: ["floor plan", "event", "trade show", "exhibition", "booth management"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
