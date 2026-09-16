import { LOCALE } from "@/enums/locale";

export const defaultLocale = LOCALE.EN;
export const locales = [LOCALE.EN, LOCALE.EL] as const;

/** Default locale has no path prefix; Greek lives under `/el`. */
export const LOCALE_PATH_PREFIX: Record<LOCALE, string> = {
  [LOCALE.EN]: "",
  [LOCALE.EL]: "/el",
};

export const LOCALE_HEADER = "x-locale";

export const getValidLocale = (locale: string | null | undefined): LOCALE => {
  if (locale && Object.values(LOCALE).includes(locale as LOCALE)) {
    return locale as LOCALE;
  }
  return defaultLocale;
};

export const splitLocaleFromPath = (
  pathname: string,
): { locale: LOCALE; path: string } => {
  for (const [locale, prefix] of Object.entries(LOCALE_PATH_PREFIX) as Array<
    [LOCALE, string]
  >) {
    if (!prefix) continue;
    if (pathname === prefix) {
      return { locale, path: "/" };
    }
    if (pathname.startsWith(`${prefix}/`)) {
      return { locale, path: pathname.slice(prefix.length) };
    }
  }
  return { locale: defaultLocale, path: pathname };
};

export const buildLocalizedPath = (locale: LOCALE, path: string): string => {
  const prefix = LOCALE_PATH_PREFIX[locale];
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!prefix) {
    return normalized;
  }
  if (normalized === "/") {
    return prefix;
  }
  return `${prefix}${normalized}`;
};
