"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icons";
import { ICONS } from "@/enums/icons";
import { useTranslation } from "@/hooks/useTranslation";
import {
  getSupportEmail,
  SUPPORT_PHONE_DISPLAY,
} from "@/lib/supportContact";
import type { ProductId } from "@/types/domain/product";
import styles from "./AppFooter.module.scss";

type FooterLegalLink = {
  label: string;
  href: string;
};

interface AppFooterProps {
  productId?: ProductId;
}

const DISABLED_HREF = "#";

export const AppFooter = ({ productId }: AppFooterProps) => {
  const { t } = useTranslation();
  const legalLinks = t("footer_legal_links") as FooterLegalLink[];
  const supportEmail = getSupportEmail(productId);

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Link href={DISABLED_HREF}>
              <img src="/up-hellas-mark.svg" alt="Up Hellas" />
            </Link>
          </div>
          <h3 className={`${styles.footerHelpTitle} h5`}>{t("footer_help_title")}</h3>
          <div className={`${styles.contactDetails} p-sm`}>
            <span>{t("footer_contact_label")}</span>
            <a href={DISABLED_HREF} className={`${styles.contactItem} label-sm`}>
              {supportEmail}
            </a>
            <span className={styles.contactSeparator}>{t("footer_contact_or")}</span>
            <a href={DISABLED_HREF} className={`${styles.contactItem} label-sm`}>
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </div>
          <div className={styles.footerSocials}>
            <Link href={DISABLED_HREF} className={styles.socialIcon}>
              <Icon name={ICONS.LINKEDIN} aria-label="LinkedIn" />
            </Link>
            <Link href={DISABLED_HREF} className={styles.socialIcon}>
              <Icon name={ICONS.INSTAGRAM} aria-label="Instagram" />
            </Link>
            <Link href={DISABLED_HREF} className={styles.socialIcon}>
              <Icon name={ICONS.FACEBOOK} aria-label="Facebook" />
            </Link>
            <Link href={DISABLED_HREF} className={styles.socialIcon}>
              <Icon name={ICONS.TIKTOK} aria-label="TikTok" />
            </Link>
            <Link href={DISABLED_HREF} className={styles.socialIcon}>
              <Icon name={ICONS.YOUTUBE} aria-label="YouTube" />
            </Link>
            <Link href={DISABLED_HREF} className={styles.socialIcon}>
              <Icon name={ICONS.SPOTIFY} aria-label="Spotify" />
            </Link>
          </div>
          <div className={styles.footerLegal}>
            <p className={`${styles.footerCopyright} p-xs`}>{t("footer_copyright")}</p>
            <div
              className={`${styles.footerLegalLinks} p-xs`}
              aria-label={t("footer_legal_nav_label")}
            >
              {legalLinks.map((link) => (
                <Link key={link.label} href={DISABLED_HREF}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
