"use client";

import { useLocale } from "@/lib/LocaleContext";

export const useTranslation = () => {
  const { t, locale } = useLocale();
  return { t, locale };
};
