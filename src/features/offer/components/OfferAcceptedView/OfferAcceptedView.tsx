"use client";

import { motion } from "framer-motion";
import { PRODUCT_ID } from "@/enums/productId";
import { useTranslation } from "@/hooks/useTranslation";
import type { SalesPerson } from "@/features/offer/model/offer.types";
import type { ProductId } from "@/types/domain/product";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { hasSalesPersonDetails, SalesContactCard } from "../SalesContactCard/SalesContactCard";
import styles from "./OfferAcceptedView.module.scss";

interface OfferAcceptedViewProps {
  productId?: ProductId;
  salesPerson?: SalesPerson | null;
}

const getThirdStepKey = (productId?: ProductId): string => {
  switch (productId) {
    case PRODUCT_ID.EXPENSE:
    case PRODUCT_ID.FLEXONE_SUBSCRIPTION:
    case PRODUCT_ID.FLEXONE_COMMISSION:
      return "step_3_kyb";
    case PRODUCT_ID.GO_FOR_EAT_AND_GIFT:
    case PRODUCT_ID.REWARDS:
    case PRODUCT_ID.GIFT:
      return "step_3_gfe_rewards";
    case PRODUCT_ID.FITPASS:
      return "step_3_fitpass_client";
    case PRODUCT_ID.MERCHANT_MEAL_ACCEPTANCE:
    case PRODUCT_ID.MERCHANT_NON_MEAL_ACCEPTANCE:
      return "step_3_core_merchants";
    case PRODUCT_ID.MERCHANT_FITPASS_ACCEPTANCE:
      return "step_3_fitpass_gym";
    default:
      return "step_3_generic";
  }
};

export const OfferAcceptedView = ({ productId, salesPerson }: OfferAcceptedViewProps) => {
  const { t } = useTranslation();
  const nextSteps = [
    { id: 1, text: t("step_1") },
    { id: 2, text: t("step_2") },
    { id: 3, text: t(getThirdStepKey(productId)) },
  ];

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
          {t("next_steps_title")}
        </motion.h2>
        <ul className={styles.nextStepsList}>
          {nextSteps.map((step) => (
            <motion.li key={step.id} className={styles.nextStepItem} variants={staggerItem}>
              <span className={styles.stepMarker} aria-hidden="true">
                {step.id}
              </span>
              <span className="p-base">{step.text}</span>
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
