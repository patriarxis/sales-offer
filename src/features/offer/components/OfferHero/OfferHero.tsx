"use client";

import { motion } from "framer-motion";
import { OFFER_STATUS } from "@/features/offer/model/offerStatus";
import { useTranslation } from "@/hooks/useTranslation";
import { Icon } from "@/components/ui/Icons";
import { ICONS } from "@/enums/icons";
import type { OfferData, OfferStatus } from "@/features/offer/model/offer.types";
import { OfferMetaBar } from "../OfferMetaBar/OfferMetaBar";
import { bounceIn, staggerContainer, staggerItem } from "@/lib/motion";
import { isNetworkProduct } from "@/lib/productCatalog";
import styles from "./OfferHero.module.scss";

interface OfferHeroProps {
  offerData: OfferData;
  status: OfferStatus;
  expiresAt?: string;
}

export const OfferHero = ({ offerData, status, expiresAt }: OfferHeroProps) => {
  const { t } = useTranslation();
  const resultIcon =
    status === OFFER_STATUS.ACCEPTED
      ? ICONS.CHECK_CIRCLE
      : status === OFFER_STATUS.REJECTED
        ? ICONS.X_CIRCLE
        : null;

  const resultIconClass =
    status === OFFER_STATUS.ACCEPTED
      ? styles.successIcon
      : status === OFFER_STATUS.REJECTED
        ? styles.dangerIcon
        : "";

  const pageTitleClass = status === OFFER_STATUS.REJECTED ? styles.dangerPageTitle : "";
  const isNetworkOffer = isNetworkProduct(offerData.productId);

  const pageTitle =
    status === OFFER_STATUS.ACCEPTED
      ? t("page_title_success")
      : status === OFFER_STATUS.REJECTED
        ? t("page_title_rejected")
        : isNetworkOffer
          ? t("page_title_network")
          : t("page_title");

  const pageSubtitle =
    status === OFFER_STATUS.ACCEPTED
      ? t("success_subtitle")
      : status === OFFER_STATUS.REJECTED
        ? t("rejection_subtitle")
        : isNetworkOffer
          ? t("page_subtitle_network")
          : t("page_subtitle");

  return (
    <section className={styles.hero}>
      <div className="container">
        <motion.div
          className={styles.heroContent}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className={styles.heroText}>
            {resultIcon ? (
              <motion.span
                className={`${styles.resultIcon} ${resultIconClass}`}
                aria-hidden="true"
                variants={bounceIn}
              >
                <Icon name={resultIcon} />
              </motion.span>
            ) : null}
            <motion.h1
              className={`${styles.pageTitle} ${pageTitleClass} h1`}
              variants={staggerItem}
            >
              {pageTitle}
            </motion.h1>
            <motion.p className="p-base" variants={staggerItem}>
              {pageSubtitle}
            </motion.p>
          </div>

          <motion.div variants={staggerItem}>
            <OfferMetaBar
              offerData={offerData}
              status={status}
              expiresAt={expiresAt}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
