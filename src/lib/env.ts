/** Portfolio demo — no Azure / CRM env vars required. */
export const serverEnv = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
