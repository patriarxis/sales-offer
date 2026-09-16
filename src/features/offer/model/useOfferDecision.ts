"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { OFFER_STATUS } from "./offerStatus";
import type { OfferStatus } from "./offer.types";

interface UseOfferDecisionOptions {
  initialStatus: OfferStatus;
  acceptUrl?: string;
  rejectUrl?: string;
}

export const useOfferDecision = ({
  initialStatus,
  acceptUrl,
  rejectUrl,
}: UseOfferDecisionOptions) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState<OfferStatus>(initialStatus);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRejectTransitionActive, setIsRejectTransitionActive] = useState(false);
  const [isAcceptSubmitting, setIsAcceptSubmitting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isRejectSubmitting, setIsRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [pendingRejectionReason, setPendingRejectionReason] = useState<string | null>(
    null,
  );

  const isPending = status === OFFER_STATUS.PENDING;

  const openAcceptModal = () => {
    setIsAcceptModalOpen(true);
  };

  const openRejectModal = () => {
    setIsRejectModalOpen(true);
  };

  const closeAcceptModal = () => {
    if (isAcceptSubmitting) {
      return;
    }
    setIsAcceptModalOpen(false);
    setAcceptError(null);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
  };

  const confirmAccept = async () => {
    if (isAcceptSubmitting) {
      return;
    }

    if (!acceptUrl) {
      console.error("Missing accept URL from offer payload");
      setAcceptError(t("error_accept_failed"));
      return;
    }

    setIsAcceptSubmitting(true);
    setAcceptError(null);

    try {
      const response = await fetch("/api/offer/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decisionUrl: acceptUrl,
          rejectionReason: "",
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Failed to accept offer (${response.status}): ${details}`);
      }

      setIsAcceptModalOpen(false);
      setStatus(OFFER_STATUS.ACCEPTED);
    } catch (error) {
      console.error("Error accepting offer:", error);
      setAcceptError(t("error_accept_failed"));
    } finally {
      setIsAcceptSubmitting(false);
    }
  };

  const confirmReject = (rejectionReason: string) => {
    if (isRejectSubmitting || !rejectUrl) {
      if (!rejectUrl) {
        console.error("Missing reject URL from offer payload");
      }
      return;
    }

    setIsRejectModalOpen(false);
    setRejectError(null);
    setPendingRejectionReason(rejectionReason);
    setIsRejectTransitionActive(true);
  };

  const handleRejectTransitionComplete = useCallback(async () => {
    if (!rejectUrl || !pendingRejectionReason) {
      setIsRejectTransitionActive(false);
      return;
    }

    if (isRejectSubmitting) {
      return;
    }

    setIsRejectTransitionActive(false);
    setIsRejectSubmitting(true);
    setRejectError(null);

    try {
      const response = await fetch("/api/offer/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decisionUrl: rejectUrl,
          rejectionReason: pendingRejectionReason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject offer");
      }

      setStatus(OFFER_STATUS.REJECTED);
      setPendingRejectionReason(null);
    } catch (error) {
      console.error("Error rejecting offer:", error);
      setRejectError(t("error_reject_failed"));
    } finally {
      setIsRejectSubmitting(false);
    }
  }, [isRejectSubmitting, pendingRejectionReason, rejectUrl, t]);

  const cancelRejectTransition = useCallback(() => {
    if (isRejectSubmitting) {
      return;
    }

    setPendingRejectionReason(null);
    setIsRejectTransitionActive(false);
  }, [isRejectSubmitting]);

  const dismissRejectError = useCallback(() => {
    setRejectError(null);
    setPendingRejectionReason(null);
  }, []);

  return {
    status,
    isPending,
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
  };
};
