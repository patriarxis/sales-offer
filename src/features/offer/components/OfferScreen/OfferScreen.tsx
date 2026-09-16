"use client";

import { useEffect } from "react";
import { BackgroundLine, PageShell } from "@/components/layout";
import { useOfferExpired } from "@/features/offer/hooks/useOfferExpired";
import { OFFER_LOAD_ERROR } from "@/features/offer/model/offerLoadError";
import { OFFER_STATUS } from "@/features/offer/model/offerStatus";
import { useOfferDecision } from "@/features/offer/model/useOfferDecision";
import type { OfferData } from "@/features/offer/model/offer.types";
import type { OfferBookletManifest } from "@/features/offer/server/offerBookletManifest";
import { OfferStatusScreen } from "@/screens/OfferStatusScreen/OfferStatusScreen";
import { AcceptOfferModal } from "../AcceptOfferModal/AcceptOfferModal";
import { OfferAcceptedView } from "../OfferAcceptedView/OfferAcceptedView";
import { OfferActionsBar } from "../OfferActionsBar/OfferActionsBar";
import { OfferHero } from "../OfferHero/OfferHero";
import { OfferPendingView } from "../OfferPendingView/OfferPendingView";
import { OfferRejectedView } from "../OfferRejectedView/OfferRejectedView";
import { RejectOfferModal } from "../RejectOfferModal/RejectOfferModal";
import { RejectTransitionOverlay } from "../RejectTransitionOverlay/RejectTransitionOverlay";
import styles from "./OfferScreen.module.scss";

interface OfferScreenProps {
  offerData: OfferData;
  booklet: OfferBookletManifest | null;
}

export const OfferScreen = ({ offerData, booklet }: OfferScreenProps) => {
  const {
    status,
    isAcceptModalOpen,
    isRejectModalOpen,
    isRejectTransitionActive,
    isAcceptSubmitting,
    acceptError,
    isRejectSubmitting,
    rejectError,
    openAcceptModal,
    openRejectModal,
    closeAcceptModal,
    closeRejectModal,
    confirmAccept,
    confirmReject,
    handleRejectTransitionComplete,
    cancelRejectTransition,
    dismissRejectError,
  } = useOfferDecision({
    initialStatus: offerData.offerDetails.status,
    acceptUrl: offerData.offerDetails.acceptUrl,
    rejectUrl: offerData.offerDetails.rejectUrl,
  });

  const pendingExpiresAt =
    status === OFFER_STATUS.PENDING && offerData.offerDetails.expiresAt
      ? offerData.offerDetails.expiresAt
      : undefined;
  const isExpired = useOfferExpired(pendingExpiresAt);

  const canTakeAction =
    status === OFFER_STATUS.PENDING &&
    !isExpired &&
    !isAcceptSubmitting &&
    !isRejectSubmitting &&
    !isRejectTransitionActive;

  useEffect(() => {
    if (status === OFFER_STATUS.PENDING) {
      return;
    }

    // Accept/reject is a view swap — reset scroll like a new page (body may own it).
    let cancelled = false;
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.scrollingElement?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const frame = requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }
      scrollToTop();
      requestAnimationFrame(() => {
        if (!cancelled) {
          scrollToTop();
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [status]);

  if (status === OFFER_STATUS.PENDING && isExpired) {
    return (
      <OfferStatusScreen
        reason={OFFER_LOAD_ERROR.EXPIRED_TOKEN}
        productId={offerData.productId}
        salesPerson={offerData.salesPerson}
      />
    );
  }

  return (
    <PageShell showPageBackground productId={offerData.productId}>
      <OfferHero
        offerData={offerData}
        status={status}
        expiresAt={pendingExpiresAt}
      />

      <main
        className={`${styles.viewWrapper} ${
          isRejectTransitionActive ? "shake-hard" : ""
        }`}
      >
        <BackgroundLine />
        <div className="container">
          <div className={styles.viewContent}>
            {status === OFFER_STATUS.PENDING ? (
              <OfferPendingView offerData={offerData} booklet={booklet} />
            ) : null}
            {status === OFFER_STATUS.ACCEPTED ? (
              <OfferAcceptedView
                productId={offerData.productId}
                salesPerson={offerData.salesPerson}
              />
            ) : null}
            {status === OFFER_STATUS.REJECTED ? (
              <OfferRejectedView salesPerson={offerData.salesPerson} />
            ) : null}
          </div>
        </div>
      </main>

      {canTakeAction ? (
        <OfferActionsBar onAccept={openAcceptModal} onReject={openRejectModal} />
      ) : null}

      <AcceptOfferModal
        isOpen={isAcceptModalOpen}
        onClose={closeAcceptModal}
        onConfirm={confirmAccept}
        isSubmitting={isAcceptSubmitting}
        error={acceptError}
      />

      <RejectOfferModal
        isOpen={isRejectModalOpen}
        onClose={closeRejectModal}
        onConfirm={confirmReject}
      />

      <RejectTransitionOverlay
        isActive={isRejectTransitionActive}
        isSubmitting={isRejectSubmitting}
        error={rejectError}
        onCancel={cancelRejectTransition}
        onComplete={handleRejectTransitionComplete}
        onDismissError={dismissRejectError}
      />
    </PageShell>
  );
};
