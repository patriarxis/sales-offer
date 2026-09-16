"use client";

import type { ReactNode } from "react";
import { Countdown } from "@/components/ui/Countdown";
import { Icon } from "@/components/ui/Icons";
import { ICONS } from "@/enums/icons";
import { OFFER_STATUS } from "@/features/offer/model/offerStatus";
import { useTranslation } from "@/hooks/useTranslation";
import type { OfferData, OfferStatus } from "@/features/offer/model/offer.types";
import styles from "./OfferMetaBar.module.scss";

const STATUS_TRANSLATION_KEY: Record<OFFER_STATUS, string> = {
  [OFFER_STATUS.PENDING]: "status_pending",
  [OFFER_STATUS.ACCEPTED]: "status_accepted",
  [OFFER_STATUS.REJECTED]: "status_rejected",
};

const STATUS_ICON: Partial<Record<OFFER_STATUS, ICONS>> = {
  [OFFER_STATUS.ACCEPTED]: ICONS.CHECK_CIRCLE,
  [OFFER_STATUS.REJECTED]: ICONS.X_CIRCLE,
};

const STATUS_TONE_CLASS: Record<OFFER_STATUS, string> = {
  [OFFER_STATUS.PENDING]: styles.warning,
  [OFFER_STATUS.ACCEPTED]: styles.success,
  [OFFER_STATUS.REJECTED]: styles.danger,
};

interface OfferMetaBarProps {
  offerData: OfferData;
  status: OfferStatus;
  expiresAt?: string;
}

interface MetaBadgeProps {
  icon?: ICONS;
  indicator?: ReactNode;
  children: ReactNode;
  className?: string;
}

const MetaBadge = ({ icon, indicator, children, className }: MetaBadgeProps) => (
  <span className={`${styles.metaItem} label ${className ?? ""}`}>
    {indicator ?? (icon ? <Icon name={icon} className={styles.metaIcon} /> : null)}
    <span className={styles.metaText}>{children}</span>
  </span>
);

export const OfferMetaBar = ({ offerData, status, expiresAt }: OfferMetaBarProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.metaBar}>
      <MetaBadge icon={ICONS.HASH}>{offerData.offerDetails.refNumber}</MetaBadge>
      {status === OFFER_STATUS.PENDING ? (
        <MetaBadge icon={ICONS.CALENDAR}>{offerData.offerDetails.date}</MetaBadge>
      ) : null}
      {status === OFFER_STATUS.PENDING && expiresAt ? (
        <MetaBadge icon={ICONS.CLOCK}>
          <Countdown
            expiresAt={expiresAt}
            showIcon={false}
            className={styles.countdown}
          />
        </MetaBadge>
      ) : null}
      <MetaBadge
        icon={STATUS_ICON[status]}
        indicator={
          status === OFFER_STATUS.PENDING ? (
            <span className={styles.pendingDot} aria-hidden="true" />
          ) : undefined
        }
        className={STATUS_TONE_CLASS[status]}
      >
        {t(STATUS_TRANSLATION_KEY[status])}
      </MetaBadge>
    </div>
  );
};
