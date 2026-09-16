"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { createTranslator } from "@/lib/i18n/translations";
import { ILocale } from "@/types/i18n";

interface LocaleContextType {
  locale: ILocale;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, context?: string) => any;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  locale: ILocale;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({
  children,
  locale,
}) => {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const value = useMemo<LocaleContextType>(() => {
    const translator = createTranslator(locale);
    return { locale, t: translator.t };
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
