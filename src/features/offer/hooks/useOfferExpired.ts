"use client";

import { useEffect, useState } from "react";
import { isOfferExpired } from "@/features/offer/lib/offerExpiration";

export const useOfferExpired = (expiresAt?: string): boolean => {
  const [expired, setExpired] = useState(() =>
    expiresAt ? isOfferExpired(expiresAt) : false,
  );

  useEffect(() => {
    if (!expiresAt) {
      setExpired(false);
      return;
    }

    const expiresAtMs = Date.parse(expiresAt);
    if (!Number.isFinite(expiresAtMs)) {
      setExpired(false);
      return;
    }

    const tick = () => setExpired(Date.now() >= expiresAtMs);
    tick();

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return expired;
};
