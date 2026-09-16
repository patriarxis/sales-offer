import "server-only";
import { headers } from "next/headers";
import { cache } from "react";
import { ILocale } from "@/types/i18n";
import { createTranslator } from "./translations";
import { LOCALE_HEADER, getValidLocale } from "./config";

export const getServerLocale = cache(async (): Promise<ILocale> => {
  const headerStore = await headers();
  return getValidLocale(headerStore.get(LOCALE_HEADER)) as ILocale;
});

export const getServerTranslator = cache(async () => {
  const locale = await getServerLocale();
  return createTranslator(locale);
});
