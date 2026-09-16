"use client";

import { type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/hooks/useTranslation";
import { triggerConfetti } from "@/lib/confetti";
import styles from "./AcceptOfferModal.module.scss";

interface AcceptOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

export const AcceptOfferModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  error,
}: AcceptOfferModalProps) => {
  const { t } = useTranslation();

  const handleConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    if (isSubmitting) {
      return;
    }

    triggerConfetti(event.currentTarget);
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal_accept_title")}
      hideClose={isSubmitting}
      bodyClassName={styles.body}
      footer={
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            onClick={handleConfirm}
          >
            {t("btn_confirm_accept")}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
            onClick={onClose}
          >
            {t("btn_cancel")}
          </Button>
        </div>
      }
    >
      <p className={`${styles.description} p-base`}>{t("modal_accept_desc")}</p>
      <p className={`${styles.confirmationText} p-sm`}>
        {t("modal_accept_confirm_text")}
      </p>
      {error ? <p className={`${styles.errorText} p-sm`}>{error}</p> : null}
    </Modal>
  );
};
