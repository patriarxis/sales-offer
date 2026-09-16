"use client";

import type { OfferData } from "@/features/offer/model/offer.types";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./OfferDetails.module.scss";

interface OfferDetailsProps {
  offerData: OfferData;
}

export const OfferDetails = ({ offerData }: OfferDetailsProps) => {
  const { t, locale } = useTranslation();
  const localized = offerData.localized[locale];

  // Price/fee breakdown is already covered by the financial summary section,
  // so this card only shows company + payment method info, no pricing rows.
  const detailRows = [
    {
      label: t("detail_company_name"),
      value: offerData.companyName,
    },
    {
      label: t("detail_vat"),
      value: offerData.taxNumber,
    },
    {
      label: t("detail_address"),
      value: localized.address,
    },
    {
      label: t("detail_payment_method"),
      value: localized.paymentMethod,
    },
  ].filter((row) => row.value && row.value !== "-");

  if (!detailRows.length) {
    return null;
  }

  return (
    <section className={styles.detailsSection}>
      <h2 className={`${styles.sectionTitle} h2`}>{t("section_details")}</h2>
      <div className={styles.detailsBlock}>
        <div className={styles.detailsRows}>
          {detailRows.map((row) => (
            <div key={row.label} className={styles.detailsRow}>
              <span className="p-sm">{row.label}</span>
              <span className={`${styles.detailsAmount} label-sm`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
