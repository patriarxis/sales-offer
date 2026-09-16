/** Portfolio demo — no Azure / CRM env vars required. */

const LOCAL_SITE_URL = "http://localhost:3000";

const withProtocol = (value: string): string => {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Public origin for metadata. Accepts a host-only Vercel URL
 * (`sales-offer.vercel.app`) and falls back to the platform URL when
 * `NEXT_PUBLIC_SITE_URL` is unset or invalid — `new URL("")` would
 * otherwise take the whole app down from `generateMetadata`.
 */
export const getSiteUrl = (): string => {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    LOCAL_SITE_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    try {
      return new URL(withProtocol(candidate)).origin;
    } catch {
      continue;
    }
  }

  return LOCAL_SITE_URL;
};

export const serverEnv = {
  siteUrl: getSiteUrl(),
};
