export const OFFER_VALIDITY_DAYS = 30;

export const isOfferExpired = (expiresAt: string, now = Date.now()): boolean => {
  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) {
    return false;
  }

  return now >= expiresAtMs;
};
