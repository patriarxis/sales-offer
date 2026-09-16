"use client";

import { motion } from "framer-motion";
import type { SalesPerson } from "@/features/offer/model/offer.types";
import { useTranslation } from "@/hooks/useTranslation";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { hasSalesPersonDetails, SalesContactCard } from "../SalesContactCard/SalesContactCard";
import styles from "./OfferRejectedView.module.scss";

interface OfferRejectedViewProps {
  salesPerson?: SalesPerson | null;
}

export const OfferRejectedView = ({ salesPerson }: OfferRejectedViewProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className={styles.resultCard}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className={styles.nextSteps}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className={`${styles.nextStepsTitle} h2`}
          variants={staggerItem}
        >
          {t("rejection_next_steps_title")}
        </motion.h2>
        <ul className={styles.nextStepsList}>
          {[1, 2, 3].map((num) => (
            <motion.li key={num} className={styles.nextStepItem} variants={staggerItem}>
              <span className={styles.stepMarker} aria-hidden="true" />
              <span className="p-base">{t(`rejection_step_${num}`)}</span>
            </motion.li>
          ))}
        </ul>

        {hasSalesPersonDetails(salesPerson) ? (
          <motion.div className={styles.salesSection} variants={staggerItem}>
            <div className={styles.salesSectionCopy}>
              <h2 className={`${styles.salesSectionTitle} h2`}>
                {t("sales_contact_help_title")}
              </h2>
              <p className={`${styles.salesSectionDescription} p-base`}>
                {t("sales_contact_help_description")}
              </p>
            </div>
            <SalesContactCard salesPerson={salesPerson} />
          </motion.div>
        ) : null}
      </motion.div>
    </motion.div>
  );
};
