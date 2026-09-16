"use client";

import { motion } from "framer-motion";
import type { OfferData } from "@/features/offer/model/offer.types";
import type { OfferBookletManifest } from "@/features/offer/server/offerBookletManifest";
import { useTranslation } from "@/hooks/useTranslation";
import { fadeInUp } from "@/lib/motion";
import { OfferPdfViewer } from "../OfferPdfViewer/OfferPdfViewer";
import { OfferDetails } from "../OfferDetails/OfferDetails";
import { OfferSummary } from "../OfferSummary/OfferSummary";
import { hasSalesPersonDetails, SalesContactCard } from "../SalesContactCard/SalesContactCard";
import styles from "./OfferPendingView.module.scss";

interface OfferPendingViewProps {
  offerData: OfferData;
  booklet: OfferBookletManifest | null;
}

export const OfferPendingView = ({
  offerData,
  booklet,
}: OfferPendingViewProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      className={styles.offerCard}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <OfferSummary offerData={offerData} />
      {booklet ? <OfferPdfViewer manifest={booklet} /> : null}
      <OfferDetails offerData={offerData} />
      {hasSalesPersonDetails(offerData.salesPerson) ? (
        <section className={styles.salesSection}>
          <div className={styles.salesSectionCopy}>
            <h2 className={`${styles.salesSectionTitle} h2`}>
              {t("sales_contact_help_title")}
            </h2>
            <p className={`${styles.salesSectionDescription} p-base`}>
              {t("sales_contact_help_description")}
            </p>
          </div>
          <SalesContactCard salesPerson={offerData.salesPerson} />
        </section>
      ) : null}
    </motion.div>
  );
};
