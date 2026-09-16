"use client";

import { Suspense } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import { buildLocalizedPath } from "@/lib/i18n/config";
import styles from "./AppHeader.module.scss";

export const AppHeader = () => {
  const { t, locale } = useTranslation();

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <span className={`${styles.headerLabel} label-sm`}>
            {t("page_label_offer")}
          </span>
          <Link
            href={buildLocalizedPath(locale, "/")}
            className={styles.logo}
            aria-label="Up Hellas"
          >
            <img
              src="/up-hellas-logo.svg"
              alt="Up Hellas"
              className={styles.logoImg}
            />
          </Link>
          <div className={styles.headerActions}>
            <Suspense fallback={null}>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
};
