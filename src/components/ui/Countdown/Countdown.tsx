"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icons";
import { ICONS } from "@/enums/icons";
import { useTranslation } from "@/hooks/useTranslation";
import type { CountdownProps, TimeParts } from "@/types/components/countdown";
import styles from "./Countdown.module.scss";

const computeTimeParts = (expiresAtMs: number, now: number): TimeParts => {
  const diff = expiresAtMs - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(diff / (1000 * 60)) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    expired: false,
  };
};

const pad2 = (n: number) => String(n).padStart(2, "0");

export const Countdown = ({
  expiresAt,
  className,
  showIcon = true,
}: CountdownProps) => {
  const { t } = useTranslation();
  const [parts, setParts] = useState<TimeParts | null>(null);

  useEffect(() => {
    const expiresAtMs = Date.parse(expiresAt);
    if (!Number.isFinite(expiresAtMs)) return;

    const tick = () => setParts(computeTimeParts(expiresAtMs, Date.now()));
    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!parts) return null;

  const segments: Array<{ value: string; unit: string }> = [
    { value: String(parts.days), unit: t("countdown_unit_days") },
    { value: pad2(parts.hours), unit: t("countdown_unit_hours") },
    { value: pad2(parts.minutes), unit: t("countdown_unit_minutes") },
    { value: pad2(parts.seconds), unit: t("countdown_unit_seconds") },
  ];

  return (
    <div className={`${styles.countdown} ${className ?? ""}`}>
      {showIcon ? <Icon name={ICONS.CLOCK} className={styles.icon} /> : null}
      {parts.expired ? (
        <span className={styles.expired}>{t("header_expired")}</span>
      ) : (
        <>
          <span className={styles.label}>{t("header_expires_in")}</span>
          <span className={styles.panel}>
            {segments.map((segment, idx) => (
              <span key={idx} className={styles.segment}>
                <span className={styles.digits}>{segment.value}</span>
                <span className={styles.unit}>{segment.unit}</span>
              </span>
            ))}
          </span>
        </>
      )}
    </div>
  );
};
