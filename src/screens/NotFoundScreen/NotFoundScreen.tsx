"use client";

import { BackgroundLine, PageShell } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { buildLocalizedPath } from "@/lib/i18n/config";
import styles from "./NotFoundScreen.module.scss";

export const NotFoundScreen = () => {
  const { t, locale } = useTranslation();

  return (
    <PageShell>
      <main className={styles.content}>
        <BackgroundLine />
        <span className={styles.code}>404</span>
        <h1 className={`${styles.title} h1`}>{t("not_found_title")}</h1>
        <p className={`${styles.message} p-lg`}>{t("not_found_message")}</p>
        <div className={styles.actions}>
          <Button href={buildLocalizedPath(locale, "/")} variant="primary" size="md">
            {t("not_found_back_home")}
          </Button>
        </div>
      </main>
    </PageShell>
  );
};
