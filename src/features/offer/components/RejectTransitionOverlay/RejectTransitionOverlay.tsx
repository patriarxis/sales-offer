"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./RejectTransitionOverlay.module.scss";

interface RejectTransitionOverlayProps {
  isActive: boolean;
  isSubmitting: boolean;
  error?: string | null;
  onCancel: () => void;
  onComplete: () => void;
  onDismissError: () => void;
}

export const RejectTransitionOverlay = ({
  isActive,
  isSubmitting,
  error,
  onCancel,
  onComplete,
  onDismissError,
}: RejectTransitionOverlayProps) => {
  const { t } = useTranslation();
  const [count, setCount] = useState(5);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      setCount(5);
      hasCompletedRef.current = false;
      return;
    }

    if (count <= 0) {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => setCount((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, isActive, onComplete]);

  const isVisible = isActive || isSubmitting || Boolean(error);

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  if (error) {
    return (
      <div className={`${styles.destructionOverlay} ${styles.active}`}>
        <h2 className={`h2 ${styles.destructionMessage}`}>{error}</h2>
        <div className={styles.destructionActions}>
          <Button variant="danger" size="lg" onClick={onDismissError}>
            {t("btn_try_again")}
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className={`${styles.destructionOverlay} ${styles.active}`}>
        <span className={styles.loadingSpinner} aria-hidden="true" />
        <h2 className={`h2 ${styles.destructionMessage}`}>
          {t("reject_submitting_message")}
        </h2>
      </div>
    );
  }

  const redIntensity = count * 10;
  const timerStyle = {
    color: `rgb(255, ${redIntensity}, ${redIntensity})`,
  };

  return (
    <div className={`${styles.destructionOverlay} ${styles.active}`}>
      <p className={styles.countdownTimer} style={timerStyle}>
        {count}
      </p>
      <h2 className={`h2 ${styles.destructionMessage}`}>
        {t("destruction_timer_message")}
      </h2>
      <div className={styles.destructionActions}>
        <Button
          variant="danger"
          size="lg"
          className={styles.stopButton}
          onClick={onCancel}
        >
          STOP
        </Button>
      </div>
    </div>
  );
};
