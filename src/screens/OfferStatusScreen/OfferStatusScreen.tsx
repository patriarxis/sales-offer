"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { BackgroundLine, PageShell } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import { ICONS } from "@/enums/icons";
import {
  hasSalesPersonDetails,
  SalesContactCard,
} from "@/features/offer/components/SalesContactCard/SalesContactCard";
import {
  allowsRetry,
  OFFER_LOAD_ERROR,
  type OfferLoadErrorCode,
  showsSalesContact,
} from "@/features/offer/model/offerLoadError";
import type { SalesPerson } from "@/features/offer/model/offer.types";
import { useTranslation } from "@/hooks/useTranslation";
import { bounceIn, staggerContainer, staggerItem } from "@/lib/motion";
import type { ProductId } from "@/types/domain/product";
import styles from "./OfferStatusScreen.module.scss";

interface OfferStatusScreenProps {
  reason: OfferLoadErrorCode;
  salesPerson?: SalesPerson | null;
  productId?: ProductId;
}

export const OfferStatusScreen = ({
  reason,
  salesPerson,
  productId,
}: OfferStatusScreenProps) => {
  const { t } = useTranslation();
  const canRetry = allowsRetry(reason);
  const showSales = showsSalesContact(reason) && hasSalesPersonDetails(salesPerson);
  const contactHref = "#";

  const title = t(`offer_error.${reason}.title`);
  const subtitle = t(`offer_error.${reason}.subtitle`);
  const message = t(`offer_error.${reason}.message`);
  const description = t(`offer_error.${reason}.description`);

  useEffect(() => {
    console.error(`[OfferStatus] ${reason}`, { reason, productId });
  }, [productId, reason]);

  return (
    <PageShell showPageBackground productId={productId}>
      <section className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            className={styles.icon}
            aria-hidden="true"
            variants={bounceIn}
          >
            <Icon
              name={
                reason === OFFER_LOAD_ERROR.EXPIRED_TOKEN
                  ? ICONS.CLOCK
                  : reason === OFFER_LOAD_ERROR.MISSING_TOKEN
                    ? ICONS.LOCK
                    : ICONS.WARNING
              }
            />
          </motion.span>
          <motion.h1 className={`${styles.title} h1`} variants={staggerItem}>
            {title}
          </motion.h1>
          <motion.p className={`${styles.subtitle} p-lg`} variants={staggerItem}>
            {subtitle}
          </motion.p>
        </motion.div>
      </section>

      <main className={styles.content}>
        <BackgroundLine />
        <motion.div
          className={styles.card}
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
        >
          <div className={styles.cardCopy}>
            <h2 className={`${styles.cardTitle} h2`}>{message}</h2>
            <p className={`${styles.cardDescription} p-base`}>{description}</p>
            <p className={styles.referenceHint}>{t("offer_error.reference_hint")}</p>
            <div className={styles.reference}>
              <span className={styles.referenceLabel}>
                {t("offer_error.reference_label")}:
              </span>
              <code className={styles.referenceCode}>{reason}</code>
            </div>
          </div>

          {showSales ? <SalesContactCard salesPerson={salesPerson} /> : null}

          <div className={styles.ctaGroup}>
            {canRetry ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                className={styles.cta}
                onClick={() => window.location.reload()}
              >
                {t("offer_error.retry_cta")}
              </Button>
            ) : null}
            <Button
              href={contactHref}
              variant={canRetry ? "secondary" : "primary"}
              size="lg"
              className={styles.cta}
            >
              {t("offer_error.contact_cta")}
            </Button>
          </div>
        </motion.div>
      </main>
    </PageShell>
  );
};
