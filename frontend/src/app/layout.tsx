import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@mysten/dapp-kit/dist/index.css";
import { AppProviders } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Global Supply Chain",
  description: "Số hóa niềm tin, nối liền bản sắc",

  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <AppProviders>
          <SiteHeader />
          <main className="mx-auto max-w-5xl px-6">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
