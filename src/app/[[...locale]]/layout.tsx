import type { Metadata } from "next";
import { LocaleProvider } from "@/lib/LocaleContext";
import { LOCALE } from "@/enums/locale";
import { getValidLocale, LOCALE_PATH_PREFIX } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/translations";
import { getSiteUrl } from "@/lib/env";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale?: string[] }>;
}

const OG_LOCALE: Record<LOCALE, string> = {
  [LOCALE.EL]: "el_GR",
  [LOCALE.EN]: "en_US",
};

const localeFromParams = async (
  params: Promise<{ locale?: string[] }>,
): Promise<LOCALE> => {
  const { locale: segments } = await params;
  return getValidLocale(segments?.[0]);
};

export const generateMetadata = async ({
  params,
}: LocaleLayoutProps): Promise<Metadata> => {
  const locale = await localeFromParams(params);
  const { t } = createTranslator(locale);

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
    metadataBase: new URL(getSiteUrl()),
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
      notranslate: true,
      indexifembedded: false,
      nositelinkssearchbox: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
      googleBot: {
        index: false,
        follow: false,
        nocache: true,
        noarchive: true,
        nosnippet: true,
        noimageindex: true,
        notranslate: true,
        indexifembedded: false,
        nositelinkssearchbox: true,
        "max-video-preview": -1,
        "max-image-preview": "none",
        "max-snippet": -1,
      },
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

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const locale = await localeFromParams(params);

  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
