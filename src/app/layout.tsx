import type { Viewport } from "next";
import localFont from "next/font/local";
import { getServerLocale } from "@/lib/i18n/server";
import "../styles/main.scss";
import "./globals.css";

const linotte = localFont({
  src: [
    { path: "./fonts/linotte-thin.woff2", weight: "100", style: "normal" },
    { path: "./fonts/linotte-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/linotte-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/linotte-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/linotte-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/linotte-heavy.woff2", weight: "800", style: "normal" },
    { path: "./fonts/linotte-black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-linotte",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ff8500",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html lang={locale} className={linotte.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
