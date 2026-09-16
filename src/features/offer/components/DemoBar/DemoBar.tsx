"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { buildLocalizedPath, splitLocaleFromPath } from "@/lib/i18n/config";
import {
  DEMO_OFFER_TOKENS,
  getDemoGalleryItems,
} from "@/features/offer/server/mockOffers";
import styles from "./DemoBar.module.scss";

interface DemoBarProps {
  currentToken: string;
}

/** Centered product switcher for sample offers (portfolio banner is separate). */
export const DemoBar = ({ currentToken }: DemoBarProps) => {
  const { t, locale } = useTranslation();
  const pathname = usePathname() ?? "/";
  const { path } = splitLocaleFromPath(pathname);
  const base = buildLocalizedPath(locale, path || "/");
  const items = getDemoGalleryItems();

  return (
    <div className={styles.bar} role="navigation" aria-label={t("demo_switch_product")}>
      <div className="container">
        <div className={styles.inner}>
          <label className={styles.switcher}>
            <select
              className={`${styles.select} label-sm`}
              aria-label={t("demo_switch_product")}
              value={
                DEMO_OFFER_TOKENS.includes(currentToken) ? currentToken : ""
              }
              onChange={(event) => {
                const token = event.target.value;
                if (!token) return;
                window.location.assign(
                  `${base}?offerToken=${encodeURIComponent(token)}`,
                );
              }}
            >
              {items.map((item) => (
                <option key={item.token} value={item.token}>
                  {item.displayName}
                </option>
              ))}
            </select>
          </label>

          <Link
            href={buildLocalizedPath(locale, "/")}
            className={`${styles.galleryLink} label-sm`}
          >
            {t("demo_back_gallery")}
          </Link>
        </div>
      </div>
    </div>
  );
};
