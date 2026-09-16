"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LOCALE } from "@/enums/locale";
import { useTranslation } from "@/hooks/useTranslation";
import { buildLocalizedPath, splitLocaleFromPath } from "@/lib/i18n/config";
import styles from "./LanguageSwitcher.module.scss";

const SUPPORTED_LOCALES = [
  { code: LOCALE.EN, label: "EN", hrefLang: "en" },
  { code: LOCALE.EL, label: "ΕΛ", hrefLang: "el-GR" },
] as const;

export const LanguageSwitcher = () => {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { locale: currentLocale } = useTranslation();

  const { path } = splitLocaleFromPath(pathname);
  const search = searchParams?.toString();
  const suffix = search ? `?${search}` : "";

  return (
    <div className={styles.switcher}>
      <ul role="list" className={styles.list}>
        {SUPPORTED_LOCALES.map(({ code, label, hrefLang }) => {
          const isActive = currentLocale === code;

          return (
            <li key={code} role="listitem" className={styles.item}>
              <Link
                href={`${buildLocalizedPath(code, path)}${suffix}`}
                prefetch={false}
                scroll={false}
                className={`${styles.link} label ${isActive ? styles.active : ""}`}
                hrefLang={hrefLang}
                lang={hrefLang}
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
