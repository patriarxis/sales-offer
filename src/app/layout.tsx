import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { LOCALE } from "@/enums/locale";
import { LOCALE_PATH_PREFIX } from "@/lib/i18n/config";
import { getServerLocale, getServerTranslator } from "@/lib/i18n/server";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const OG_LOCALE: Record<LOCALE, string> = {
  [LOCALE.EL]: "el_GR",
  [LOCALE.EN]: "en_US",
};

export const viewport: Viewport = {
  themeColor: "#ff8500",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const generateMetadata = async (): Promise<Metadata> => {
  const { t } = await getServerTranslator();
  const locale = await getServerLocale();

  const title = t("meta_title");
  const description = t("meta_description");
  const siteName = t("meta_site_name");
  const ogImageAlt = t("meta_og_image_alt");

  const languageAlternates: Record<string, string> = {
    "x-default": "/",
    ...Object.fromEntries(
      Object.entries(LOCALE_PATH_PREFIX).map(([loc, prefix]) => [
        loc,
        prefix || "/",
      ]),
    ),
  };

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: t("meta_title_template"),
    },
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
    applicationName: siteName,
    referrer: "origin-when-cross-origin",
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    alternates: {
      canonical: "/",
      languages: languageAlternates,
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      url: "/",
      locale: OG_LOCALE[locale],
      alternateLocale: Object.values(OG_LOCALE).filter(
        (l) => l !== OG_LOCALE[locale],
      ),
      images: [
        {
          url: "/meta-img.jpg",
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: "/meta-img.jpg", alt: ogImageAlt }],
    },
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: "black-translucent",
    },
  };
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
