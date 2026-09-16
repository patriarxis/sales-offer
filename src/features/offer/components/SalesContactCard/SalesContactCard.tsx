"use client";

import { motion } from "framer-motion";
import type { SalesPerson } from "@/features/offer/model/offer.types";
import { useTranslation } from "@/hooks/useTranslation";
import { staggerContainer, staggerItem } from "@/lib/motion";
import styles from "./SalesContactCard.module.scss";

interface SalesContactCardProps {
  salesPerson?: SalesPerson | null;
  className?: string;
}

interface SalesPersonRow {
  label: string;
  value: string;
  href?: string;
}

export const hasSalesPersonDetails = (
  salesPerson?: SalesPerson | null,
): salesPerson is SalesPerson =>
  Boolean(
    salesPerson &&
      (salesPerson.firstName ||
        salesPerson.lastName ||
        salesPerson.title ||
        salesPerson.email ||
        salesPerson.mobilePhone ||
        salesPerson.mainPhone),
  );

const getSalesPersonName = (salesPerson: SalesPerson): string =>
  [salesPerson.firstName, salesPerson.lastName].filter(Boolean).join(" ");

const getSalesPersonInitials = (salesPerson: SalesPerson): string => {
  const initials = [salesPerson.firstName, salesPerson.lastName]
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .join("");

  return (initials || salesPerson.email.trim().charAt(0) || "?").toUpperCase();
};

export const SalesContactCard = ({ salesPerson, className }: SalesContactCardProps) => {
  const { t } = useTranslation();

  if (!hasSalesPersonDetails(salesPerson)) {
    return null;
  }

  const salesPersonName = getSalesPersonName(salesPerson);
  const salesRows: SalesPersonRow[] = [
    {
      label: t("sales_person_label_email"),
      value: salesPerson.email || "-",
      href: salesPerson.email ? "#" : undefined,
    },
    {
      label: t("sales_person_label_mobile"),
      value: salesPerson.mobilePhone || "-",
      href: salesPerson.mobilePhone ? "#" : undefined,
    },
    {
      label: t("sales_person_label_phone"),
      value: salesPerson.mainPhone || "-",
      href: salesPerson.mainPhone ? "#" : undefined,
    },
  ];

  return (
    <motion.div
      className={className ? `${styles.wrapper} ${className}` : styles.wrapper}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.salesContact} variants={staggerItem}>
        <div className={styles.salesHeader}>
          <span className={styles.avatar} aria-hidden="true">
            {getSalesPersonInitials(salesPerson)}
          </span>
          {salesPersonName ? (
            <h3 className={`${styles.salesName} h3`}>{salesPersonName}</h3>
          ) : null}
          {salesPerson.title ? (
            <p className={`${styles.salesTitle} p-sm`}>{salesPerson.title}</p>
          ) : null}
        </div>
        <div className={styles.salesRows}>
          {salesRows.map((row) => (
            <div key={row.label} className={styles.salesRow}>
              <span className="p-sm">{row.label}</span>
              {row.href ? (
                <a href={row.href} className={`${styles.salesRowValue} label-sm`}>
                  {row.value}
                </a>
              ) : (
                <span className={`${styles.salesRowValue} label-sm`}>{row.value}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
