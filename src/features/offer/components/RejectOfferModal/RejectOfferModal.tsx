"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./RejectOfferModal.module.scss";

interface RejectOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectOfferModal = ({
  isOpen,
  onClose,
  onConfirm,
}: RejectOfferModalProps) => {
  const { t } = useTranslation();
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const otherInputRef = useRef<HTMLInputElement>(null);

  const isOtherSelected = selectedReason === "reason_other";
  const isPreferNotToSaySelected = selectedReason === "reason_prefer_not_to_say";
  const resolvedReason = isOtherSelected
    ? customReason.trim()
    : isPreferNotToSaySelected
      ? ""
      : selectedReason
        ? t(selectedReason)
        : "";
  const isRejectDisabled = !selectedReason || (isOtherSelected && !customReason.trim());

  const reasonOptions = [
    "reason_high_cost",
    "reason_not_right_time",
    "reason_not_fit",
    "reason_other_company",
    "reason_not_interested",
    "reason_prefer_not_to_say",
    "reason_other",
  ];

  const handleSubmit = () => {
    if (!isRejectDisabled) {
      onConfirm(resolvedReason);
    }
  };

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    if (value === "reason_other") {
      requestAnimationFrame(() => otherInputRef.current?.focus());
    }
  };

  const focusOtherInput = () => {
    setSelectedReason("reason_other");
    requestAnimationFrame(() => otherInputRef.current?.focus());
  };

  useEffect(() => {
    if (isOtherSelected) {
      otherInputRef.current?.focus();
    }
  }, [isOtherSelected]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal_reject_title")}
      footer={
        <div className={styles.actions}>
          <Button
            variant="danger"
            size="lg"
            fullWidth
            disabled={isRejectDisabled}
            onClick={handleSubmit}
          >
            {t("btn_submit_reject")}
          </Button>
          <Button variant="secondary" size="lg" fullWidth onClick={onClose}>
            {t("btn_cancel_reject")}
          </Button>
        </div>
      }
    >
      <p className={`${styles.description} p-base`}>{t("modal_reject_desc")}</p>
      <div className={`${styles.formGroup} mt-4`}>
        <p className={`${styles.formLabel} label-sm`}>{t("label_reject_reason")}</p>
        <div
          className={styles.radioGroup}
          role="radiogroup"
          aria-label={t("label_reject_reason")}
        >
          {reasonOptions.map((reasonKey) => {
            const isOtherOption = reasonKey === "reason_other";

            if (!isOtherOption) {
              return (
                <label key={reasonKey} className={`${styles.radioOption} p-base`}>
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reasonKey}
                    checked={selectedReason === reasonKey}
                    onChange={(event) => handleReasonChange(event.target.value)}
                  />
                  <span>{t(reasonKey)}</span>
                </label>
              );
            }

            return (
              <label
                key={reasonKey}
                className={`${styles.radioOption} p-base`}
                onClick={focusOtherInput}
              >
                <input
                  type="radio"
                  name="rejectReason"
                  value={reasonKey}
                  checked={selectedReason === reasonKey}
                  onChange={(event) => handleReasonChange(event.target.value)}
                />
                <input
                  ref={otherInputRef}
                  type="text"
                  className={`${styles.otherReasonInput} p-base ${
                    customReason ? "" : styles.otherReasonPlaceholder
                  }`}
                  value={customReason}
                  onChange={(event) => {
                    setSelectedReason("reason_other");
                    setCustomReason(event.target.value);
                  }}
                  onFocus={() => setSelectedReason("reason_other")}
                  placeholder={t("placeholder_reject_reason_other")}
                  aria-label={t("label_reject_reason_other")}
                />
              </label>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
